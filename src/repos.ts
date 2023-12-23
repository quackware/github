import { isRecord } from "../deps.ts";
import { GithubClient } from "./types.ts";

export interface ReposContext {
  /** Organisation */
  readonly org: string;
}

export interface ListReposRequest {
  org?: string;
  type?: "all" | "public" | "private" | "forks" | "sources" | "member" | "internal";
}

export interface BaseRequest {
  owner: string;
  repo: string;
  /** @default "master" */
  ref?: string;
}

export interface GetContentRequest extends BaseRequest {
  /** Path to the content */
  path: string;
}

export class Repos {
  readonly octokit;
  readonly api;

  protected org;

  constructor(client: GithubClient, context: ReposContext) {
    this.octokit = client;
    this.org = context.org;
    this.api = this.octokit.rest.repos;
  }

  async listRepositories(request: ListReposRequest = {}) {
    const org = request.org ?? this.org;
    return await this.api.listForOrg({ org, type: request.type });
  }

  async listForksForOrg(request: { org?: string } = {}) {
    return await this.listRepositories({
      ...request,
      type: "forks",
    }).then(({ data }) => data);
  }

  async listForksForUser(username: string) {
    const forks = await this.api.listForUser({ username, visibility: "all" }).then(({ data }) =>
      data.filter((d) => d.fork)
    );
    return forks.map((fork) => {
      const mergeUpstream = (fallbackBranch = "master") =>
        this.mergeUpstream({
          owner: username,
          repo: fork.name,
          branch: fork.default_branch ?? fallbackBranch,
        });
      return Object.assign(fork, { mergeUpstream });
    });
  }

  async mergeUpstream(request: { owner: string; repo: string; branch: string }) {
    return await this.api.mergeUpstream(request);
  }

  async getContent(request: GetContentRequest, download?: false | undefined): Promise<{ url: string; sha: string }>;
  async getContent(request: GetContentRequest, download: true): Promise<{ url: string; sha: string; content: string }>;
  async getContent(
    request: GetContentRequest,
    download?: boolean,
  ): Promise<{ url: string; sha: string; content?: string }> {
    const ref = request.ref ?? "master";
    const resp = await this.api.getContent({
      mediaType: { format: "raw" },
      owner: request.owner,
      repo: request.repo,
      path: request.path,
      ref,
    });

    const sha = isRecord(resp.data) ? resp.data.sha : "";

    if (download) {
      const content = await fetch(resp.url).then((r) => r.text());
      return {
        url: resp.url,
        content,
        sha,
      };
    } else {
      return {
        url: resp.url,
        sha,
      };
    }
  }

  async getReadme(request: BaseRequest) {
    const ref = request.ref ?? "master";
    return await this.api.getReadme({
      mediaType: { format: "raw" },
      ...request,
      ref,
    });
  }
}
