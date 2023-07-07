import {
  ActionResult,
  ValidationResult,
  Status,
  ValidationStep,
} from "../validation";
import { getFileContent } from "../github-utils";
import * as core from "@actions/core";

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
  validate = async (octokit: any) => {
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
    core.debug(`${this.name} end on ${this.stepResult?.status}`);
    return this.stepResult;
  };

  formatCommentBody = (): string => {
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
  };

  // Check if the content contains the attributes
  checkPatternExistContent(patternChecking: string[], content: string) {
    const patternForbiddenFound = patternChecking.filter((pattern) =>
      content.includes(pattern)
    );
    return patternForbiddenFound.length > 0
      ? { pattern: patternForbiddenFound.join(",") }
      : null;
  }
}
