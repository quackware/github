import { dedent } from "../deps.ts";
import { createAppOctokit, GithubProvider } from "../mod.ts";
import { assertEquals, assertExists } from "./test-deps.ts";

const { QUACKBOT_PRIVATE_KEY, QUACKBOT_APP_ID } = Deno.env.toObject();

Deno.test("CheckRuns With GithubProvider", async (t) => {
  const provider = await createAppOctokit({
    privateKey: QUACKBOT_PRIVATE_KEY,
    appId: QUACKBOT_APP_ID,
  }).then((octokit) => new GithubProvider(octokit, { owner: "quackware", repo: "quackbot-test-repo" }));

  await t.step("create a check run, post update on issue, finish test run", async () => {
    /** Create the run */
    const createdRun = await provider.checks.createCheckRun({
      name: "playwright-test-suite",
      head_sha: "e5386b57c586a9298719da957e9cd06e51278f25",
      status: "queued",
    });

    assertExists(createdRun);
    assertExists(createdRun.data.id);

    /** Create post on issue */
    const createdComment = await provider.issues.createIssueComment({
      body: `# Heya!\n\n Check run #${createdRun.data.id} was started!`,
      repo: "quackbot-test-repo",
      issue_number: 4,
    });

    assertEquals(createdComment.data.user?.login, "quack-bot[bot]");

    assertExists(createdComment);
    assertExists(createdComment.data.id);

    /** Update test to running */
    const updatedRun = await provider.checks.updateCheckRun({
      name: "playwright-test-suite",
      check_run_id: createdRun.data.id,
      status: "in_progress",
    });

    assertEquals(createdRun.data.id, updatedRun.data.id);

    assertExists(updatedRun);
    assertExists(updatedRun.data.id);

    /** Update issue comment */
    const updatedComment = await provider.issues.updateIssueComment({
      name: "playwright-test-suite",
      body: dedent`# Quack!\n\n ~~Check run #${createdRun.data.id.toString()} has been scheduled!~~\n\n
             Check run #${updatedRun.data.id.toString()} is now running!`,
      comment_id: createdComment.data.id,
    });

    assertExists(updatedComment);
    assertExists(updatedComment.data.id);

    /** Complete the check run */
    const finishedRun = await provider.checks.updateCheckRun({
      name: "playwright-test-suite",
      check_run_id: createdRun.data.id,
      status: "completed",
      conclusion: "success",
    });

    assertExists(finishedRun);
    assertExists(finishedRun.data.id);

    /** Final edit on the issue comment*/
    const finishedComment = await provider.client.rest.issues.updateComment({
      owner: "quackware",
      repo: "quackbot-test-repo",
      name: "playwright-test-suite",
      body: dedent`
      # Quack!

      ~~Check run #${createdRun.data.id.toString()} has been scheduled!~~\n\n

      ~~Check run #${updatedRun.data.id.toString()} is now running!

      Check Run ${finishedRun.data.id.toString()} finished with status ${finishedRun.data.conclusion ?? "unknown"}`,
      comment_id: updatedComment.data.id,
    });

    assertExists(finishedComment);
    assertExists(finishedComment.data.id);
  });
});
