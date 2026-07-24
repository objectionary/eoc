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
    if (opts.object.split('.').filter(Boolean).length < 2) {
      throw new Error(
        `Invalid --object format: expected object.method (or pkg.object.method), got "${opts.object}"`
      );
    }
    const parts = opts.object.split('.');
    const method = parts.pop().replace(/-/g, '_');
    const obj = parts.pop().replace(/-/g, '_');
    const pkg = parts.map((p) => `EO${p.replace(/-/g, '_')}`).join('.');
    const cls = `EO${obj}*Test`;
    args.push(
      `-Dtest=${pkg ? `org.eolang.${pkg}.${cls}` : `org.eolang.${cls}`}#${method}`
    );
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
