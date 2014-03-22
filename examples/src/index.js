var _ = require('lodash');

var foo = require('./foo');

module.exports = function () {
  _.forEach(foo, function(fn, key) {
    console.log(key + ': ' + fn());
  });
};