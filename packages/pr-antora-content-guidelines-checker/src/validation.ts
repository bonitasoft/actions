/**
 * An abstract class that defines the structure for validation steps.
 *
 * @property {string} name - The name of the validation step.
 * @property {string} description - The description of the validation step.
 * @property {ActionResult | null} stepResult - The result of the validation step.
 */
export abstract class ValidationStep {
  abstract name: string;
  abstract description: string;
  abstract stepResult: ActionResult | null;

  /**
   * Formats the comment body for the validation step.
   *
   * @returns {string | undefined} - Returns a string that represents the comment body, or undefined if there is no comment body.
   */
  abstract formatCommentBody(): string | undefined;

  /**
   * Validates the modified files.
   *
   * @param {any} octokit - The GitHub instance to use for file operations.
   * @param {string[]} modifiedFiles - The files to validate.
   * @returns {Promise<ActionResult>} - Returns a promise that resolves to the result of the validation step.
   */
  abstract validate(
    octokit: any,
    modifiedFiles: string[]
  ): Promise<ActionResult>;


  /**
   * Checks if the file extension is allowed.
   *
   * @param {string} filePath - The path of the file to check.
   * @param {string[]} allowedExtensions - The allowed file extensions.
   * @returns {boolean} - Returns true if the file extension is allowed, false otherwise.
   */
  isExtensionAllowed(filePath: string, allowedExtensions: string[]): boolean {
    // Get the last occurrence of "." in the filePath
    const lastDotIndex = filePath.lastIndexOf(".");

    // If there's no "." in the filePath, or it's the last character, return false
    if (lastDotIndex === -1 || lastDotIndex === filePath.length - 1) {
      return false;
    }

    // Get the file extension from the filePath
    const fileExtension = filePath.slice(lastDotIndex + 1).toLowerCase();

    // Check if the file extension is in the allowedExtensions array
    return allowedExtensions.includes(fileExtension);
  }
}
export interface ValidationResult {
  file: string;
  details: any;
}

export enum Status {
  ERROR = "error",
  SUCCESS = "success",
}

export interface ActionResult {
  status: string;
  results: ValidationResult[];
}
