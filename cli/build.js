'use strict';

const HexoBase = require('../lib/hexoBase');
const path = require('path');
const base = new HexoBase();

// 捕获普通异常
process.on('uncaughtException', function (err)
{
    console.error('Caught exception: ' + err.stack);
});

// 捕获async异常
process.on('unhandledRejection', (reason, p) => {
    console.error('Caught Unhandled Rejection at:' + p + 'reason:'  + JSON.stringify(reason));
});
exports.command = 'build';
exports.desc = 'build document';

exports.handler = function (argv) {
  base.run(({hexo}) => {
    console.info('Build Document');
    hexo.call('generate', {});
  });
};