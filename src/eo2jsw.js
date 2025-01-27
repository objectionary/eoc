/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2022-2025 Objectionary.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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
