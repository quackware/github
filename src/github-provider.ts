import { CheckRuns } from "./check-runs.ts";
import { AppTokenCredentials } from "./get-token.ts";
import { GithubLister } from "./github-lister.ts";
import { GithubLoader } from "./github-loader.ts";
import { GithubProjects } from "./github-project.ts";
import { Issues } from "./issues.ts";
import { createAppOctokit, WillTheRealOctokitPleaseStandup } from "./octokit-token.ts";
import { Repos } from "./repos.ts";

export interface GithubProviderInit {
  privateKey: string;
  appId: string;
}

/**
 * Github provider configuration
 */
export interface GithubProviderConfig {
  /**
   * Github owner
   *
   * @default "quackware"
   */
  owner?: string;
  /**
   * Github Repository
   *
   * @default "quackware"
   */
  repo?: string;
  /** ProjectsV2 number */
  projectNumber?: number;
  [key: string]: unknown;
}

export interface GithubProviderContext {
  client: WillTheRealOctokitPleaseStandup;
}

export class GithubProvider {
  static async initialize(
    creds: AppTokenCredentials,
    config: GithubProviderConfig = {},
  ) {
    const octokit = await createAppOctokit(creds);
    return new GithubProvider(octokit, config);
  }

  readonly owner;
  readonly repo;
  readonly issues;
  readonly repos;
  readonly checks;
  readonly projects;
  readonly lister;
  readonly loader;

  constructor(
    client: WillTheRealOctokitPleaseStandup,
    config: GithubProviderConfig = {},
  ) {
    this.owner = config.owner ?? "quackware";
    this.repo = config.repo ?? "quackware";

    this.issues = new Issues(client, { owner: this.owner, repo: this.repo });
    this.checks = new CheckRuns(client, { owner: this.owner, repo: this.repo });
    this.projects = new GithubProjects({
      octokit: client,
      owner: this.owner,
      projectNumber: config.projectNumber,
    });
    this.loader = new GithubLoader({ octokit: client });
    this.lister = new GithubLister({ fetcher: client });
    this.repos = new Repos(client, { org: this.owner });
  }
}
