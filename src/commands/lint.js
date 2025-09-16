/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const rel = require('relative');
const path = require('path');
const {mvnw, flags} = require('../mvnw');
const semver = require('semver');

/**
 * Command to lint .XMIR files.
 * @param {Hash} opts - All options
 * @return {Promise} of assemble task
 */
module.exports = function(opts) {
  const extra = [
    `-Deo.failOnWarning=${opts.easy ? 'false' : 'true'}`,
    `-Deo.skipLinting=${opts.blind ? 'true' : 'false'}`,
  ];
  if (opts.parser.endsWith('-SNAPSHOT') || semver.gte(opts.parser, '0.45.0')) {
    return mvnw(
      ['eo:lint'].concat(flags(opts)).concat(extra),
      opts.target, opts.batch
    ).then((r) => {
      console.info('EO program linted in %s', rel(path.resolve(opts.target)));
      return r;
    }).catch((error) => {
      throw new Error(
        'There are errors and/or warnings; you may disable warnings via the --easy option'
      );
    });
  }
  return mvnw(
    ['eo:verify'].concat(flags(opts)).concat(extra),
    opts.target, opts.batch
  ).then((r) => {
    console.info('EO program verified in %s', rel(path.resolve(opts.target)));
    return r;
  }).catch((error) => {
    throw new Error('You may disable warnings via the --easy option');
  });

};
