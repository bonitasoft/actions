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
  describe("should validate", () => {
    it("with a success status and comment nothing when the attribute check step is valid", async () => {
      const mockOctokit = {} as InstanceType<typeof GitHub>;
      const files = ["modules/test/pages/test.adoc"];
      const extensionsToCheck = ["adoc"];
      const attributesToCheck = [":description:"];

      (getFileContent as jest.Mock).mockImplementation(
        () =>
          ":description: This is a valid content with more characters than requirement"
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

    it("with success when the content is valid", async () => {
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

    it("with a MISSING error when attribute to check is missing", async () => {
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

      expect(result).toEqual({
        status: Status.ERROR,
        results: [
          {
            file: "modules/test/pages/test.adoc",
            details: {
              missing: [":description:"],
              empty: [],
              bad_length: [],
            },
          },
        ],
      });
    });

    it("with a BAD_LENGTH error status when attribute exist, but not follow the length requirement", async () => {
      const mockOctokit = {} as InstanceType<typeof GitHub>;
      const files = ["modules/test/pages/test.adoc"];
      const extensionsToCheck = ["adoc"];
      const attributesToCheck = [":description:"];

      (getFileContent as jest.Mock).mockImplementation(
        () => ":description: a little description \n test"
      );

      const attributesCheckingStep = new AttributesCheckingStep(
        files,
        extensionsToCheck,
        attributesToCheck
      );

      const result = await attributesCheckingStep.validate(mockOctokit);

      expect(result).toEqual({
        status: Status.ERROR,
        results: [
          {
            file: "modules/test/pages/test.adoc",
            details: {
              empty: [],
              missing: [],
              bad_length: [":description:"],
            },
          },
        ],
      });
    });

    it("with a EMPTY error status when attribute exist, but with a empty content", async () => {
      const mockOctokit = {} as InstanceType<typeof GitHub>;
      const files = ["modules/test/pages/test.adoc"];
      const extensionsToCheck = ["adoc"];
      const attributesToCheck = [":description:"];

      (getFileContent as jest.Mock).mockImplementation(
        () => ":description:\n test"
      );

      const attributesCheckingStep = new AttributesCheckingStep(
        files,
        extensionsToCheck,
        attributesToCheck
      );

      const result = await attributesCheckingStep.validate(mockOctokit);

      expect(result).toEqual({
        status: Status.ERROR,
        results: [
          {
            file: "modules/test/pages/test.adoc",
            details: {
              empty: [":description:"],
              missing: [],
              bad_length: [],
            },
          },
        ],
      });
    });

    it("from a complex content", async () => {
      const mockOctokit = {} as InstanceType<typeof GitHub>;
      const files = ["modules/test/pages/test.adoc"];
      const extensionsToCheck = ["adoc"];
      const attributesToCheck = [":description:", ":page-aliases:"];

      (getFileContent as jest.Mock).mockImplementation(
        () =>
          "= Title of my document" +
          ":page-aliases: \n" +
          ":description: This a long description of my fake document to check if validation is robust\n\n" +
          "== Sub Title of the fake document" +
          ""
      );

      const attributesCheckingStep = new AttributesCheckingStep(
        files,
        extensionsToCheck,
        attributesToCheck
      );

      const result = await attributesCheckingStep.validate(mockOctokit);

      expect(result).toEqual({
        status: Status.ERROR,
        results: [
          {
            file: "modules/test/pages/test.adoc",
            details: {
              empty: [":page-aliases:"],
              missing: [],
              bad_length: [],
            },
          },
        ],
      });
    });
  });
  describe("getFileReport", () => {
    it("should generate a report with for an empty attribute", () => {
      const attributesCheckingStep = new AttributesCheckingStep([], [], []);

      const validationResult = {
        file: "modules/test/pages/test.adoc",
        details: {
          missing: [],
          empty: [":description:"],
          bad_length: [],
        },
      };

      const report = attributesCheckingStep.getFileReport(validationResult);

      expect(report).toEqual(
        `- [ ] In **modules/test/pages/test.adoc**:\n\n` +
          `| Attributes | Error |\n` +
          `| --- | --- |\n` +
          `| :description: | are empty, please fill them |\n`
      );
    });

    it("should generate a report with for a missing attribute", () => {
      const attributesCheckingStep = new AttributesCheckingStep([], [], []);

      const validationResult = {
        file: "modules/test/pages/test.adoc",
        details: {
          missing: [":description:"],
          empty: [],
          bad_length: [],
        },
      };

      const report = attributesCheckingStep.getFileReport(validationResult);

      expect(report).toEqual(
        `- [ ] In **modules/test/pages/test.adoc**:\n\n` +
          `| Attributes | Error |\n` +
          `| --- | --- |\n` +
          `| :description: | are missing, please add them |\n`
      );
    });

    it("should generate a file report with 2 issues", () => {
      const attributesCheckingStep = new AttributesCheckingStep([], [], []);

      const validationResult = {
        file: "modules/test/pages/test.adoc",
        details: {
          missing: [],
          empty: [":description:"],
          bad_length: [":page-aliases:"],
        },
      };

      const report = attributesCheckingStep.getFileReport(validationResult);

      expect(report).toEqual(
        `- [ ] In **modules/test/pages/test.adoc**:\n\n` +
          `| Attributes | Error |\n` +
          `| --- | --- |\n` +
          `| :description: | are empty, please fill them |\n` +
          `| :page-aliases: | have not enough characters, please add more content |\n`
      );
    });
  });
});
