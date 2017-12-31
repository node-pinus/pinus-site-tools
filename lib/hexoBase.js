'use strict';

const Hexo = require('hexo');
const path = require('path');
const cpy = require('cpy');
const fs = require('mz/fs');
const co = require('co');
const pkg = require('../package.json');

class HexoBase {
  run(callback) {
    return co(async() => {
      this.logger = console;
      let options = {
        docPath: 'docs',
        external: [],
      };
      options.baseDir = process.cwd();
      options.targetDir = path.join(options.baseDir, 'run/site');
      
      options.hexo = new Hexo(options.targetDir, {
        debug: false,
        silent: true,
      });
      options.hexo.plugin_dir = path.join(__dirname, '../node_modules');
      await this.copyFiles(options);
      
      await options.hexo.init();
      if(callback) {
        await callback(options);
      }
    }).catch(err => {
      this.logger.error(err);
    });
  }

  async copyFiles({ baseDir, targetDir, docPath, external }) {
    // ./lib/themes > $baseDir/run/site/themes
    this.logger.info('Copy theme from %s', __dirname);
    await cpy('themes/**/*', targetDir, { cwd: __dirname, nodir: true, parents: true });

    // generate $baseDir/run/site/package.json
    const hexoPkg = {
      hexo: {},
      dependencies: {},
    };
    const deps = pkg.dependencies;
    for (const name of Object.keys(deps)) {
      if (!/^hexo-/.test(name)) continue;
      hexoPkg.dependencies[name] = deps[name];
    }
    await fs.writeFile(path.join(targetDir, 'package.json'), JSON.stringify(hexoPkg, null, 2));
    this.logger.info('Generate package.json');

    // Copy contributing
    // $baseDir/CONTRIBUTING.{locale}.md > $targetDir/source/{locale}/contributing.md
    const contribPath = path.join(baseDir, 'CONTRIBUTING.md');
    if (await fs.exists(contribPath)) {
      await cpy(contribPath, path.join(targetDir, 'source/en'), { rename });
      await cpy(contribPath, path.join(targetDir, 'source/zh-cn'), { rename });
      this.logger.info('Copy CONTRIBUTING.md');
    }

    const contribCnPath = path.join(baseDir, 'CONTRIBUTING.zh-CN.md');
    if (await fs.exists(contribCnPath)) {
      await cpy(contribCnPath, path.join(targetDir, 'source/zh-cn'), { rename });
      this.logger.info('Copy CONTRIBUTING.zh-CN.md');
    }

    await this.checkMarkdownTitle(path.join(targetDir, 'source/zh-cn/contributing.md'));
    await this.checkMarkdownTitle(path.join(targetDir, 'source/en/contributing.md'));

    // download external framework
    // const externalPath = path.join(targetDir, 'external');
    // const dirs = await this.downloadExternal(external, externalPath);
    // for (const dir of dirs) {
    //   await this.copyFramework(path.join(externalPath, dir, docPath), targetDir);
    // }

    await this.copyFramework(path.join(baseDir, docPath), targetDir);

    function rename() { return 'contributing.md'; }
  }

  async copyFramework(docPath, targetDir) {
    // $baseDir/docs/* > $targetDir/*
    this.logger.info('Copy files from %s', docPath);
    await cpy('**/*', targetDir, { cwd: docPath, nodir: true, parents: true });

    // $baseDir/docs/source/languages > $targetDir/themes/pinus/languages
    const languagePath = path.join(docPath, 'source/languages');
    if (await fs.exists(languagePath)) {
      this.logger.info('Copy files from %s', languagePath);
      await cpy('*.yml', path.join(targetDir, 'themes/pinus/languages'), { cwd: languagePath });
    }

    // $baseDir/docs/theme/* > $targetDir/themes/pinus
    const themePath = path.join(docPath, 'theme');
    await cpy('**/*', path.join(targetDir, 'themes/pinus'), { cwd: themePath, nodir: true, parents: true });
  }

  async checkMarkdownTitle(markdown) {
    const exists = await fs.exists(markdown);
    if (!exists) return;
  
    const content = await fs.readFile(markdown, 'utf8');
    let result = content;
    // # egg-security
    const reg1 = /^\s*#\s*(.+?)\n/;
    // egg-security
    // ===
    const reg2 = /^(.+?)\n===+\n/;
    if (content.match(reg1)) {
      result = content.replace(reg1, (_, title) => `title: "${title}"\n---\n`);
    } else if (content.match(reg2)) {
      result = content.replace(reg2, (_, title) => `title: "${title}"\n---\n`);
    }
  
    if (content !== result) await fs.writeFile(markdown, result);
  }
}


module.exports = HexoBase;