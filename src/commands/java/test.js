/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const {mvnw, flags} = require('../../mvnw');

/**
 * Command to run all available unit tests.
 * @param {Object} opts - All options
 * @return {Promise} of compile task
 */
module.exports = function(opts) {
  return mvnw(
    [
      'surefire:test',
      `-Dstack-size=${opts.stack}`,
      `-Dheap-size=${opts.heap}`,
    ].concat(flags(opts))
  );
};
