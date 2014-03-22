#!/usr/bin/env node
var program = require('commander');
var _ = require('lodash');
var bundle = require('../index');

program
  .version(require('../package.json').version)
  .option('-i, --input <file>', 'input file (required)')
  .option('-o, --output <file>', 'output file (defaults to <input>.out.js)')
  .option('-e, --exports <string>', 'global variable attached to window object')
  .option('-d, --dependencies <list>',
    'optional list of external dependencies with format <name[:exports]>\n' +
    '\t\t\t\t(ex: --dependencies lodash:_,moment)', parseDependencies)
  .option('-q, --quoteChar <char>')
  .option('-t, --headTemplate <file>')
  .option('-r, --requireDepFunctionName <string>')
  .option('-l, --oldHeadLengthNoExports <int>')
  .parse(process.argv);

if (!program.input) {
  program.help();
}

function parseDependencies(str) {
  var deps = str.split(',');
  deps = _.map(deps, function(depStr) {
    var depValues = depStr.split(':');
    if (!depValues.length) {
      return;
    }
    var dep = {name: depValues[0]};
    if (depValues.length >= 2) {
      dep.exports = depValues[1];
    }
    return dep;
  });
  return deps;
}

bundle(program, function(err) {
  if (err) {
    console.error(err.stack);
  }
});