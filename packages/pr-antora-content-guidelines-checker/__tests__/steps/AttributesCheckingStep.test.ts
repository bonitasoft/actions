import { GitHub } from "@actions/github/lib/utils";
import { AttributesCheckingStep } from "../../src/steps/AttributesCheckingStep";
import { getFileContent } from "../../src/github-utils";
import { Status } from "../../src/validation";
import * as core from "@actions/core";

jest.mock("../../src/github-utils", () => ({
  getFileContent: jest.fn(),
}));

describe("AttributesCheckingStep", () => {
  beforeEach(() => {
    jest.spyOn(core, "debug").mockImplementation(jest.fn());
  });

  it("should validate attributes correctly", async () => {
    const mockOctokit = {} as InstanceType<typeof GitHub>;
    const files = ["modules/test/pages/test.adoc"];
    const extensionsToCheck = ["adoc"];
    const attributesToCheck = [":page-aliases:"];

    (getFileContent as jest.Mock).mockImplementation(
      () => ":page-aliases: test"
    );

    const attributesCheckingStep = new AttributesCheckingStep(
      files,
      extensionsToCheck,
      attributesToCheck
    );

    const result = await attributesCheckingStep.validate(mockOctokit);

    expect(result).toEqual({
      status: Status.SUCCESS,
      results: [],
    });
  });

  it("should return error status when attributes are missing and write comment", async () => {
    const mockOctokit = {} as InstanceType<typeof GitHub>;
    const files = ["modules/test/pages/test.adoc"];
    const extensionsToCheck = ["adoc"];
    const attributesToCheck = [":description:"];

    (getFileContent as jest.Mock).mockImplementation(
      () => ":page-aliases: test"
    );

    const attributesCheckingStep = new AttributesCheckingStep(
      files,
      extensionsToCheck,
      attributesToCheck
    );

    const result = await attributesCheckingStep.validate(mockOctokit);
    const commentBody = attributesCheckingStep.formatCommentBody();

    expect(result).toEqual({
      status: Status.ERROR,
      results: [
        {
          file: "modules/test/pages/test.adoc",
          details: ":description:",
        },
      ],
    });

    expect(commentBody).toEqual(
      "## :pause_button: Attributes validation \n" +
        "Some attributes are missing in the following files:\n" +
        "- [ ] **:description:** are missing in **modules/test/pages/test.adoc** \n"
    );
  });

  it("should comment nothing when the attribute check step is valid", async () => {
    const mockOctokit = {} as InstanceType<typeof GitHub>;
    const files = ["modules/test/pages/test.adoc"];
    const extensionsToCheck = ["adoc"];
    const attributesToCheck = [":description:"];

    (getFileContent as jest.Mock).mockImplementation(
      () => ":description: test"
    );

    const attributesCheckingStep = new AttributesCheckingStep(
      files,
      extensionsToCheck,
      attributesToCheck
    );

    await attributesCheckingStep.validate(mockOctokit);
    const commentBody = attributesCheckingStep.formatCommentBody();

    expect(commentBody).toEqual("");
    expect(core.debug).toHaveBeenCalled();
  });
});
