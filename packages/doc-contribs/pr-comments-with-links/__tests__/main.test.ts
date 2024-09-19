import { run } from "../src/main";
import * as core from "@actions/core";

import { FILE_STATE, getFilesFromPR, publishComment } from "actions-common";

jest.mock("@actions/core");
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
jest.mock("actions-common");

describe("comments-pr-with-links", () => {
  let mockGetInput: jest.MockedFunction<typeof core.getInput>;
  let mockGetFilesFromPR: jest.MockedFunction<typeof getFilesFromPR>;
  let mockPublishComment: jest.MockedFunction<typeof publishComment>;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockGetInput = core.getInput as jest.MockedFunction<typeof core.getInput>;
    mockGetFilesFromPR = getFilesFromPR as jest.MockedFunction<
      typeof getFilesFromPR
    >;
    mockPublishComment = publishComment as jest.MockedFunction<
      typeof publishComment
    >;

    mockGetInput.mockImplementation((name: string) => {
      switch (name) {
        case "github-token":
          return "fake-token";
        case "component-name":
          return "component";
        case "site-url":
          return "http://example.com";
        default:
          return "";
      }
    });
  });

  it("publishes comment with updated and deleted links", async () => {
    mockGetFilesFromPR.mockResolvedValue([
      {
        status: FILE_STATE.MODIFIED,
        filename: "modules/ROOT/pages/page1.adoc",
      },
      { status: FILE_STATE.MODIFIED, filename: "modules/ROOT/pages/page1" },
      { status: FILE_STATE.REMOVED, filename: "modules/ROOT/pages/page2.adoc" },
    ]);

    await run();

    expect(mockPublishComment).toHaveBeenCalledTimes(1);
  });

  it("not publishes comment when the files updates or removes not follow the pattern ", async () => {
    mockGetFilesFromPR.mockResolvedValue([
      { status: FILE_STATE.MODIFIED, filename: ".github/toto" },
      { status: FILE_STATE.MODIFIED, filename: "page1.adoc" },
    ]);

    await run();

    expect(mockPublishComment).toHaveBeenCalledTimes(0);
  });

  it("sets failed status if an error occurs", async () => {
    mockGetFilesFromPR.mockRejectedValue(new Error("Failed to get files"));

    await run();

    expect(core.setFailed).toHaveBeenCalledWith("Failed to get files");
  });
});
