/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const rel = require('relative');
const path = require('path');
const {mvnw, flags} = require('../mvnw');
const {elapsed} = require('../elapsed');

/**
 * Command to enforce the canonical layout of .EO sources. It fails when a
 * source file disagrees with the way the printer renders it back, unless the
 * "fix" option is on, in which case the file is overwritten instead.
 * @param {Hash} opts - All options
 * @return {Promise} of format task
 */
module.exports = function(opts) {
  const sources = path.resolve(opts.sources);
  return elapsed(async (tracked) => {
    const r = await mvnw(
      goals().concat(flags(opts)).concat(extras(opts)),
      opts.target, opts.batch
    );
    tracked.print(
      opts.fix ?
        `EO files formatted in ${rel(sources)}` :
        `EO files in ${rel(sources)} are formatted`
    );
    return r;
  });
};

/**
 * Command to get Maven goals for format command.
 * @return {Array.<String>} of Maven goals to run for format command
 */
module.exports.goals = goals;

/**
 * Command to get extra Maven flags for format command.
 * @return {Array.<String>} of extra Maven flags to run for format command
 */
module.exports.extras = extras;

function goals() {
  return ['eo:format'];
}

function extras(opts) {
  return [`-Deo.autoFix=${opts.fix ? 'true' : 'false'}`];
}
