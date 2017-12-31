'use strict';

const HexoBase = require('../lib/hexoBase');
const path = require('path');
const base = new HexoBase();

exports.command = 'server';
exports.desc = 'start at local';

exports.handler = function (argv) {
  base.run(({hexo}) => {
    console.info('Build document');
    hexo.call('server', {});
    console.info('Server started at http://localhost:4000');
  });
};