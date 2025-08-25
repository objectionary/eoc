/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const path = require('path');
const {spawn} = require('node:child_process');

/**
 * Runs the single executable binary.
 * @param {String} obj - Name of object to dataize
 * @param {Array} args - Arguments
 * @param {Object} opts - All options
 */
module.exports = function(obj, args, opts) {
  const params = [
    '-Dfile.encoding=UTF-8',
    `-Xss${opts.stack}`,
    `-Xms${opts.heap}`,
    '-jar', path.resolve(opts.target, 'eoc.jar'),
    opts.verbose ? '--verbose' : '',
    obj,
    ...args,
  ].filter((i) => i);
  console.debug(`+ java ${params.join(' ')}`);
  spawn('java', params, {stdio: 'inherit'}).on('close', (code) => {
    if (code !== 0) {
      console.error(`JVM failed with exit code ${code}`);
      process.exit(1);
    }
  });
};
