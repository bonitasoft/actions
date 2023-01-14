import * as core from '@actions/core';
import * as github from "@actions/github";
import {checkLogin, getDeploys, getSurgeCliVersion} from "./surge-utils"
import {computeSurgeDomain} from "./utils.mjs";

try {
  const surgeCliVersion = getSurgeCliVersion();
  core.info(`Surge cli version: ${surgeCliVersion}`);

  const payload = github.context.payload;
  const domain = computeSurgeDomain(github.context.repo, github.context.job, payload.number);
  const previewUrl = `https://${domain}`;
  core.setOutput('preview-url', previewUrl);
  core.info(`Computed preview url: ${previewUrl}`);

  // the token must be set
  const surgeToken = core.getInput('surge-token');
  let isSurgeTokenValid = false
  if (!surgeToken) {
    core.info(`The surge token is not set`)
  } else {
    core.setSecret(surgeToken);
    isSurgeTokenValid = checkLogin(surgeToken);
  }
  core.info(`surge token valid? ${isSurgeTokenValid}`)
  core.setOutput("surge-token-valid", isSurgeTokenValid);

  let isDomainExist = false;
  if (isSurgeTokenValid) {
    core.startGroup('List Surge domains');
    const deploys = getDeploys(surgeToken);
    const domains = deploys.map(deploy => deploy.domain);
    core.info(`Number of domains: ${domains.length}`);
    core.debug(domains);
    core.endGroup();

    core.info(`Checking if surge domain exist. Domain: ${domain}`);
    isDomainExist = domains.includes(domain);
    core.info(`surge domain exist? ${isDomainExist}`);
  }
  core.setOutput('domain-exist', isDomainExist);

  const canRunSurgeCommand = isSurgeTokenValid && (payload.action !== 'closed' || (payload.action === 'closed' && isDomainExist));
  core.info(`can run surge command? ${canRunSurgeCommand}`)
  core.setOutput("can-run-surge-command", canRunSurgeCommand);
} catch (error) {
  core.setFailed(error.message);
}

