import { GitHub } from "@actions/github/lib/utils";
import { PageFilenameStep } from "../../src/steps/PageFilenameStep";
import { Status } from "../../src/validation";
import * as core from "@actions/core";

jest.mock("actions-common", () => ({
  getFileContent: jest.fn(),
}));

describe("FilenameStep", () => {
  beforeEach(() => {
    jest.spyOn(core, "debug").mockImplementation(jest.fn());
  });

  it("should validate when the file name follow the guidelines", async () => {
    const mockOctokit = {} as InstanceType<typeof GitHub>;
    const files = ["modules/test/pages/test-are-ok.adoc"];
    const extensionsToCheck = ["adoc"];

    const pageFilenameStep = new PageFilenameStep(files, extensionsToCheck);

    const result = await pageFilenameStep.validate(mockOctokit);

    expect(result).toEqual({
      status: Status.SUCCESS,
      results: [],
    });
  });

  it("should return error status when forbidden patterns are found", async () => {
    const mockOctokit = {} as InstanceType<typeof GitHub>;
    const files = ["modules/test/pages/testAreNotOk.adoc", "modules/test/pages/test-are-ok.adoc", "modules/test/pages/name_are_bad.adoc","modules/test/pages/otherBad_filename.adoc"];
    const extensionsToCheck = ["adoc"];

    const pageFilenameStep = new PageFilenameStep(files, extensionsToCheck);

    const result = await pageFilenameStep.validate(mockOctokit);

    expect(result).toEqual({
      status: Status.ERROR,
      results: [
        { file: "testAreNotOk.adoc",details: "test-are-not-ok.adoc"},
        {file: "name_are_bad.adoc", details: "name-are-bad.adoc"},
        {file: "otherBad_filename.adoc", details: "other-bad-filename.adoc"},
      ],
    });
    const comment = pageFilenameStep.formatCommentBody()
    expect(comment).toContain(`🥙 File name`);
    expect(comment).toContain(`Some filenames are not following the kebab-case convention. To ensure consistency and maintain best practices, please rename the following files accordingly:`);
  });
});
