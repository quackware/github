import { $, concat, iterateReader, readerFromStreamReader, Untar } from "../deps.ts";
import { WillTheRealOctokitPleaseStandup } from "./octokit-token.ts";

export interface DownloadRepoArgs {
  owner: string;
  repo: string;
  /** @default "master" */
  ref?: string;
}

const GZIP_CONTENT_TYPES = ["application/x-gzip", "application/x-tar", "application/x-tar-gz"];

export class GithubLister {
  readonly client;

  constructor(options: { fetcher: WillTheRealOctokitPleaseStandup }) {
    this.client = options.fetcher;
  }

  async list(request: Request) {
    const url = new URL(request.url);
    const resp = await this.client.request({ baseUrl: url.origin, url: url.pathname, method: request.method });
    return new Response(resp.data);
  }

  /** Downloads a tarball archive and saves it to the provided `outDir` with a `.tgz` extension */
  async downloadTarballArchive(args: DownloadRepoArgs, outDir: string) {
    const filePath = $.path.join(outDir, this.getBasename(args) + ".tgz") as `${string}.tgz`;
    $.fs.ensureFileSync(filePath);
    const file = Deno.openSync(filePath, { create: true, write: true });

    await this.client.rest.repos.downloadTarballArchive({
      owner: args.owner,
      repo: args.repo,
      ref: undefined as any,
      headers: {
        accept: "application/vnd.github+json",
      },
    })
      .then((readdir) => fetch(readdir.url))
      .then((resp) => {
        if (!resp.ok || resp.body === null) {
          throw new Error("Failed to fetch");
        }
        return resp.body.pipeTo(file.writable);
      });

    return filePath;
  }

  async *extractTarballFiles(fileUrl: URL, include: string[]) {
    const reader = await fetch(fileUrl).then((resp) => {
      if (!resp.ok || resp.body === null) {
        throw new Error("Failed to fetch");
      }
      const contentType = resp.headers.get("content-type") ?? "";
      if (
        fileUrl.pathname.endsWith("tgz") || fileUrl.pathname.endsWith("tar.gz") ||
        GZIP_CONTENT_TYPES.includes(contentType)
      ) {
        return readerFromStreamReader(resp.body.pipeThrough(new DecompressionStream("gzip")).getReader());
      } else {
        return readerFromStreamReader(resp.body.getReader());
      }
    });

    const untar = new Untar(reader);

    const regexes = include.map((i) => $.path.globToRegExp(i));

    for await (const entry of untar) {
      // Always first entry that we ignore
      if (entry.fileName === "pax_global_header") {
        continue;
      }

      // We always dont care about the first directory entry, +1 to remove the leading `/` to make globs better
      const fileName = entry.fileName.substring(entry.fileName.indexOf("/") + 1);
      if (fileName === "") {
        // root directory
        continue;
      }

      // Now we can perform matching
      if (entry.type !== "directory" && regexes.some((r) => r.test(fileName))) {
        $.logStep("Matched", fileName);
        const chunks: Uint8Array[] = [];
        for await (const chunk of iterateReader(entry)) {
          chunks.push(chunk);
        }
        yield {
          fileName,
          data: concat(...chunks),
        };
      } else {
        $.logError("Ignored", fileName);
        await entry.discard();
      }
    }
  }

  async listOrgRepos(org: string) {
    const repos = await this.client.rest.repos.listForOrg({
      org,
      headers: { accept: "application/vnd.github+json" },
    });
    return repos;
  }

  getBasename(args: DownloadRepoArgs) {
    return `${args.owner}/${args.repo}-${args.ref ?? "master"}` as const;
  }
}
