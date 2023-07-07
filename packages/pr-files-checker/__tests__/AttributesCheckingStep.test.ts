import { describe, test, jest, expect } from "@jest/globals";

jest.mock("@actions/github", () => ({
  context: {
    repo: {
      owner: "your_owner",
      repo: "your_repo",
    },
    sha: "your_sha",
  },
}));

function isExtensionAllowed(
  filePath: string,
  allowedExtensions: string[]
): boolean {
  // Get the last occurrence of "." in the filePath
  const lastDotIndex = filePath.lastIndexOf(".");

  // If there's no "." in the filePath or it's the last character, return false
  if (lastDotIndex === -1 || lastDotIndex === filePath.length - 1) {
    return false;
  }

  // Get the file extension from the filePath
  const fileExtension = filePath.slice(lastDotIndex + 1).toLowerCase();

  // Check if the file extension is in the allowedExtensions array
  if (allowedExtensions.includes(fileExtension)) {
    return true;
  }

  return false;
}

describe("test gh_pr_files_checker", function () {
  test("test gh-pr-files-checker.AttributesCheckingStep.validate", function (done) {
    //TODO: Write test

    const files = [
      "packages/pr-files-checker/__tests__/test-files/attributes-checking/modules/attributes-checking-1.adoc",
      ".packages/pr-files-checker/__tests__/test-files/attributes-checking/attributes-checking-2.adoc",
      "packages/pr-files-checker/__tests__/test-files/attributes-checking/attributes-checking-3.adoc",
    ];
    const attributes = ["name", "description"];
    const extensions = ["adoc"];

    let a = files.filter(
      (file) =>
        isExtensionAllowed(file, extensions) && file.includes("/modules/")
    );
    console.log("a", a);
  });
});
