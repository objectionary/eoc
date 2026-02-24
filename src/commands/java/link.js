/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const rel = require('relative');
const {mvnw, flags} = require('../../mvnw');
const {elapsed} = require('../../elapsed');
const path = require('path');

/**
 * Command to link binaries into a single executable binary.
 * @param {Object} opts - All options
 * @return {Promise} of link task
 */
const goals = ['jar:jar', 'shade:shade'];
module.exports = function(opts) {
  const jar = path.resolve(opts.target, 'eoc.jar');
  return elapsed(async (tracked) => {
    const r = await mvnw(goals.concat(flags(opts)), opts.target, opts.batch);
    tracked.print(`Executable JAR created at ${rel(jar)}`);
    return r;
  });
};
module.exports.goals = goals;
