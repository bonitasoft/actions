import {
  ActionResult,
  ValidationResult,
  Status,
  ValidationStep,
} from "../validation";
import { getFileContent } from "actions-common";
import * as core from "@actions/core";
import { GitHub } from "@actions/github/lib/utils";

type PatternCheckResult = {
  pattern: string;
} | null;

/**
 * A class that extends the ValidationStep class to validate if files contain any forbidden patterns.
 * The files must be located in the modules/ directory.
 *
 * @property {string} name - The name of the validation step.
 * @property {string} description - The description of the validation step.
 * @property {string[]} patternChecking - The patterns to check in the files.
 * @property {ActionResult | null} stepResult - The result of the validation step.
 * @property {string[]} files - The files to validate.
 */
export class ForbiddenPatternStep extends ValidationStep {
  name: string;
  description: string;
  patternChecking: string[] = [];
  stepResult: ActionResult | null;
  files: string[];

  constructor(
    files: string[],
    extensionsToCheck: string[],
    patternChecking: string[]
  ) {
    super();
    this.name = "Forbidden pattern validation";
    this.description = "Some patterns are forbidden in the following files:";
    this.stepResult = null;
    this.patternChecking = patternChecking;
    this.files = files.filter(
      (filePath) =>
        this.isExtensionAllowed(filePath, extensionsToCheck) &&
        filePath.includes("modules/")
    );
  }

  setAttributes(attributes: string[]) {
    this.patternChecking = attributes;
  }

  async validate(octokit: InstanceType<typeof GitHub>) {
    const results: ValidationResult[] = [];
    let onError = false;
    for (const file of this.files) {
      const content = await getFileContent(octokit, file);
      const result = this.checkPatternExistContent(
        this.patternChecking,
        content
      );
      if (result) {
        onError = true;
        results.push({ file: file, details: result.pattern });
      }
    }
    this.stepResult = {
      status: onError ? Status.ERROR : Status.SUCCESS,
      results: results,
    };
    return this.stepResult;
  }

  formatCommentBody(): string {
    if (!this.stepResult || this.stepResult.status === Status.SUCCESS) {
      core.debug(`No section for ${this.name} step will be write.`);
      return "";
    }

    let commentBody = `## :no_entry: ${this.name} \n`;
    commentBody += `${this.description}\n`;
    this.stepResult.results.forEach((actionResult) => {
      commentBody += `- [ ] Update **${actionResult.details}** syntax from **${actionResult.file}** \n`;
    });
    return commentBody;
  }

  /**
   * Checks if the content contains any of the specified patterns.
   *
   * @param {string[]} patternChecking - The patterns to check in the content.
   * @param {string} content - The content to check.
   * @returns {Object | null} - Returns an object with the patterns found, or null if no patterns were found.
   */
  checkPatternExistContent(
    patternChecking: string[],
    content: string
  ): PatternCheckResult | null {
    const patternForbiddenFound = patternChecking.filter((pattern) =>
      content.includes(pattern)
    );
    return patternForbiddenFound.length > 0
      ? { pattern: patternForbiddenFound.join(",") }
      : null;
  }
}
