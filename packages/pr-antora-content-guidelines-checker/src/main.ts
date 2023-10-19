import * as core from "@actions/core";
import * as github from "@actions/github";
import { ActionResult, Status, ValidationStep } from "./validation";
import {
  getModifiedFiles,
  publishComment,
  isCommentExist,
  deleteComment,
} from "./github-utils";
import { AttributesCheckingStep } from "./steps/AttributesCheckingStep";
import { ForbiddenPatternStep } from "./steps/ForbiddenPatternStep";
import { GitHub } from "@actions/github/lib/utils";

const template = "<!-- previewCommentContributionChecker -->\n";

async function run(): Promise<void> {
  try {
    const token = core.getInput("github-token");
    const octokit: InstanceType<typeof GitHub> = github.getOctokit(token);
    let actionResult: ActionResult[] = [];
    const modifiedFiles: string[] = await getModifiedFiles(octokit);

    const filesToCheckInput = core.getInput("files-to-check").split(",");
    const attributesToCheckInput = core
      .getInput("attributes-to-check")
      .split(",");
    const forbiddenPatternToCheckInput = core
      .getInput("forbidden-pattern-to-check")
      .split(",");
    let steps: Array<ValidationStep> = [];

    if (core.getInput("attributes-to-check") !== "") {
      steps.push(
        new AttributesCheckingStep(
          modifiedFiles,
          filesToCheckInput,
          attributesToCheckInput
        )
      );
    }
    if (core.getInput("forbidden-pattern-to-check") !== "") {
      steps.push(
        new ForbiddenPatternStep(
          modifiedFiles,
          filesToCheckInput,
          forbiddenPatternToCheckInput
        )
      );
    }

    core.info("Input parameters:");
    core.info(`* files-to-check: ${filesToCheckInput.join(", ")}`);
    core.info(`* attributes-to-check: ${attributesToCheckInput}`);
    core.info(`* forbidden-pattern-to-check: ${forbiddenPatternToCheckInput}`);

    for (const step of steps) {
      core.debug(`------- ${step.name} -------`);
      let stepResult = await step.validate(octokit, modifiedFiles);
      actionResult.push(stepResult);
    }

    core.setOutput("checker-result", actionResult);

    const filterResultOnError = actionResult.filter(
      (result) => result.status === Status.ERROR
    );

    const prNumber = github?.context?.payload?.pull_request?.number;
    if (filterResultOnError.length >= 1) {
      core.setFailed(
        `This PR did not meet all the guidelines, see PR comments for details.`
      );
      if (prNumber) {
        let commentBody: string =
          template + "# Contribution Guidelines checks\n";
        commentBody += `The content of the files modified by this Pull Request doesn't match the Contribution Guidelines. \n
                        Please update the following files.\n`;
        steps.forEach((step) => {
          commentBody += step.formatCommentBody();
        });
        core.info(`Publish comment for PR #${prNumber}`);
        await publishComment(octokit, template, commentBody, prNumber);
      }
    } else {
      const { exists, id } = await isCommentExist({
        octokit,
        template,
        prNumber,
      });
      core.info(`The Contribution follows the guideline.`);
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
