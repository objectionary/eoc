/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const rel = require('relative');
const {mvnw, flags} = require('../../mvnw');
const path = require('path');

/**
 * Command to compile target language into binaries.
 * @param {Object} opts - All options
 * @return {Promise} of compile task
 */
module.exports = function(opts) {
  const target = path.resolve(opts.target);
  /**
   * @todo #368:30min Wrap logs in 'elapsed'
   *  It is necessary to use 'elapsed' in all logging cases that require output of elapsed time
   */
  return mvnw(['test-compile'].concat(flags(opts)), opts.target, opts.batch).then((r) => {
    console.info('Java .class files compiled into %s', rel(target));
    return r;
  });
};
