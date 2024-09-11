import { GitHub } from "@actions/github/lib/utils";
import { ForbiddenPatternStep } from "../../src/steps/ForbiddenPatternStep";
import { getFileContent } from "actions-common";
import { Status } from "../../src/validation";
import * as core from "@actions/core";

jest.mock("actions-common", () => ({
  getFileContent: jest.fn(),
}));

describe("ForbiddenPatternStep", () => {
  beforeEach(() => {
    jest.spyOn(core, "debug").mockImplementation(jest.fn());
  });

  it("should validate when content don't have forbiddenPattern", async () => {
    const mockOctokit = {} as InstanceType<typeof GitHub>;
    const files = ["modules/test/pages/test.adoc"];
    const extensionsToCheck = ["adoc"];
    const patternChecking = ["http://"];

    (getFileContent as jest.Mock).mockImplementation(
      () => "content without forbiddenPattern"
    );

    const forbiddenPatternStep = new ForbiddenPatternStep(
      files,
      extensionsToCheck,
      patternChecking
    );

    const result = await forbiddenPatternStep.validate(mockOctokit);

    expect(result).toEqual({
      status: Status.SUCCESS,
      results: [],
    });
  });

  it("should return error status when forbidden patterns are found", async () => {
    const mockOctokit = {} as InstanceType<typeof GitHub>;
    const files = ["modules/test/pages/test.adoc"];
    const extensionsToCheck = ["adoc"];
    const patternChecking = ["http://test.com", "xref::"];

    (getFileContent as jest.Mock).mockImplementation(
      () => "You can check this url http://test.com"
    );

    const forbiddenPatternStep = new ForbiddenPatternStep(
      files,
      extensionsToCheck,
      patternChecking
    );

    const result = await forbiddenPatternStep.validate(mockOctokit);
    const commentBody = forbiddenPatternStep.formatCommentBody();

    expect(result).toEqual({
      status: Status.ERROR,
      results: [
        {
          file: "modules/test/pages/test.adoc",
          details: "http://test.com",
        },
      ],
    });
    expect(commentBody).toEqual(
      "## :no_entry: Forbidden pattern validation \n" +
        "Some patterns are forbidden in the following files:\n" +
        "- [ ] Update **http://test.com** syntax from **modules/test/pages/test.adoc** \n"
    );
  });
});
