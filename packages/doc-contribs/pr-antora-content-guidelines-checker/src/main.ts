import * as core from "@actions/core";
import * as github from "@actions/github";
import {
  ActionResult,
  AvailableStep,
  Status,
  ValidationStep,
} from "./validation";
import {
  deleteComment,
  FILE_STATE,
  FileInfo,
  getFilesFromPR,
  isCommentExist,
  publishComment,
} from "actions-common";
import { AttributesCheckingStep } from "./steps/AttributesCheckingStep";
import { ForbiddenPatternStep } from "./steps/ForbiddenPatternStep";
import { GitHub } from "@actions/github/lib/utils";
import { PageFilenameStep } from "./steps/PageFilenameStep";

const template = "<!-- previewCommentContributionChecker -->\n";

async function run(): Promise<void> {
  try {
    const token = core.getInput("github-token");
    const octokit: InstanceType<typeof GitHub> = github.getOctokit(token);

    let actionResult: ActionResult[] = [];
    // The checks are done on the content of the files, so they must not be applied to deleted files whose content is no longer available
    const modifiedFiles: FileInfo[] = await getFilesFromPR(octokit, [
      FILE_STATE.MODIFIED,
      FILE_STATE.ADDED,
      FILE_STATE.RENAMED,
    ]);

    const simpleModifiedFiles = modifiedFiles.map((file) => file.filename);

    const filesToCheckInput = core.getInput("files-to-check").split(",");
    const attributesToCheckInput = core
      .getInput("attributes-to-check")
      .split(",");
    const forbiddenPatternToCheckInput = core
      .getInput("forbidden-pattern-to-check")
      .split(",");

    const stepsToSkip: string[] = core
      .getInput("steps-to-skip")
      .split(",")
      .map((item) => item.trim());

    let steps: Array<ValidationStep> = [];

    if (
      !stepsToSkip.includes(AvailableStep.AttributeChecking) &&
      core.getInput("attributes-to-check") !== ""
    ) {
      steps.push(
        new AttributesCheckingStep(
          simpleModifiedFiles,
          filesToCheckInput,
          attributesToCheckInput
        )
      );
    }
    if (
      !stepsToSkip.includes(AvailableStep.ForbiddenPattern) &&
      core.getInput("forbidden-pattern-to-check") !== ""
    ) {
      steps.push(
        new ForbiddenPatternStep(
          simpleModifiedFiles,
          filesToCheckInput,
          forbiddenPatternToCheckInput
        )
      );
    }

    if (!stepsToSkip.includes(AvailableStep.PageFilename)) {
      steps.push(new PageFilenameStep(simpleModifiedFiles, filesToCheckInput));
    }
    core.startGroup("Input parameters:");
    core.info(`* files-to-check: ${filesToCheckInput.join(", ")}`);
    core.info(`* attributes-to-check: ${attributesToCheckInput}`);
    core.info(`* forbidden-pattern-to-check: ${forbiddenPatternToCheckInput}`);
    core.info(`* steps-to-skip: ${stepsToSkip}`);
    core.endGroup();

    for (const step of steps) {
      core.debug(`------- ${step.name} -------`);
      let stepResult = await step.validate(octokit, simpleModifiedFiles);
      core.debug(`Validation status: ${stepResult?.status}`);
      actionResult.push(stepResult);
    }
    core.setOutput("checker-result", actionResult);

    const errorsStep = steps.filter(
      (step) => step.stepResult?.status === Status.ERROR
    );
    const prNumber = github?.context?.payload?.pull_request?.number;
    if (errorsStep.length >= 1) {
      core.info(`❌ The following checks failed: `);
      errorsStep.forEach((result) => {
        core.info(` * ${result.name}`);
      });
      let comment;
      if (prNumber) {
        let commentBody: string =
          template + "# Contribution Guidelines checks\n";
        commentBody += `The content of the files modified by this Pull Request doesn't match the Contribution Guidelines. \n \n Please update the following files.\n`;
        steps.forEach((step) => {
          commentBody += step.formatCommentBody();
        });
        comment = await publishComment(
          octokit,
          template,
          commentBody,
          prNumber
        );
        core.info(`📝 Publish comment for PR #${prNumber}`);
        core.info(`💡 See ${comment.data.html_url} for more details`);

        core.setFailed(
          `❌ This PR did not meet all the guidelines, see PR comments for details. (${comment.data.html_url})`
        );
      }
    } else {
      const { exists, id } = await isCommentExist({
        octokit,
        template,
        prNumber,
      });
      core.info(`✅ The Contribution follows the guideline. Well done !`);
      if (exists && id) {
        core.info(`Delete oldest comment for PR #${prNumber}`);
        await deleteComment({ octokit, commentIdToDelete: id });
      }
    }
  } catch (error) {
    //@ts-ignore
    core.setFailed(error.message);
  }
}

run();
