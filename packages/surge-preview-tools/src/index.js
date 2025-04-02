import * as core from '@actions/core';
import * as github from "@actions/github";
import { checkLogin, getDeploys, getSurgeCliVersion } from "./surge-utils";
import { checkIfDomainExist, computeSurgeDomain } from "./utils.mjs";

// TODO use debug logs
async function getPrNumberByApiSearch(github_context, gitCommitSha) {
      core.info(`Searching PR related to commit: ${gitCommitSha}`);
      // Inspired by https://github.com/orgs/community/discussions/25220#discussioncomment-8697399
      const query = {
        q: `repo:${github_context.repo.owner}/${github_context.repo.repo} AND is:pr AND sha:${gitCommitSha}`,
        per_page: 1,
        advanced_search: true, // required to prepare forced usage. See https://github.blog/changelog/2025-03-06-github-issues-projects-api-support-for-issues-advanced-search-and-more/
      };
      try {
        const octokit = github.getOctokit(token);
        const result = await octokit.rest.search.issuesAndPullRequests(query);
        const pr = result.data.items.length > 0 && result.data.items[0];
        core.info(`Found related pull_request: ${JSON.stringify(pr, null, 2)}`);
        return pr ? pr.number : undefined;
      } catch (e) {
        // As mentioned in https://github.com/orgs/community/discussions/25220#discussioncomment-8971083
        // from time to time, you may get rate limit errors given search API seems to use many calls internally.
        core.warning(`Unable to get the PR number with API search: ${e}`);
      }
}


try {
  /**
   * Retrieve the PR number
   * Inspired by https://github.com/afc163/surge-preview/blob/main/src/main.ts
   * @returns prNumber
   */
  const getPrNumber = async (github_context) => {
    const token = core.getInput('github-token', { required: true });
    const {payload} = github_context;
    const gitCommitSha =
    payload?.pull_request?.head?.sha ||
    payload?.workflow_run?.head_sha;

    if (payload.number && payload.pull_request) {
      core.debug(`prNumber retrieved from pull_request ${payload.number}`);
      // TODO temp to test when runnning on a PR
      await getPrNumberByApiSearch(github_context, gitCommitSha);      
      return payload.number;
    } else {
      core.debug('Not a pull_request, so doing a API search');
      return await getPrNumberByApiSearch(github_context, gitCommitSha);
    }
  }

  const surgeCliVersion = getSurgeCliVersion();
  core.info(`Surge cli version: ${surgeCliVersion}`);
  
  const {job, payload} = github.context;
  const prNumber= await getPrNumber(github.context);
  core.info(`Find PR number: ${prNumber}`);
  if(prNumber === undefined){
    core.setFailed('No PR number found');
  }

  const domain = computeSurgeDomain(github.context.repo, job, prNumber);
  const previewUrl = `https://${domain}`;
  core.setOutput('preview-url', previewUrl);
  core.info(`Computed preview url: ${previewUrl}`);

  // Checking if the domain is publicly available
  const isDomainExist = await checkIfDomainExist(previewUrl);
  core.info(`Domain exist (publicly available)? ${isDomainExist}`);
  core.setOutput('domain-exist', isDomainExist);

  // Computing outputs related to the surge token
  const surgeToken = core.getInput('surge-token');
  let isSurgeTokenValid = false
  if (!surgeToken) {
    core.info(`The surge token is not set`)
  } else {
    core.setSecret(surgeToken);
    isSurgeTokenValid = checkLogin(surgeToken);
  }
  core.info(`Surge token valid? ${isSurgeTokenValid}`)
  core.setOutput("surge-token-valid", isSurgeTokenValid);

  let isDomainManaged = false;
  if (isSurgeTokenValid) {
    core.startGroup('List surge domains managed by the token');
    const deploys = getDeploys(surgeToken);
    const domains = deploys.map(deploy => deploy.domain);
    core.info(`Number of domains: ${domains.length}`);
    core.debug(domains);
    core.endGroup();

    core.info(`Checking if the domain exists in the list. Domain: ${domain}`);
    isDomainManaged = domains.includes(domain);
    core.info(`Domain managed by the surge token? ${isDomainManaged}`);
  }
  core.setOutput('domain-managed', isDomainManaged);

  const canRunSurgeCommand = isSurgeTokenValid && (payload.action !== 'closed' || (payload.action === 'closed' && isDomainManaged));
  core.info(`Can run surge command? ${canRunSurgeCommand}`)
  core.setOutput("can-run-surge-command", canRunSurgeCommand);
} catch (error) {
  core.setFailed(error.message);
}

