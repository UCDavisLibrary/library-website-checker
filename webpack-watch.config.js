let config = require('@ucd-lib/cork-app-build').watch({
  root : __dirname,
  entry : 'client/elements/library-site-checker.js',
  preview : 'client/js',
  clientModules : 'client/node_modules'
});

module.exports = config;