import * as core from "@actions/core";
import {
  ActionResult,
  ValidationResult,
  Status,
  ValidationStep,
} from "../validation";
import { getFileContent } from "../github-utils";
import { GitHub } from "@actions/github/lib/utils";

export class AttributesCheckingStep extends ValidationStep {
  name: string;
  description: string;
  attributesChecking: string[] = [];
  stepResult: ActionResult | null;
  files: string[];

  constructor(
    files: string[],
    extensionsToCheck: string[],
    attributesToCheck: string[]
  ) {
    super();
    this.name = "Attributes validation";
    this.description = "Some attributes are missing in the following files:";
    this.stepResult = null;
    this.attributesChecking = attributesToCheck;

    this.files = files.filter(
      (filePath) =>
        this.isExtensionAllowed(filePath, extensionsToCheck) &&
        filePath.includes("modules/") &&
        filePath.includes("/pages/")
    );
  }

  setAttributes(attributes: string[]) {
    this.attributesChecking = attributes;
  }

  validate: (octokit: InstanceType<typeof GitHub>) => Promise<ActionResult> =
    async (octokit: InstanceType<typeof GitHub>) => {
      const results: ValidationResult[] = [];
      let onError = false;
      for (const file of this.files) {
        const content = await getFileContent(octokit, file);
        const result = this.checkPatternExistContent(
          this.attributesChecking,
          content
        );
        if (result) {
          onError = true;
          results.push({ file: file, details: result.missingAttribute });
        }
      }
      this.stepResult = {
        status: onError ? Status.ERROR : Status.SUCCESS,
        results: results,
      };
      core.debug(`${this.name} end on ${this.stepResult?.status}`);
      return this.stepResult;
    };

  formatCommentBody = () => {
    if (!this.stepResult || this.stepResult.status === Status.SUCCESS) {
      core.debug(`No section for ${this.name} step will be write.`);
      return "";
    }

    let commentBody = `## :pause_button: ${this.name} \n`;
    commentBody += `${this.description}\n`;
    this.stepResult.results.forEach((actionResult) => {
      commentBody += `- [ ] **${actionResult.details}** are missing in **${actionResult.file}** \n`;
    });

    return commentBody;
  };

  // Check if the content contains the attributes
  checkPatternExistContent(attributesChecking: string[], content: string) {
    const missingTags = attributesChecking.filter(
      (tag) => !content.includes(tag)
    );
    return missingTags.length > 0
      ? { missingAttribute: missingTags.join(",") }
      : null;
  }
}
