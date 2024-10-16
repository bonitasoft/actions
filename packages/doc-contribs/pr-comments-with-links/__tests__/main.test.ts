import { groupFilesByChangeType, run } from "../src/main";
import * as core from "@actions/core";

import {
  FILE_STATE,
  FileInfo,
  getFilesFromPR,
  publishComment,
} from "actions-common";

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

  it("publishes comment with updated and requiringRedirects links", async () => {
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

  it("publishes comment with renamed links", async () => {
    mockGetFilesFromPR.mockResolvedValue([
      {
        status: FILE_STATE.RENAMED,
        filename: "modules/ROOT/pages/faq.adoc",
        previous_filename: "modules/ROOT/pages/faq_old.adoc",
      },
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

describe("groupFilesByChangeType", () => {
  it("returns filesWithUpdatedContent and filesRequiringRedirects correctly", () => {
    const files: FileInfo[] = [
      { status: FILE_STATE.MODIFIED, filename: "file1.adoc" },
      { status: FILE_STATE.ADDED, filename: "file2.adoc" },
      {
        status: FILE_STATE.RENAMED,
        filename: "file3.adoc",
        previous_filename: "file3_old.adoc",
      },
      { status: FILE_STATE.REMOVED, filename: "file4.adoc" },
    ];

    const result = groupFilesByChangeType(files);

    expect(result.filesWithUpdatedContent).toEqual([
      "file1.adoc",
      "file2.adoc",
      "file3.adoc",
    ]);
    expect(result.filesRequiringRedirects).toEqual([
      "file3_old.adoc",
      "file4.adoc",
    ]);
  });

  it("returns empty arrays when no files match the criteria", () => {
    const files: FileInfo[] = [
      { status: FILE_STATE.REMOVED, filename: "file1.adoc" },
      { status: FILE_STATE.REMOVED, filename: "file2.adoc" },
    ];

    const result = groupFilesByChangeType(files);

    expect(result.filesWithUpdatedContent).toEqual([]);
    expect(result.filesRequiringRedirects).toEqual([
      "file1.adoc",
      "file2.adoc",
    ]);
  });

  it("handles an empty files array", () => {
    const files: FileInfo[] = [];

    const result = groupFilesByChangeType(files);

    expect(result.filesWithUpdatedContent).toEqual([]);
    expect(result.filesRequiringRedirects).toEqual([]);
  });

  it("handles files with only add/modify/rename states", () => {
    const files: FileInfo[] = [
      { status: FILE_STATE.MODIFIED, filename: "file1.adoc" },
      { status: FILE_STATE.ADDED, filename: "file2.adoc" },
      {
        status: FILE_STATE.RENAMED,
        filename: "file3.adoc",
        previous_filename: "file3_old.adoc",
      },
    ];

    const result = groupFilesByChangeType(files);

    expect(result.filesWithUpdatedContent).toEqual([
      "file1.adoc",
      "file2.adoc",
      "file3.adoc",
    ]);
    expect(result.filesRequiringRedirects).toEqual(["file3_old.adoc"]);
  });

  it("handles files with only removed state", () => {
    const files: FileInfo[] = [
      { status: FILE_STATE.REMOVED, filename: "file1.adoc" },
      { status: FILE_STATE.REMOVED, filename: "file2.adoc" },
    ];

    const result = groupFilesByChangeType(files);

    expect(result.filesWithUpdatedContent).toEqual([]);
    expect(result.filesRequiringRedirects).toEqual([
      "file1.adoc",
      "file2.adoc",
    ]);
  });
});
