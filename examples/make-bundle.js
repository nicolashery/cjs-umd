var bundle = require('../index');

var options = {
  input: 'src/index.js',
  output: 'dist/robot.js',
  exports: 'robot',
  dependencies: [
    {name: 'lodash', exports: '_'},
    {name: 'moment'}
  ]
};

bundle(options, function(err) {
  if (err) {
    console.error(err.stack);
  }
});