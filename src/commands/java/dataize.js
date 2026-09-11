/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const path = require('path');
const {spawn} = require('node:child_process');
const {verifyJavac} = require('../../jdk');

/**
 * Runs the single executable binary.
 * @param {String} obj - Name of object to dataize
 * @param {Array} args - Arguments
 * @param {Object} opts - All options
 * @param {Function} [exec] - Optional command runner for the JDK check
 * @param {Function} [runner] - Optional Java process runner
 * @return {Promise} Resolves when the JVM exits successfully
 */
module.exports = function(obj, args, opts, exec, runner = spawn) {
  verifyJavac(exec);
  const params = [
    '-Dfile.encoding=UTF-8',
    `-Xss${opts.stack}`,
    `-Xmx${opts.heap}`,
    '-jar', path.resolve(opts.target, 'eoc.jar'),
  ].concat(opts.verbose ? ['--verbose'] : []).concat([obj]).concat(args);
  console.debug(`+ java ${params.join(' ')}`);
  const child = runner('java', params, {stdio: 'inherit'});
  return new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`JVM failed with exit code ${code}`));
      }
    });
  });
};
