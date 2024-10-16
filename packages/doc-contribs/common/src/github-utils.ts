import * as github from "@actions/github";
import * as core from "@actions/core";
import { GitHub } from "@actions/github/lib/utils";

export enum FILE_STATE {
  ADDED = "added",
  REMOVED = "removed",
  MODIFIED = "modified",
  RENAMED = "renamed",
  COPIED = "copied",
  CHANGED = "changed",
  UNCHANGED = "unchanged",
}

/**
 * Publishes a comment on a pull request.
 * If a comment with the same template already exists, it updates the comment.
 * Otherwise, it creates a new comment.
 *
 * @param octokit - The GitHub API client instance.
 * @param template - The template string to identify the comment.
 * @param commentBody - The body of the comment to be published.
 * @param prNumber - The pull request number where the comment will be published.
 * @returns A promise that resolves to the response of the create or update comment API call.
 *
 * @example
 * ```typescript
 * const octokit = new GitHub({ auth: 'token' });
 * const template = '<!-- previewLinksCheck-->';
 * const commentBody = 'This is a comment body';
 * const prNumber = 123;
 * await publishComment(octokit, template, commentBody, prNumber);
 * ```
 */
export async function publishComment(
  octokit: InstanceType<typeof GitHub>,
  template: string,
  commentBody: string,
  prNumber: number
) {
  const { exists, id } = await isCommentExist({ octokit, template, prNumber });
  if (commentBody) {
    if (exists && id) {
      core.debug(`Update comment ${id}`);
      return await updateComment({
        octokit,
        comment_id: id,
        body: commentBody,
      });
    } else {
      core.debug(`Create comment for #${prNumber}`);
      return await createComment({ octokit, body: commentBody, prNumber });
    }
  }
}

export async function getFileContent(
  octokit: any,
  filePath: string
): Promise<string> {
  const { data } = await octokit.rest.repos.getContent({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    path: filePath,
    // don't use "github.context.sha" because the value is different in pull_request and pull_request_target. The used value here works for both events
    ref: github?.context?.payload?.pull_request?.head?.sha,
  });

  return Buffer.from(data.content, "base64").toString();
}

export type FileInfo = {
  filename: string;
  previous_filename?: string;
  status: FILE_STATE;
};
export async function getFilesFromPR(
  octokit: InstanceType<typeof GitHub>,
  states: Array<FILE_STATE> = Object.values(FILE_STATE)
): Promise<FileInfo[]> {
  const prNumber = github?.context?.payload?.pull_request?.number;
  if (prNumber === undefined) {
    core.setFailed(
      "This action can only be used on pull_request or pull_request_target event"
    );
    return [];
  }
  const { data } = await octokit.rest.pulls.listFiles({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: prNumber,
    per_page: 100,
  });

  core.debug(`PR ${prNumber} contains ${data.length} files`);
  core.debug(`Keep only files with status: ${states.join(" - ")}`);

  const prFiles = data
    .filter((file: any) => states.includes(file.status))
    .map((file: any) => ({
      filename: file.filename,
      status: file.status,
      previous_filename: file.previous_filename,
    }));

  core.debug(
    `Analyze ${prFiles.length} files in PR #${prNumber}: \n ${prFiles.join(
      "\n"
    )}`
  );
  return prFiles;
}

export async function isCommentExist({ octokit, template, prNumber }) {
  const { data: comments } = await octokit.rest.issues.listComments({
    owner: github.context.repo.owner,
    issue_number: prNumber,
    repo: github.context.repo.repo,
  });
  for (const comment of comments) {
    if (comment.body?.startsWith(template)) {
      return {
        exists: true,
        id: comment.id,
      };
    }
  }

  return {
    exists: false,
    id: null,
    body: "",
  };
}
export async function createComment({ octokit, body, prNumber }) {
  return octokit.rest.issues.createComment({
    issue_number: prNumber,
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    body: body,
  });
}
export async function updateComment({ octokit, body, comment_id }) {
  return await octokit.rest.issues.updateComment({
    comment_id: comment_id,
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    body: body,
  });
}

export async function deleteComment({ octokit, commentIdToDelete }) {
  await octokit.rest.issues.deleteComment({
    issue_number: github.context.issue.number,
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    comment_id: commentIdToDelete,
  });
}
