import { WillTheRealOctokitPleaseStandup } from "./octokit-token.ts";
export type GithubClient = WillTheRealOctokitPleaseStandup;

export interface BaseGithubContext {
  /** Owner of the repo */
  readonly owner: string;
  /** Repository name */
  readonly repo: string;
}

export interface GithubLabel {
  id: number;
  name: string;
  description: string | null;
  color: string;
}
