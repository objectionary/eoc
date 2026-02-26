/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const rel = require('relative');
const {mvnw, flags} = require('../mvnw');
const {elapsed} = require('../elapsed');
const path = require('path');

/**
 * Command to register .EO sources.
 * @param {Hash} opts - All options
 * @return {Promise} of register task
 */
module.exports = function(opts) {
  const foreign = path.resolve(opts.target, 'eo-foreign.json');
  return elapsed(async (tracked) => {
    const r = await mvnw(goals().concat(flags(opts)), opts.target, opts.batch);
    tracked.print(`EO objects registered in ${rel(foreign)}`);
    return r;
  });
};

/**
 * Command to get Maven goals for register command.
 * @return {Array.<String>} of Maven goals to run for register command
 */
module.exports.goals = goals;

function goals() {
  return ['eo:register'];
}

