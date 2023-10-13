import * as github from "@actions/github";
import * as core from "@actions/core";
import { GitHub } from "@actions/github/lib/utils";

// Publish a comment on the PR with the results
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
      await updateComment({ octokit, comment_id: id, body: commentBody });
    } else {
      core.debug(`Create comment for #${prNumber}`);
      await createComment({ octokit, body: commentBody, prNumber });
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
    ref: github.context.sha,
  });

  return Buffer.from(data.content, "base64").toString();
}

export async function getModifiedFiles(
  octokit: InstanceType<typeof GitHub>
): Promise<string[]> {
  if (github?.context?.payload?.pull_request?.number === undefined) {
    core.setFailed("This action can only be used on pull_request");
    return [];
  }
  const { data } = await octokit.rest.pulls.listFiles({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: github?.context?.payload?.pull_request?.number,
  });

  return data.map((file: any) => file.filename);
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
  const comment = await octokit.rest.issues.createComment({
    issue_number: prNumber,
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    body: body,
  });
  return comment?.id;
}
export async function updateComment({ octokit, body, comment_id }) {
  const comment = await octokit.rest.issues.updateComment({
    comment_id: comment_id,
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    body: body,
  });
  return comment?.id;
}

export async function deleteComment({ octokit, commentIdToDelete }) {
  await octokit.rest.issues.deleteComment({
    issue_number: github.context.issue.number,
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    comment_id: commentIdToDelete,
  });
}
