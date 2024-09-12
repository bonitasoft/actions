import * as core from "@actions/core";
import {GitHub} from "@actions/github/lib/utils";
import * as github from "@actions/github";
import {FILE_STATE, FileInfo, getFilesFromPR, publishComment} from "actions-common";
import {CommentsWithLinks} from "./utils";


const template = '<!-- previewLinksCheck-->\n';

export async function run(): Promise<void> {
    try {
        const token = core.getInput("github-token");
        const componentName = core.getInput("component-name");
        const siteUrl = core.getInput("site-url");
        const octokit: InstanceType<typeof GitHub> = github.getOctokit(token);

        const modifiedFiles: FileInfo[] = await getFilesFromPR(octokit, [
            FILE_STATE.REMOVED,
            FILE_STATE.MODIFIED,
            FILE_STATE.ADDED,
        ]);

       const commentsWithLinks = new CommentsWithLinks(template);
       const addModifyFiles = modifiedFiles.filter(file => [FILE_STATE.MODIFIED,FILE_STATE.ADDED].includes(file.status));
        const deletedFiles = modifiedFiles.filter(file => file.status === FILE_STATE.REMOVED);
        const links :any = {};

        // We only have a single version for preview (latest)
        // TODO: Handle "pre-release" (next)
        let version = 'latest';
        links.updated = commentsWithLinks.prepareLinks({files: addModifyFiles, siteUrl: siteUrl, component: componentName, version: version});
        links.deleted = commentsWithLinks.prepareLinks({files: deletedFiles, siteUrl: siteUrl, component: componentName, version: version});

        const header = '## :memo: Check the pages that have been modified \n\n';
        const message = commentsWithLinks.buildMessage({header, links ,hasWarningMessage : deletedFiles.length > 0});

        const prNumber = github?.context?.payload?.pull_request?.number;
        if (prNumber) {
            const comment = await publishComment(
                octokit,
                template,
                message,
                prNumber
            );
            core.info(`📝 Publish comment for PR #${prNumber}`);
            core.info(`💡 See ${comment.data.html_url} for more details`);
        }

    }catch(error){
        //@ts-ignore
        core.setFailed(error.message);
    }
}


run();
