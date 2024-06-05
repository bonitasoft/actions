import * as githubUtils from "../src/github-utils";
import { FILE_STATE } from "../src/github-utils";
import { GitHub } from "@actions/github/lib/utils";
import * as core from "@actions/core";
import * as github from "@actions/github";

jest.mock("@actions/github", () => ({
  context: {
    payload: {
      pull_request: {
        number: 1,
      },
    },
    repo: {
      owner: "owner",
      repo: "repo",
    },
  },
  getOctokit: jest.fn(),
}));

describe("github-utils", () => {
  let octokit: InstanceType<typeof GitHub>;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(core, "error").mockImplementation(jest.fn());
    jest.spyOn(core, "warning").mockImplementation(jest.fn());
    jest.spyOn(core, "info").mockImplementation(jest.fn());
    jest.spyOn(core, "debug").mockImplementation(jest.fn());
    jest.spyOn(core, "setFailed").mockImplementation(jest.fn());

    octokit = new GitHub({ auth: "fake-token" });

    // Now, whenever github.context.payload.pull_request.number is accessed in your tests, it will return the mock number.
  });

  describe("getFilesFromPR", () => {
    it("should return the files from the PR when no filter is given", async () => {
      github.context!.payload!.pull_request!.number = 2;
      const mockData = {
        data: [
          { filename: "file1.ts", status: "modified" },
          { filename: "file2.ts", status: "added" },
          { filename: "file3.ts", status: "removed" },
        ],
      };

      (octokit.rest.pulls.listFiles as unknown as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockData);

      const files: string[] = await githubUtils.getFilesFromPR(octokit);

      expect(files).toEqual(["file1.ts", "file2.ts", "file3.ts"]);
      expect(octokit.rest.pulls.listFiles).toHaveBeenCalled();
    });

    it("should filter the files based on the provided states", async () => {
      const mockData = {
        data: [
          { filename: "file1.ts", status: FILE_STATE.MODIFIER },
          { filename: "file2.ts", status: FILE_STATE.ADDED },
          { filename: "file3.ts", status: FILE_STATE.REMOVED },
        ],
      };

      (octokit.rest.pulls.listFiles as unknown as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockData);

      const files = await githubUtils.getFilesFromPR(octokit, [
        FILE_STATE.MODIFIER,
        FILE_STATE.ADDED,
      ]);

      expect(files).toEqual(["file1.ts", "file2.ts"]);
      expect(octokit.rest.pulls.listFiles).toHaveBeenCalled();
    });

    it("should failed if prNumber is not set", async () => {
      //Overidde the github context
      //@ts-ignore
      github.context.payload.pull_request.number = undefined;

      const files: string[] = await githubUtils.getFilesFromPR(octokit, [
        FILE_STATE.MODIFIER,
        FILE_STATE.ADDED,
      ]);
      expect(core.setFailed).toHaveBeenCalled();
    });
  });
});
