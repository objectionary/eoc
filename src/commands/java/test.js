/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const {mvnw, flags} = require('../../mvnw');

/**
 * Command to run all available unit tests.
 * @param {Object} opts - All options
 * @param {Function} maven - Maven runner, defaults to mvnw
 * @return {Promise} of compile task
 */
module.exports = function(opts, maven = mvnw) {
  const args = [
    'surefire:test',
    `-Dstack-size=${opts.stack}`,
    `-Dheap-size=${opts.heap}`,
  ];
  if (opts.object) {
    const parts = opts.object.split('.');
    const obj = parts.pop().replace(/-/g, '_');
    const pkg = parts.map((p) => `EO${p.replace(/-/g, '_')}`).join('.');
    const cls = `EO${obj}Test`;
    args.push(`-Dtest=${pkg ? `org.eolang.${pkg}.${cls}` : `org.eolang.${cls}`}`);
  }
  return maven(args.concat(flags(opts)));
};
