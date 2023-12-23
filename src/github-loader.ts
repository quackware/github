import { WillTheRealOctokitPleaseStandup } from "./octokit-token.ts";

export class GithubLoader {
  readonly octokit;
  constructor({ octokit }: { octokit: WillTheRealOctokitPleaseStandup }) {
    this.octokit = octokit;
  }

  async loadSingleFile(url: string) {
    const fixed = this.resolveRawUrl(url);
    return await fetch(fixed).then((val) => {
      if (!val.ok) {
        console.error(`Unable to fetch ${url}`, val.statusText);
        return null;
      }
      return val.text();
    });
  }

  resolveRawUrl(url: string) {
    const u = new URL(url);
    if (u.hostname !== "raw.githubusercontent.com") {
      u.hostname = "raw.githubusercontent.com";
    }
    return u.toString();
  }
}
