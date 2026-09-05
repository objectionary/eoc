/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const {mvnw, flags} = require('../../mvnw');
const {elapsed} = require('../../elapsed');
const {verifyJavac} = require('../../jdk');

/**
 * Command to run all available unit tests.
 * @param {Object} opts - All options
 * @param {Function} maven - Maven runner, defaults to mvnw
 * @return {Promise} of compile task
 */
module.exports = function(opts, maven = mvnw) {
  verifyJavac();
  const args = [
    'surefire:test',
    `-Dstack-size=${opts.stack}`,
    `-Dheap-size=${opts.heap}`,
  ];
  if (opts.object) {
    const parts = opts.object.split('.');
    if (parts.length < 2 || parts.some((part) => part === '')) {
      throw new Error(
        `Invalid --object format: "${opts.object}", expected object.method (or pkg.object.method)`
      );
    }
    const method = parts.pop().replace(/-/g, '_');
    const cls = parts.map((p) => `EO${p.replace(/-/g, '_')}`).join('');
    args.push(`-Dtest=org.eolang.${cls}*Test#${method}`);
  }
  return elapsed(async (tracked) => {
    const result = await maven(
      args.concat(flags(opts)),
      opts.target,
      opts.batch
    );
    tracked.print('Java tests completed');
    return result;
  });
};
