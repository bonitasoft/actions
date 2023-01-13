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
  return `${repoOwner}-${repoName}-${jobId}-pr-${prNumber}`;
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
