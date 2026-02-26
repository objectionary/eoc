/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const {mvnw, flags} = require('../../mvnw');
const {elapsed} = require('../../elapsed');

/**
 * Collects Maven goals and extra flags from the command map.
 * @param {Object} coms - Command map to resolve goals and extra flags from
 * @param {Array.<String>} commands - Command names to collect goals for
 * @param {Object} opts - All options
 * @return {{goalList: Array.<String>, flagList: Array.<String>}}
 */
const collect = function(coms, commands, opts) {
  const flagList = [];
  const goalList = commands.flatMap((cmd) => {
    const command = coms[cmd];
    if (command.extraFlags) {
      flagList.push(...command.extraFlags(opts));
    }
    return typeof command.goals === 'function' ? command.goals(opts) : command.goals || [];
  });
  return {goalList, flagList};
};

/**
 * Runs multiple Maven goals in a single Maven invocation.
 * @param {Object} coms - Command map to resolve goals and extra flags from
 * @param {Array.<String>} commands - Command names to run in order
 * @param {Object} opts - All options
 * @return {Promise} of pipeline task
 */
module.exports = function(coms, commands, opts) {
  return elapsed(async (tracked) => {
    const {goalList, flagList} = collect(coms, commands, opts);
    const result = await mvnw(goalList.concat(flags(opts)).concat(flagList), opts.target, opts.batch);
    tracked.print(`Pipeline [${commands.join(' \u2192 ')}] done`);
    return result;
  });
};
module.exports.collect = collect;
