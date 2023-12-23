import { GithubProject } from "../deps.ts";
import { WillTheRealOctokitPleaseStandup } from "./octokit-token.ts";

export interface GithubProjectConfig {
  octokit: WillTheRealOctokitPleaseStandup;
  owner: string;
  projectNumber?: number;
}

export class GithubProjects {
  readonly octokit;
  readonly owner;

  currentProject;
  items;

  constructor(config: GithubProjectConfig) {
    this.octokit = config.octokit;
    this.owner = config.owner;
    if (config.projectNumber != null) {
      this.currentProject = new GithubProject({
        number: config.projectNumber,
        octokit: this.octokit,
        owner: this.owner,
      });
      this.items = this.currentProject.items;
    }
  }

  loadProject(options: { projectNumber: number }) {
    this.currentProject = new GithubProject({
      number: options.projectNumber,
      octokit: this.octokit,
      owner: this.owner,
    });
    this.items = this.currentProject.items;
    return this.currentProject;
  }
}
