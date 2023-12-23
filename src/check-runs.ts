import { RestEndpointMethodTypes } from "../deps.ts";
import { BaseGithubContext, GithubClient } from "./types.ts";

export interface CheckRunRequest {
  name: string;
  head_sha: string;
}

export interface CheckRunContext extends BaseGithubContext {}

export class CheckRuns {
  readonly client;
  readonly owner;
  readonly repo;

  constructor(client: GithubClient, { owner, repo }: CheckRunContext) {
    this.client = client;
    this.owner = owner;
    this.repo = repo;
  }

  async createCheckRun(request: RestEndpointMethodTypes["checks"]["create"]["parameters"]) {
    return await this.client.rest.checks.create({
      ...request,
      owner: this.owner,
      repo: this.repo,
    });
  }

  async updateCheckRun(request: RestEndpointMethodTypes["checks"]["update"]["parameters"]) {
    return await this.client.rest.checks.update({
      ...request,
      owner: this.owner,
      repo: this.repo,
    });
  }
}
