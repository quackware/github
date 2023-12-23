import { createAppOctokit } from "../mod.ts";
import { Issues } from "../src/issues.ts";
import { IssueFixture } from "./__fixtures__/github.ts";
import { assert, assertEquals, assertStringIncludes } from "./test-deps.ts";

const { QUACKBOT_PRIVATE_KEY, QUACKBOT_APP_ID } = Deno.env.toObject();

Deno.test("github issues api", async (t) => {
  const octokit = await createAppOctokit({ privateKey: QUACKBOT_PRIVATE_KEY, appId: QUACKBOT_APP_ID });
  const issues = new Issues(octokit, { owner: "quackware", repo: "quackware" });

  await t.step("listIssues", async () => {
    const list = await issues.listIssues("quackware", "quackware");

    assert(list.data.length > 0);
  });

  await t.step("createIssueComment then update", async () => {
    const res = await issues.createIssueComment(
      {
        issue_number: IssueFixture.issue_number,
        body: `## QUACK! \n\n This quack was brought to your attention at ${new Date().toISOString()}`,
      },
      { repo: "quackbot-test-repo" },
    );

    assert(res.data != null);
    assert(res.data.id != null);
    assertStringIncludes(res.data.issue_url, IssueFixture.issue_number + "");
  });

  await t.step("updateIssueComment", async () => {
    const id = crypto.randomUUID();
    const body = `Update ${id}`;
    const updateRes = await issues.updateIssueComment({
      comment_id: IssueFixture.comment_id,
      body,
    }, { repo: "quackbot-test-repo" });
    assert(updateRes != null);
    assert(updateRes.data != null);
    assertEquals(updateRes.data.body, body);
  });
});
