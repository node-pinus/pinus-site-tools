#!/usr/bin/env node

'use strict';

const yargs = require('yargs');

yargs
.help()
.command(require('../cli/build'))
.command(require('../cli/server'))
.command(require('../cli/deploy'))
.wrap(Math.max(40, yargs.terminalWidth() - 8))
.locale('en')
.argv;

process.on('uncaughtException', function (e) {
  console.error(e.stack);
  process.exit(1);
});