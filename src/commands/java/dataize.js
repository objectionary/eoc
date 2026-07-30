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
 */
module.exports = function(obj, args, opts, exec, runner = spawn) {
  verifyJavac(exec);
  const params = [
    '-Dfile.encoding=UTF-8',
    `-Xss${opts.stack}`,
    `-Xmx${opts.heap}`,
    '-jar', path.resolve(opts.target, 'eoc.jar'),
    opts.verbose ? '--verbose' : '',
    obj,
    ...args,
  ].filter((i) => i);
  console.debug(`+ java ${params.join(' ')}`);
  runner('java', params, {stdio: 'inherit'}).on('close', (code) => {
    if (code !== 0) {
      console.error(`JVM failed with exit code ${code}`);
      process.exit(1);
    }
  });
};
