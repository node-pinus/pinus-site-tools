'use strict';

const HexoBase = require('../lib/hexoBase');
const path = require('path');
const base = new HexoBase();
const runscript = require('runscript');
const ghpages = require('gh-pages');

// The branch that pushing document
const BRANCH = 'gh-pages';
const DOC_PUBLISHER_NAME = 'Auto Doc Publisher';
const DOC_PUBLISHER_EMAIL = 'docs@midwayjs.org';

exports.command = 'deploy';
exports.desc = 'deploy to github gh-pages';

exports.handler = function (argv) {
  base.run(async ({ baseDir, targetDir, hexo }) => {
    let commmitMsg = await runscript('git log --format=%B -n 1', { stdio: 'pipe', cwd: baseDir });
    commmitMsg = commmitMsg.stdout.toString().replace(/\n*$/, '');
    commmitMsg = 'docs: auto generate by ci \n' + commmitMsg;

    let repo = await runscript('git config remote.origin.url', { stdio: 'pipe', cwd: baseDir });
    repo = repo.stdout.toString().slice(0, -1);
    if (/^http/.test(repo)) {
      repo = repo.replace('https://github.com/', 'git@github.com:');
    }

    const publishDir = path.join(targetDir, 'public');
    this.logger.info('publish %s from %s to gh-pages', repo, targetDir);
    await publish(publishDir, {
      logger(message) { console.log(message); },
      user: {
        name: DOC_PUBLISHER_NAME,
        email: DOC_PUBLISHER_EMAIL,
      },
      branch: BRANCH,
      repo,
      message: commmitMsg,
    });
  });
};

function publish(basePath, options) {
  return done => ghpages.publish(basePath, options, done);
}
