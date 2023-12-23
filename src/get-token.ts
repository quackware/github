import { createAppAuth, createTokenAuth } from "../deps.ts";
// Endpoints,
// type ListInstallationsResponse = Endpoints["GET /app/installations"]["response"];

export interface AppTokenCredentials {
  /** May be base64 encoded */
  privateKey: string;
  appId: string;
  /**
   * TODO: We can support installation type without providing the installationId
   *
   * @default '{ type: "installation", installationId: 23561942 }'
   */
  appAuth?: { type: "app" } | { type: "installation"; installationId: number };
}

/**
 * Retrieve a valid github access token authenticated to the Github app associated with the provided credentials.
 * This is the recommended way to authenticate compared to access tokens. The GitHub token has
 * full permissions and can be used to perform organization wide actions.
 */
export async function getAppToken(creds: AppTokenCredentials) {
  let { privateKey, appId, appAuth } = creds;
  if (!privateKey.trim().startsWith("-----")) {
    privateKey = atob(privateKey);
  }
  const auth = createAppAuth({
    appId,
    privateKey,
  });

  appAuth ??= { type: "installation", installationId: 23561942 };

  if (appAuth.type === "app") {
    return await auth({
      type: "app",
    }).then((a) => a.token);
  } else {
    return await auth({
      type: "installation",
      installationId: appAuth.installationId,
    }).then((i) => i.token);
  }
}

export interface GithubTokenCredentials {
  githubToken: string;
}

export async function getGithubTokenToken(creds: GithubTokenCredentials) {
  const auth = createTokenAuth(creds.githubToken);
  return await auth().then((i) => i.token);
}
