import { createAppOctokit } from "../mod.ts";
import { assert, assertEquals } from "./test-deps.ts";

const { QUACKBOT_PRIVATE_KEY, QUACKBOT_APP_ID } = Deno.env.toObject();

Deno.test("octokit", async (t) => {
  await t.step("create octokit and hit basic api", async () => {
    const octokit = await createAppOctokit({ privateKey: QUACKBOT_PRIVATE_KEY, appId: QUACKBOT_APP_ID });

    assert(octokit);

    const arts = await octokit.rest.actions.listArtifactsForRepo({ owner: "quackware", repo: "quackware" });

    assertEquals(arts.status, 200);
  });
});
