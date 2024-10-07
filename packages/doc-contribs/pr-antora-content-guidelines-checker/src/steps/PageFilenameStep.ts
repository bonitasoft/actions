import * as core from "@actions/core";
import {
  ActionResult,
  ValidationResult,
  Status,
  ValidationStep,
} from "../validation";
import { getFileContent } from "actions-common";
import { GitHub } from "@actions/github/lib/utils";

export class PageFilenameStep extends ValidationStep {
  name: string;
  description: string;
  stepResult: ActionResult | null;
  files: string[];

  constructor(files: string[], extensionsToCheck: string[]) {
    super();
    this.name = "Page filename";
    this.description =
      "Some filenames are not following the kebab-case convention. To ensure consistency and maintain best practices, please rename the following files accordingly:";
    this.stepResult = null;
    this.files = this.filterFiles(files, extensionsToCheck);
  }

  formatCommentBody(): string {
    if (!this.stepResult || this.stepResult.status === Status.SUCCESS) {
      core.debug(`No section for ${this.name} step will be write.`);
      return "";
    }

    let commentBody = `## 🥙 ${this.name} \n`;
    commentBody += `${this.description}\n`;
    this.stepResult.results.forEach((actionResult) => {
      commentBody += `- [ ] Rename **${actionResult.file}** to **${actionResult.details}**\n`;
    });
    commentBody += `
> [!warning]
> Additionally, don't forget to add the \`:page-aliases:\` attribute after renaming the **existing files** to avoid broken links or references. `;

    return commentBody;
  }

  toKebabCase(str: string) {
    // Split the file name and extension
    const parts = str.split(".");
    const fileName = parts.slice(0, -1).join("."); // Handle multiple dots before the extension
    const extension = parts.slice(-1)[0];

    // Convert the file name part to kebab-case
    const kebabFileName = fileName
      .replace(/([a-z])([A-Z])/g, "$1-$2") // Add dash between camelCase letters
      .replace(/_/g, "-") // Replace underscores with dashes
      .toLowerCase(); // Convert to lowercase

    // Join the kebab-case file name with the extension
    return `${kebabFileName}.${extension}`;
  }
  async validate(octokit: InstanceType<typeof GitHub>): Promise<ActionResult> {
    const results: ValidationResult[] = [];
    let hasErrors = false;

    const kebabCaseRegex = /^[a-z0-9]+(-[a-z0-9]+)*(?=\.[a-z]+$)/;

    this.files.forEach((filePath) => {
      const fileName = filePath.split("/").pop();
      if (fileName && !kebabCaseRegex.test(fileName)) {
        hasErrors = true;
        results.push({ file: fileName, details: this.toKebabCase(fileName) });
      }
    });
    this.stepResult = {
      status: hasErrors ? Status.ERROR : Status.SUCCESS,
      results: results,
    };

    return this.stepResult;
  }

  /**
   * Check if the file extension is allowed
   * @param files
   * @param extensionsToCheck
   * @private
   */
  private filterFiles(files: string[], extensionsToCheck: string[]): string[] {
    return files.filter(
      (filePath) =>
        this.isExtensionAllowed(filePath, extensionsToCheck) &&
        filePath.includes("modules/")
    );
  }
}
