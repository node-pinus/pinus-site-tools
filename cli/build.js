'use strict';

const HexoBase = require('../lib/hexoBase');
const path = require('path');
const base = new HexoBase();

exports.command = 'build';
exports.desc = 'build document';

exports.handler = function (argv) {
  base.run(({hexo}) => {
    console.info('Build Document');
    hexo.call('generate', {});
  });
};