var fs = require('fs');
var _ = require('lodash');
var cjs = require('pure-cjs');
var replaceStream = require('replacestream');
var wrap = require('umd-wrap');

var defaults = {
  dependencies: [],
  transform: [],
  quoteChar: '\'',
  requireDepFunctionName: '_requireDep',
  pureCjsTailLengthToReplace: 19
};

function applyDefaults(options) {
  return _.extend({}, defaults, options);
}

function checkOptions(options) {
  var required = ['input', 'output'];
  _.forEach(required, function(name) {
    if (!options[name]) {
      throw new Error('`options.' + name + '` is required by CJS-UMD Bundler');
    }
  });
}

function addTransforms(options) {
  var transforms = options.transform;
  var replaceDependencies = dependencyTransforms(options,
                                                 options.dependencies);
  transforms = transforms.concat(replaceDependencies);
  options.transform = transforms;
  return options;
}

function dependencyTransforms(options, dependencies) {
  var requireStr = requireStatement.bind(null, options);
  return _.map(dependencies, function(dependency) {
    return function() {
      return replaceStream(
        requireStr('require', dependency.name),
        requireStr(options.requireDepFunctionName, dependency.name)
      );
    };
  });
}

function requireStatement(options, requireFunctionName, dependencyName) {
  var quote = options.quoteChar;
  return [
    requireFunctionName,
    '(',
    quote,
    dependencyName,
    quote,
    ')'
  ].join('');
}

function cjsTransform(options, cb) {
  cjs.transform(cjsOptions(options)).then(function(result) {
    cb(null, result.code);
  }, function (err) {
    cb(err);
  });
}

function cjsOptions(options) {
  return _.omit(options, 'exports');
}

function replacePureCjsTail(options, code) {
  var size = options.pureCjsTailLengthToReplace;

  // Allow to easily skip this replace by giving a size of 0
  if (!size) {
    return code;
  }

  if (code.length < size) {
    throw new Error('Expected code length of at least ' + size);
  }

  // Just insert a "return" statement
  return [
    code.slice(0, code.length - size),
    ' return ',
    code.slice(code.length - size)
  ].join('');
}

function bundle(options, cb) {
  options = options || {};
  options = applyDefaults(options);
  checkOptions(options);
  options = addTransforms(options);

  cjsTransform(options, function(err, code) {
    if (err) {
      return cb(err);
    }

    code = replacePureCjsTail(options, code);

    options.code = code;
    wrap(options, function(err, code) {
      if (err) {
        return cb(err);
      }

      fs.writeFile(options.output, code, cb);
    });
  });
}

module.exports = bundle;