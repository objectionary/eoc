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
  const extra = [
    `-Deo.failOnWarning=${opts.easy ? 'false' : 'true'}`,
  ];
  return elapsed(async (tracked) => {
    if (opts.parser.endsWith('-SNAPSHOT') || semver.gte(opts.parser, '0.45.0')) {
      try {
        const r = await mvnw(
          ['eo:lint'].concat(flags(opts)).concat(extra),
          opts.target, opts.batch
        );
        tracked.print(`EO program linted in ${rel(path.resolve(opts.target))}`);
        return r;
      } catch (error) {
        throw new Error(
          'There are errors and/or warnings; you may disable warnings via the --easy option',
          { cause: error }
        );
      }
    }
    try {
      const r = await mvnw(
        ['eo:verify'].concat(flags(opts)).concat(extra),
        opts.target, opts.batch
      );
      tracked.print(`EO program verified in ${rel(path.resolve(opts.target))}`);
      return r;
    } catch (error) {
      throw new Error(
        'You may disable warnings via the --easy option',
        { cause: error }
      );
    }
  });
};
