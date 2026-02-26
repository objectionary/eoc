/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */
const rel = require('relative');
const {mvnw, flags} = require('../../mvnw');
const {elapsed} = require('../../elapsed');
const path = require('path');

/**
 * Command to compile target language into binaries.
 * @param {Object} opts - All options
 * @return {Promise} of compile task
 */
module.exports = function(opts) {
  const target = path.resolve(opts.target);
  return elapsed(async (tracked) => {
    const r = await mvnw(goals().concat(flags(opts)), opts.target, opts.batch);
    tracked.print(`Java .class files compiled in ${rel(target)}`);
    return r;
  });
};

/**
 * Method to get Maven goals for compile command.
 * @return {Array.<String>} of Maven goals to run for compile command
 */
module.exports.goals = goals;

function goals() {
  return ['test-compile'];
}
