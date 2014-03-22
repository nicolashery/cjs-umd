var moment = require('moment');

module.exports = {
  now: function() { return moment().format(); },
  greet: function() { return 'Hello World'; }
};