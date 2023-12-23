import { BaseGithubContext, GithubClient, GithubLabel } from "./types.ts";

export interface IssuesContext extends BaseGithubContext {}

export class Issues {
  readonly octokit;
  protected owner;
  protected repo;

  constructor(client: GithubClient, context: IssuesContext) {
    this.octokit = client;
    this.owner = context.owner;
    this.repo = context.repo;
  }

  setContext(context: Partial<IssuesContext>) {
    this.repo = context.repo ?? this.repo;
    this.owner = context.owner ?? this.owner;
    return this;
  }

  createIssue(
    request: { title: string; body?: string; assignees?: string[]; labels?: GithubLabel[] },
    overrides: { owner?: string; repo?: string } = {},
  ) {
    return this.octokit.rest.issues.create({
      ...request,
      owner: overrides.owner ?? this.owner,
      repo: overrides.repo ?? this.repo,
    });
  }

  createIssueComment(
    request: { issue_number: number; body: string },
    overrides: { owner?: string; repo?: string } = {},
  ) {
    return this.octokit.rest.issues.createComment({
      ...request,
      owner: overrides.owner ?? this.owner,
      repo: overrides.repo ?? this.repo,
    });
  }

  updateIssueComment(request: { comment_id: number; body: string }, overrides: { owner?: string; repo?: string } = {}) {
    return this.octokit.rest.issues.updateComment({
      ...request,
      owner: overrides.owner ?? this.owner,
      repo: overrides.repo ?? this.repo,
    });
  }

  async listIssues(repo: string, owner: string) {
    return await this.octokit.rest.issues.listForRepo({ repo, owner });
  }

  getCreateIssueTemplate(templateName: string) {
    return `https://github.com/${this.owner}/${this.repo}/issues/new?template=${templateName}` as const;
  }
}
