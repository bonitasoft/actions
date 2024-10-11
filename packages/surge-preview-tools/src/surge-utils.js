// The following is adapted from https://github.com/adrianjost/actions-surge.sh-teardown/blob/fc7c144291330755517b28a873139fcc11327cd8/index.js#L17
// released under the MIT license
import stripAnsi from "strip-ansi";
import {spawnSync} from 'node:child_process'
import * as core from '@actions/core';

const executeSurgeCliCmd = command => {
  core.debug(`Running surge cli command with arguments "${command}"`);
  const commandElements = command.split(' ');
  let result = spawnSync('npx',  ['surge', ...commandElements])

  core.debug(`STATUS ${result.status}`);
  core.debug(`STDOUT ${result.stdout.toString()}`);
  core.debug(`STDERR ${result.stderr.toString()}`);

  if (result.status === 0) {
    return stripAnsi(result.stdout.toString()).trim();
  }
  throw new Error(`Surge command failed '${command}'. Exit status: ${result.status}.
Details:
${result.stdout.toString()}
${result.stderr.toString()}`)
};

export const getSurgeCliVersion = () => {
  return executeSurgeCliCmd(`--version`);
}

export const checkLogin = surgeToken => {
  try {
    const result = executeSurgeCliCmd(`list --token ${surgeToken}`);
    core.debug(`Check login result: ${result}`);
    return true;
  } catch (e) {
    core.debug(`Check login failed: ${e}`);
    return false;
  }
};

// Adapted here to pass the surge token, updated after the bump of surge from 0.23 to 0.24 that changed the content of the logs
// See https://github.com/adrianjost/actions-surge.sh-teardown/commit/27d0dc9ab910c2ae46c9389a6f2ca46101ac56a9
export const getDeploys = surgeToken => {
  const surgeListOutput = executeSurgeCliCmd(`list --token ${surgeToken}`);
  const lines =
    surgeListOutput
      .split("\n")
      .map(l => l.trim().replace(/ {3,}/g, "  "));
  return lines.map(line => {
    const deploy = line.split("  ").map(a => a.trim());
    const [domain, timestamp, provider, host, plan] = deploy;
    return {
      domain,
      timestamp,
      provider,
      host,
      plan,
      line
    };
  });
};

