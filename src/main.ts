import * as core from '@actions/core';
import * as github from '@actions/github';
import parseDiff from 'parse-diff';
import {Context} from "@actions/github/lib/context";
import {prDiffResult, validate} from "./validation";

async function run() {
    try {
        // get information on everything
        const token = core.getInput('github-token', {required: true})
        const octokit = github.getOctokit(token)
        const context: Context = github.context

        // Request the pull request diff from the GitHub API
        const data = await octokit.rest.pulls.get({
            owner: context.repo.owner,
            repo: context.repo.repo,
            // @ts-ignore
            pull_number: context.payload.pull_request.number,
            mediaType: {
                format: "diff",
            },
        });

        let files : parseDiff.File[] = parseDiff(data['prDiff']);
        let inputStringDiff: string = core.getInput('diffDoesNotContain');
        let diffDoesNotContain: Array<string> = JSON.parse(inputStringDiff);

        let filteredExtensions : Array<string>= JSON.parse(core.getInput("extensionsToCheck"));
        let result: prDiffResult= validate(files, filteredExtensions,diffDoesNotContain);
        if(!result.isDiffValid) {
            core.setFailed(`The PR should not include one of ${diffDoesNotContain.toString()}`);
        }
    } catch (error: any) {
        core.setFailed(error.message);
    }
}

run();
