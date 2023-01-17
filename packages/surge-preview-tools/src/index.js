import * as core from '@actions/core';
import * as github from "@actions/github";
import {checkLogin, getDeploys, getSurgeCliVersion} from "./surge-utils"
import {checkIfDomainExist, computeSurgeDomain} from "./utils.mjs";

try {
  const surgeCliVersion = getSurgeCliVersion();
  core.info(`Surge cli version: ${surgeCliVersion}`);

  const payload = github.context.payload;
  const domain = computeSurgeDomain(github.context.repo, github.context.job, payload.number);
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

