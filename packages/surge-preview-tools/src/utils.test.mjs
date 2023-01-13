import {describe, expect, test} from '@jest/globals';
import {computeSurgeDomain, computeSurgeSubDomain} from './utils.mjs';

describe('computeSurgeSubDomain', () => {
  test('basic', () => {
    expect(computeSurgeSubDomain({
      owner: 'orga',
      repo: 'reponame'
    }, 'job_id', '156')).toEqual('orga-reponame-job_id-pr-156');
  });
  test('repository owner contains dots', () => {
    expect(computeSurgeSubDomain({
      owner: 'orga.dot1.dot2',
      repo: 'reponame'
    }, 'job_id', '8795')).toEqual('orga-dot1-dot2-reponame-job_id-pr-8795');
  });
  test('repository owner contains underscore', () => {
    expect(computeSurgeSubDomain({
      owner: 'orga_name',
      repo: 'reponame'
    }, 'job', '156')).toEqual('orga_name-reponame-job-pr-156');
  });
  test('repository name contains dots', () => {
    expect(computeSurgeSubDomain({
      owner: 'orga',
      repo: 'reponame.dot1.dot2'
    }, 'job_id', '4')).toEqual('orga-reponame-dot1-dot2-job_id-pr-4');
  });
  test('repository name contains underscore', () => {
    expect(computeSurgeSubDomain({
      owner: 'orga',
      repo: 'repo_name'
    }, 'job', '1478')).toEqual('orga-repo_name-job-pr-1478');
  });
  test('ensure lower case domain', () => {
    expect(computeSurgeSubDomain({owner: 'myOrga', repo: 'myRepo'}, 'jobNbr', '157')).toEqual('myorga-myrepo-jobnbr-pr-157');
  });
});

describe('computeSurgeDomain', () => {
  test('basic', () => {
    expect(computeSurgeDomain({owner: 'orga', repo: 'repo'}, 'job2', '666')).toEqual('orga-repo-job2-pr-666.surge.sh');
  });
  test('ensure lower case domain', () => {
    expect(computeSurgeDomain({owner: 'myOrga', repo: 'myRepo'}, 'jobNbr', '157')).toEqual('myorga-myrepo-jobnbr-pr-157.surge.sh');
  });
});
