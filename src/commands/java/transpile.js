/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const rel = require('relative');
const {mvnw, flags} = require('../../mvnw');
const {elapsed} = require('../../elapsed');
const path = require('path');

/**
 * Command to transpile XMIR files into target language.
 * @param {Object} opts - All options
 * @return {Promise} of transpile task
 */
module.exports = function(opts) {
  const sources = path.resolve(opts.target, 'generated-sources');
  return elapsed(async (tracked) => {
    const r = await mvnw(goals().concat(flags(opts)), opts.target, opts.batch);
    tracked.print(`Java sources generated in ${rel(sources)}`);
    return r;
  });
};

/**
 * Command to get Maven goals for transpile command.
 *
 * `eo:merge` runs first: it puts every member of a package inside the object
 * the package names, the way `eo-runtime` builds itself. Without it a member
 * such as `string/regex.eo` stays in an `EO_string` package of its own and
 * the generated Java names classes the runtime jar does not carry.
 *
 * @return {Array.<String>} of Maven goals to run for transpile command
 */
module.exports.goals = goals;

function goals() {
  return ['eo:merge', 'eo:transpile'];
}
