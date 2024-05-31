const path = require('path');
const {execSync} = require('child_process');

/**
 * Convert eoc arguments to appropriate eo2js flags
 * @param {Object} args - eoc arguments
 * @param {String} lib - Path to eo2js lib
 * @return {Array.<String>} - Flags for eo2js
 */
const flags = function(args, lib) {
  return [
    '--target', args.target,
    '--project', args.project || 'project',
    '--foreign eo-foreign.json',
    '--resources', path.resolve(lib, 'resources'),
    args.alone ? '--alone' : '',
    args.tests ? '--tests' : ''
  ];
};

/**
 * Wrapper for eo2js.
 * @param {String} command - Command to execute
 * @param {Object} args - Command arguments
 * @return {Promise<Array.<String>>}
 */
const eo2jsw = function(command, args) {
  const lib = path.resolve(__dirname, '../node_modules/eo2js/src');
  const bin = path.resolve(lib, 'eo2js.js');
  return new Promise((resolve, reject) => {
    execSync(
      `node ${bin} ${command} ${flags(args, lib).filter((flag) => flag !== '').join(' ')}`,
      {
        timeout: 1200000,
        windowsHide: true,
        stdio: 'inherit'
      }
    );
    resolve(args);
  });
};

module.exports = eo2jsw;
