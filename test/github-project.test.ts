// import { createAppOctokit, GithubProjects } from "../mod.ts";
// import { assert, assertEquals, assertSnapshot } from "./test-deps.ts";

// const { QUACKBOT_PRIVATE_KEY, QUACKBOT_APP_ID } = Deno.env.toObject();

// Deno.test("github-project", async (t) => {
//   await t.step("GithubProject", async () => {
//     const octokit = await createAppOctokit({ privateKey: QUACKBOT_PRIVATE_KEY, appId: QUACKBOT_APP_ID });

//     const service = new GithubProjects({ octokit, org: "quackware" });

//     assert(service);
//     const project = service.loadProject({ projectNumber: 1 });
//     assertEquals(project.fields["status"], "Status");
//     assertEquals(project.org, "quackware");

//     const projectItem = await project.items.get("PNI_lADOBeSG_84AArmjzgA2ob8");
//     await assertSnapshot(t, projectItem);
//   });
// });
