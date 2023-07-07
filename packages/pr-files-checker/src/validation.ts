export abstract class ValidationStep {
  abstract name: string;
  abstract description: string;
  abstract stepResult: ActionResult | null;
  abstract formatCommentBody: () => string | undefined;
  abstract validate(
    octokit: any,
    modifiedFiles: string[]
  ): Promise<ActionResult>;
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
  details: string;
}

export enum Status {
  ERROR = "error",
  SUCCESS = "success",
}

export interface ActionResult {
  status: string;
  results: ValidationResult[];
}
