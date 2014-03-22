var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var cjs = require('pure-cjs');
var replaceStream = require('replacestream');

var defaults = {
  dependencies: [],
  transform: [],
  quoteChar: '\'',
  headTemplate: 'templates/head.js',
  requireDepFunctionName: '_requireDep',
  oldHeadLengthNoExports: 270
};

function applyDefaults(options) {
  return _.extend({}, defaults, options);
}

function checkOptions(options) {
  var required = ['input', 'output', 'exports'];
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
  cjs.transform(options).then(function(result) {
    cb(null, result.code);
  }, function (err) {
    cb(err);
  });
}

function replaceHead(options, template, code) {
  var oldHeadLength = options.oldHeadLengthNoExports + options.exports.length;
  var data = headData(options);
  var head = headContent(options, template, data);
  return head + code.slice(oldHeadLength);
}

function headContent(options, template, data) {
  return _.template(template, data);
}

function headData(options) {
  return {
    cjsDependencies: _.map(options.dependencies, function(dep) {
      return 'require(\'' + dep.name + '\')';
    }).join(', '),

    amdDependencies: _.map(options.dependencies, function(dep) {
      return '\'' + dep.name + '\'';
    }).join(', '),

    globalAlias: options.exports,

    globalDependencies: _.map(options.dependencies, function(dep) {
      return 'root[\'' + (dep.exports || dep.name) + '\']';
    }).join(', '),

    dependencyExports: _.map(options.dependencies, function(dep) {
      return (dep.exports || dep.name);
    }).join(', '),

    dependencyNameToExportsMapping: _.map(options.dependencies, function(dep) {
      return '\'' + dep.name + '\': ' + (dep.exports || dep.name);
    }).join(', ')
  };
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

    var templatePath = path.join(__dirname, options.headTemplate);
    fs.readFile(templatePath, function(err, template) {
      if (err) {
        return cb(err);
      }

      code = replaceHead(options, template, code);
      fs.writeFile(options.output, code, cb);
    });
  });
}

module.exports = bundle;