import { createAppOctokit } from "../mod.ts";
import { Repos } from "../src/repos.ts";
import { assert, assertExists } from "./test-deps.ts";

const { QUACKBOT_PRIVATE_KEY, QUACKBOT_APP_ID } = Deno.env.toObject();

Deno.test("Repos", async (t) => {
  const octokit = await createAppOctokit({ privateKey: QUACKBOT_PRIVATE_KEY, appId: QUACKBOT_APP_ID });

  await t.step("init", () => {
    const repos = new Repos(octokit, { org: "quackware" });
    assertExists(repos);
    assertExists(repos.api);
  });

  await t.step("listForksForOrg", async () => {
    const repos = new Repos(octokit, { org: "quackware" });
    const forks = await repos.listForksForOrg();
    assertExists(forks);
    // assert(forks.length > 0);
  });

  await t.step("listForksForUser", async () => {
    const repos = new Repos(octokit, { org: "quackware" });
    const forks = await repos.listForksForUser("curtislarson");
    assertExists(forks);

    assert(forks.length > 0);
    for (const fork of forks) {
      assertExists(fork.mergeUpstream);
    }
  });
});
