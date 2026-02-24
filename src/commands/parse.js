/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const rel = require('relative');
const path = require('path');
const {mvnw, flags} = require('../mvnw');
const {elapsed} = require('../elapsed');

/**
 * Command to parse EO into .XMIR files.
 * @param {Hash} opts - All options
 * @return {Promise} of assemble task
 */
const goals = ['eo:parse'];
module.exports = function(opts) {
  const target = path.resolve(opts.target);
  return elapsed(async (tracked) => {
    const r = await mvnw(goals.concat(flags(opts)), opts.target, opts.batch);
    tracked.print(`EO sources parsed in ${rel(target)}`);
    return r;
  });
};
module.exports.goals = goals;
