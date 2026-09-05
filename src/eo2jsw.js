/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const path = require('path');
const {execFileSync} = require('child_process'),

  /**
   * Convert eoc arguments to appropriate eo2js flags
   * @param {Object} args - eoc arguments
   * @param {String} lib - Path to eo2js lib
   * @return {Array.<String>} - Flags for eo2js, ready to pass as argv entries
   */
  flags = function(args, lib) {
    return [
      '--target', args.target,
      '--project', args.project || 'project',
      '--foreign', 'eo-foreign.json',
      '--resources', path.resolve(lib, 'resources'),
      args.alone ? '--alone' : '',
      args.tests ? '--tests' : ''
    ].filter((flag) => flag !== '');
  },

  /**
   * Wrapper for eo2js.
   * @param {String|Array.<String>} command - eo2js sub-command, or a
   *   sub-command plus its own positional arguments (e.g. `['dataize', obj]`)
   * @param {Object} args - Command arguments
   * @return {Promise<Array.<String>>}
   */
  eo2jsw = function(command, args) {
    const lib = path.resolve(__dirname, '../node_modules/eo2js/src'),
      bin = path.resolve(lib, 'eo2js.js'),
      cmd = Array.isArray(command) ? command : [command];
    return new Promise((resolve, reject) => {
      try {
        execFileSync(
          process.execPath,
          [bin, ...cmd, ...flags(args, lib)],
          {timeout: 1200000, windowsHide: true, stdio: 'inherit'}
        );
        resolve(args);
      } catch (error) {
        reject(error);
      }
    });
  };

module.exports = eo2jsw;

module.exports.flags = flags;
