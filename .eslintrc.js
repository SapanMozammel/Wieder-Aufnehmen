// ESLint configuration that extends .formatter/.eslintrc.js
// This allows ESLint to work from the project root while keeping
// the actual configuration in .formatter/ directory

const formatterConfig = require('./.formatter/.eslintrc.js');

module.exports = formatterConfig;
