import * as core from "@actions/core";
import got from 'got';

export const checkIfDomainExist = async (url) => {
  core.info(`Fetching ${url}`);
  let domainExist = false;
  try {
    const response = await got.head(url, {
      throwHttpErrors: false
    });
    core.info(`Response status: ${response.statusCode}`);
    domainExist = response.ok;
  } catch (e) {
    core.error(`Error while fetching: ${e}`);
  }
  return domainExist;
}

/**
 * Compute the 'surge subdomain', as built by the surge-preview action
 * @param {{owner: string, repo: string}} repo
 * @param {string} jobId
 * @param {string} prNumber
 * @returns {string}
 */
export const computeSurgeSubDomain = (repo, jobId, prNumber) => {
  const repoOwner = repo.owner.replace(/\./g, '-');
  const repoName = repo.repo.replace(/\./g, '-');
  const domain = `${repoOwner}-${repoName}-${jobId}-pr-${prNumber}`.toLowerCase();
  if(domain.length > 63) {
    throw new Error(`The computed surge subdomain is too long. It contains ${domain.length} characters, but it must contain a maximum of 63 characters.  
Computed sub-domain: ${domain}
In your workflow definition, try to use a shorter id for the job that runs this action.
For more details, see https://github.com/bonitasoft/actions/issues/101`)
  }
  return domain;
}

/**
 * Compute the 'surge domain', as built by the surge-preview action
 * @param {{owner: string, repo: string}} repo
 * @param {string} jobId
 * @param {string} prNumber
 */
export const computeSurgeDomain = (repo, jobId, prNumber) => {
  return `${computeSurgeSubDomain(repo, jobId, prNumber)}.surge.sh`;
}
