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
    console.error('Caught Unhandled Rejection at:' + p + 'reason:' + reason.stack);
});
exports.command = 'server';
exports.desc = 'start at local';

exports.handler = function (argv) {
  base.run(({hexo}) => {
    console.info('Build document');
    hexo.call('server', {});
    console.info('Server started at http://localhost:4000');
  });
};