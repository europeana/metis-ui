let properties = null;
const originalConfigFn = require('../../karma.conf.cjs');
originalConfigFn({ set: function(arg) { properties = arg; } });

/** Override here as needed, i.e.

  properties.preprocessors = {
    'src/app/path/file.ts': ['coverage']
  };

*/

// export settings
module.exports = function (config) {
  config.set(properties);
};
