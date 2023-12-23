import { Octokit, restEndpointMethods } from "../deps.ts";
import { AppTokenCredentials, getAppToken, getGithubTokenToken, GithubTokenCredentials } from "./get-token.ts";

/**
 * Note that this Octokit must list installations and request a token to really
 * do anything
 */
export async function createAppOctokit(creds: AppTokenCredentials) {
  const token = await getAppToken(creds);

  const octo = new Octokit({
    auth: token,
    userAgent: "QuackBot <https://quack.software>",
  });

  return Object.assign(octo, restEndpointMethods(octo));
}

export async function createGithubTokenOctokit(creds: GithubTokenCredentials) {
  const token = await getGithubTokenToken(creds);
  const tokenOctokit = new Octokit({
    auth: token,
  });
  return Object.assign(tokenOctokit, restEndpointMethods(tokenOctokit));
}

export type WillTheRealOctokitPleaseStandup = Awaited<ReturnType<typeof createGithubTokenOctokit>>;
