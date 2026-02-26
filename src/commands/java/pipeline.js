/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const {mvnw, flags} = require('../../mvnw');
const {elapsed} = require('../../elapsed');

/**
 * Runs multiple Maven goals in a single Maven invocation.
 * @param {Object} coms - Command map to resolve goals and extra flags from
 * @param {Array.<String>} commands - Command names to run in order
 * @param {Object} opts - All options
 * @return {Promise} of pipeline task
 */
module.exports = function(coms, commands, opts, maven = mvnw) {
  return elapsed(async (tracked) => {
    const {goals, extras} = collect(coms, commands, opts);
    const result = await maven(goals.concat(flags(opts)).concat(extras), opts.target, opts.batch);
    tracked.print(`Pipeline [${commands.join(' \u2192 ')}] done`);
    return result;
  });
};

function collect(coms, commands, opts) {
  const extras = [];
  const goals = commands.flatMap((cmd) => {
    const command = coms[cmd];
    if (command.extras) {
      extras.push(...command.extras(opts));
    }
    return command.goals(opts) || [];
  });
  return {goals, extras};
};

