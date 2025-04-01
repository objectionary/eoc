/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const rel = require('relative');
const {mvnw, flags} = require('../../mvnw');
const path = require('path');

/**
 * Command to resolve all the dependencies for compilation.
 * @param {Object} opts - All options
 * @return {Promise} of resolve task
 */
module.exports = function(opts) {
  return mvnw(['eo:resolve'].concat(flags(opts)), opts.target, opts.batch)
    .then((r) => {
      const sources = path.resolve(opts.target, 'eo/6-resolve');
      console.info('Dependencies resolved in %s', rel(sources));
      return mvnw(['eo:place'].concat(flags(opts)), opts.target, opts.batch);
    }).then((r) => {
      const classes = path.resolve(opts.target, 'classes');
      console.info('Dependencies placed in %s', rel(classes));
      return r;
    });
};
