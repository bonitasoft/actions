import * as core from "@actions/core";
import * as github from "@actions/github";
import {
  deleteComment,
  FILE_STATE,
  getFilesFromPR,
  isCommentExist,
  publishComment,
} from "./github-utils";

import { GitHub } from "@actions/github/lib/utils";

const template = '<!-- previewLinksCheck-->\n';

async function run(): Promise<void> {
  try {
    const token = core.getInput("github-token");
    const octokit: InstanceType<typeof GitHub> = github.getOctokit(token);

    // The checks are done on the content of the files, so they must not be applied to deleted files whose content is no longer available
    const modifiedFiles: string[] = await getFilesFromPR(octokit, [
      FILE_STATE.MODIFIED,
      FILE_STATE.ADDED,
    ]);

    const filesToCheckInput = core.getInput("files-to-check").split(",");

    // core.startGroup("Input parameters:");
    // core.info(`* files-to-check: ${filesToCheckInput.join(", ")}`);
    // core.info(`* attributes-to-check: ${attributesToCheckInput}`);
    // core.info(`* forbidden-pattern-to-check: ${forbiddenPatternToCheckInput}`);
    // core.endGroup();

    /**
     * START the functional validation
     */

    /**
     * END of the functional validation
     */

    /**
     * Write comment on PR
     */
    const prNumber = github?.context?.payload?.pull_request?.number;

    let comment;
    if (prNumber) {
      let commentBody: string =
          template + "# Contribution Guidelines checks\n";
      commentBody += `The content of the files modified by this Pull Request doesn't match the Contribution Guidelines. \n \n Please update the following files.\n`;

      comment = await publishComment(
          octokit,
          template,
          commentBody,
          prNumber
      );
      core.info(`📝 Publish comment for PR #${prNumber}`);
      core.info(`💡 See ${comment.data.html_url} for more details`);
    }
    core.setFailed(
        `❌ This PR did not meet all the guidelines, see PR comments for details. (${comment.data.html_url})`
    );
  } catch (error) {
    //@ts-ignore
    core.setFailed(error.message);
  }

}

run();
