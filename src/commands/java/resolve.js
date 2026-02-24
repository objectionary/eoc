/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const rel = require('relative');
const {mvnw, flags} = require('../../mvnw');
const {elapsed} = require('../../elapsed');
const path = require('path');

/**
 * Command to resolve all the dependencies for compilation.
 * @param {Object} opts - All options
 * @return {Promise} of resolve task
 */
const goals = ['eo:resolve', 'eo:place'];
module.exports = function(opts) {
  return elapsed(async (tracked) => {
    const r = await mvnw(goals.concat(flags(opts)), opts.target, opts.batch);
    const classes = path.resolve(opts.target, 'classes');
    tracked.print(`Dependencies placed in ${rel(classes)}`);
    return r;
  });
};
module.exports.goals = goals;
