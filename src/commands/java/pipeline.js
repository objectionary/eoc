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
module.exports = function(coms, commands, opts) {
  return elapsed(async (tracked) => {
    const extraFlags = [];
    const goalList = commands.flatMap((cmd) => {
      const command = coms[cmd];
      if (command.extraFlags) {
        extraFlags.push(...command.extraFlags(opts));
      }
      return typeof command.goals === 'function' ? command.goals(opts) : command.goals || [];
    });
    const result = await mvnw(goalList.concat(flags(opts)).concat(extraFlags), opts.target, opts.batch);
    tracked.print(`Pipeline [${commands.join(' \u2192 ')}] done`);
    return result;
  });
};
