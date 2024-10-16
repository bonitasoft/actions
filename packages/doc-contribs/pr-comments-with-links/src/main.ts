import * as core from "@actions/core";
import { GitHub } from "@actions/github/lib/utils";
import * as github from "@actions/github";
import {
  FILE_STATE,
  FileInfo,
  getFilesFromPR,
  publishComment,
} from "actions-common";
import { CommentsWithLinks, Links } from "./CommentsWithLinks";

const template = "<!-- previewLinksCheck-->\n";

export function groupFilesByChangeType(files: FileInfo[]) {
  const filesWithUpdatedContent = files
    .filter((file) =>
      [FILE_STATE.MODIFIED, FILE_STATE.ADDED, FILE_STATE.RENAMED].includes(
        file.status
      )
    )
    .map((file) => file.filename);
  core.debug(
    `Files with updated content: ${filesWithUpdatedContent.join(", ")}`
  );

  const filesRequiringRedirects = files
    .filter((file) =>
      [FILE_STATE.REMOVED, FILE_STATE.RENAMED].includes(file.status)
    )
    .map((file) =>
      file.status == FILE_STATE.REMOVED
        ? file.filename
        : file.previous_filename!
    );
  core.debug(
    `Files requiring redirects: ${filesRequiringRedirects.join(", ")}`
  );

  return { filesWithUpdatedContent, filesRequiringRedirects };
}

export async function run(): Promise<void> {
  core.debug("Running pr-comments-with-links action");
  try {
    const token = core.getInput("github-token");
    const componentName = core.getInput("component-name");
    const siteUrl = core.getInput("site-url");
    const octokit: InstanceType<typeof GitHub> = github.getOctokit(token);

    const prFiles: FileInfo[] = await getFilesFromPR(octokit, [
      FILE_STATE.REMOVED,
      FILE_STATE.MODIFIED,
      FILE_STATE.ADDED,
      FILE_STATE.RENAMED,
    ]);
    core.debug(`PR files: ${prFiles.map((file) => file.filename).join(", ")}`);

    const { filesWithUpdatedContent, filesRequiringRedirects } =
      groupFilesByChangeType(prFiles);

    const commentsWithLinks = new CommentsWithLinks(template);
    // We only have a single version for preview (latest)
    // TODO: Handle "pre-release" (next)
    let version = "latest";
    const links: Links = {
      updated: commentsWithLinks.prepareLinks({
        files: filesWithUpdatedContent,
        siteUrl: siteUrl,
        component: componentName,
        version: version,
      }),
      requiringRedirects: commentsWithLinks.prepareLinks({
        files: filesRequiringRedirects,
        siteUrl: siteUrl,
        component: componentName,
        version: version,
      }),
    };

    if (links.requiringRedirects.length === 0 && links.updated.length === 0) {
      core.info(`⚠️ No updated or deleted pages were detected`);
    } else {
      const message = commentsWithLinks.buildComment(links);

      const prNumber = github?.context?.payload?.pull_request?.number;
      if (prNumber) {
        const comment = await publishComment(
          octokit,
          template,
          message,
          prNumber
        );
        core.info(`📝 Publish comment for PR #${prNumber}`);
        core.info(`💡 See ${comment.data.html_url} for more details`);
      }
    }
  } catch (error) {
    //@ts-ignore
    core.setFailed(error.message);
  }
}

run();
