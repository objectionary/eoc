/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const rel = require('relative');
const path = require('path');
const {mvnw, flags} = require('../mvnw');
const {elapsed} = require('../elapsed');
const semver = require('semver');

/**
 * Command to lint .XMIR files.
 * @param {Hash} opts - All options
 * @return {Promise} of assemble task
 */
module.exports = function(opts) {
  const extra = extraFlags(opts);
  return elapsed(async (tracked) => {
    if (goals(opts)[0] === 'eo:lint') {
      try {
        const r = await mvnw(
          goals(opts).concat(flags(opts)).concat(extra),
          opts.target, opts.batch
        );
        tracked.print(`EO program linted in ${rel(path.resolve(opts.target))}`);
        return r;
      } catch (error) {
        throw new Error(
          'There are errors and/or warnings; you may disable warnings via the --easy option',
          {cause: error}
        );
      }
    }
    try {
      const r = await mvnw(
        goals(opts).concat(flags(opts)).concat(extra),
        opts.target, opts.batch
      );
      tracked.print(`EO program verified in ${rel(path.resolve(opts.target))}`);
      return r;
    } catch (error) {
      throw new Error(
        'You may disable warnings via the --easy option',
        {cause: error}
      );
    }
  });
};

/**
 * Command to get Maven goals for lint command.
 * @return {Array.<String>} of Maven goals to run for lint command
 */
module.exports.goals = goals;

/**
* Command to get extra Maven flags for lint command.
* @return {Array.<String>} of extra Maven flags to run for lint command
*/
module.exports.extras = extras;

function goals(opts) {
  if (opts.parser.endsWith('-SNAPSHOT') || semver.gte(opts.parser, '0.45.0')) {
    return ['eo:lint'];
  }
  return ['eo:verify'];
}

function extras(opts) {
  return [`-Deo.failOnWarning=${opts.easy ? 'false' : 'true'}`];
}
