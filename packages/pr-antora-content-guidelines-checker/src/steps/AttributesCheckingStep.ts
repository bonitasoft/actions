import * as core from "@actions/core";
import {
  ActionResult,
  ValidationResult,
  Status,
  ValidationStep,
} from "../validation";
import { getFileContent } from "../github-utils";
import { GitHub } from "@actions/github/lib/utils";

type AttributeError = {
  [key: string]: {
    id: string;
    message: string;
    lengthRequirement?: any;
  };
};

const attributeError: AttributeError = {
  MISSING: {
    id: "missing",
    message: "are missing, please add them",
  },
  EMPTY: {
    id: "empty",
    message: "are empty, please fill them",
  },
  BAD_LENGTH: {
    id: "bad_length",
    message: "have not enough characters, please add more content",
    lengthRequirement: { ":description:": 25 },
  },
};

type ErrorReports = {
  [key in keyof typeof attributeError]: string[];
};

/**
 * A class that extends the ValidationStep class to validate if attributes exist in the files.
 * The files must be content in modules/ or /pages/ folders.
 *
 * @property {string} name - The name of the validation step.
 * @property {string} description - The description of the validation step.
 * @property {string[]} attributesToCheck - The attributes to check in the files.
 * @property {ActionResult | null} stepResult - The result of the validation step.
 * @property {string[]} files - The files to validate.
 */
export class AttributesCheckingStep extends ValidationStep {
  name: string;
  description: string;
  attributesToCheck: string[] = [];
  stepResult: ActionResult | null;
  files: string[];

  constructor(
    files: string[],
    extensionsToCheck: string[],
    attributesToCheck: string[]
  ) {
    super();
    this.name = "Attributes validation";
    this.description =
      "Some attributes issues are detected in the following files:";
    this.stepResult = null;
    this.attributesToCheck = attributesToCheck;
    this.files = this.filterFiles(files, extensionsToCheck);
  }

  setAttributes(attributes: string[]) {
    this.attributesToCheck = attributes;
  }

  formatCommentBody(): string {
    if (!this.stepResult || this.stepResult.status === Status.SUCCESS) {
      core.debug(`No section for ${this.name} step will be write.`);
      return "";
    }

    let commentBody = `## :pause_button: ${this.name} \n`;
    commentBody += `${this.description}\n`;
    this.stepResult.results.forEach((actionResult) => {
      commentBody += this.getFileReport(actionResult);
    });

    return commentBody;
  }

  async validate(octokit: InstanceType<typeof GitHub>): Promise<ActionResult> {
    const results: ValidationResult[] = [];
    let hasErrors = false;

    for (const file of this.files) {
      const content = await getFileContent(octokit, file);
      const errorReports = this.checkAttributesInContent(
        this.attributesToCheck,
        content
      );

      if (errorReports) {
        hasErrors = true;
        results.push({ file: file, details: errorReports });
      }
    }

    this.stepResult = {
      status: hasErrors ? Status.ERROR : Status.SUCCESS,
      results: results,
    };

    return this.stepResult;
  }

  /**
   * Generates a report for a file based on the validation results.
   *
   * @param {ValidationResult} validationResult - The validation results for the file.
   * @returns {string} - Returns a string that represents the report for the file.
   */
  getFileReport(validationResult: ValidationResult): string {
    let comment = `- [ ] In **${validationResult.file}**:\n\n| Attributes | Error |\n| --- | --- |\n`;
    const generateCommentForErrorType = (errorType: any) => {
      if (validationResult.details[errorType.id].length > 0) {
        comment += `| ${validationResult.details[errorType.id].join(",")} | ${
          errorType.message
        } |\n`;
      }
    };

    generateCommentForErrorType(attributeError.MISSING);
    generateCommentForErrorType(attributeError.EMPTY);
    generateCommentForErrorType(attributeError.BAD_LENGTH);

    return comment;
  }

  private filterFiles(files: string[], extensionsToCheck: string[]): string[] {
    return files.filter(
      (filePath) =>
        this.isExtensionAllowed(filePath, extensionsToCheck) &&
        filePath.includes("modules/") &&
        filePath.includes("/pages/")
    );
  }

  /**
   * Checks the content of a file for specified attributes and generates a report of any errors found.
   *
   * @param {string[]} attributesToCheck - The attributes to check in the content.
   * @param {string} contentFile - The content of the file to check.
   * @returns {ErrorReports | null} - Returns an object containing arrays of attributes that are missing, empty, or do not meet the length requirement. If no errors are found, returns null.
   */
  private checkAttributesInContent(
    attributesToCheck: string[],
    contentFile: string
  ): ErrorReports | null {
    const lines = contentFile.split("\n");
    let errorReports: ErrorReports = {
      [attributeError.MISSING.id]: [],
      [attributeError.EMPTY.id]: [],
      [attributeError.BAD_LENGTH.id]: [],
    };

    lines.forEach((line) => {
      attributesToCheck.forEach((attribute) => {
        if (!contentFile.includes(attribute)) {
          errorReports[attributeError.MISSING.id].push(attribute);
          return;
        }
        if (line.includes(attribute)) {
          this.processAttributeInLine(attribute, line, errorReports);
        }
      });
    });

    return errorReports.empty.length > 0 ||
      errorReports.missing.length > 0 ||
      errorReports.bad_length.length > 0
      ? errorReports
      : null;
  }

  /**
   * Processes a line of content to check for attribute errors.
   *
   * @param {string} attribute - The attribute to check in the line.
   * @param {string} line - The line of content to check.
   * @param {ErrorReports} errorReports - The object to store any attribute errors found.
   */
  private processAttributeInLine(
    attribute: string,
    line: string,
    errorReports: ErrorReports
  ): void {
    const attributeIndex = line.indexOf(attribute);
    const attributeValue = line
      .substring(attributeIndex + attribute.length)
      .trim();

    if (!attributeValue) {
      errorReports[attributeError.EMPTY.id].push(attribute);
    } else if (this.doesNotMeetLengthRequirement(attribute, attributeValue)) {
      errorReports[attributeError.BAD_LENGTH.id].push(attribute);
    }
  }

  /**
   * Checks if the length of the attribute value does not meet the required length.
   *
   * @param {string} attribute - The attribute to check.
   * @param {string} attributeValue - The value of the attribute.
   * @returns {boolean} - Returns true if the attribute value's length is less than the required length, false otherwise.
   */
  private doesNotMeetLengthRequirement(
    attribute: string,
    attributeValue: string
  ): boolean {
    return (
      attributeError.BAD_LENGTH.lengthRequirement &&
      attributeError.BAD_LENGTH.lengthRequirement[attribute] &&
      attributeValue.length <
        attributeError.BAD_LENGTH.lengthRequirement[attribute]
    );
  }
}
