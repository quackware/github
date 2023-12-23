import { Octokit, restEndpointMethods } from "../deps.ts";
import { getAppToken } from "../mod.ts";
import { assert, assertEquals } from "./test-deps.ts";

const { QUACKBOT_PRIVATE_KEY, QUACKBOT_APP_ID } = Deno.env.toObject();

Deno.test("getAppToken", async (t) => {
  await t.step("getAppToken", async () => {
    const token = await getAppToken({ privateKey: QUACKBOT_PRIVATE_KEY, appId: QUACKBOT_APP_ID });

    assert(token);
    assert(typeof token === "string");

    const kit = new Octokit({ auth: token });
    const octo = Object.assign(kit, { rest: restEndpointMethods(kit).rest });
    const resp = await octo.rest.issues.listCommentsForRepo({ owner: "quackware", repo: "quackware" });

    assertEquals(resp.status, 200);
  });
});
