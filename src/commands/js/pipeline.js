/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const {elapsed} = require('../../elapsed');

/**
 * Runs multiple JS pipeline steps sequentially.
 * @param {Object} coms - Command map to resolve step functions from
 * @param {Array.<String>} commands - Command names to run in order
 * @param {Object} opts - All options
 * @return {Promise} of pipeline task
 */
module.exports = function(coms, commands, opts) {
  return elapsed(async (tracked) => {
    for (const cmd of commands) {
      // eslint-disable-next-line no-await-in-loop
      await coms[cmd](opts);
    }
    tracked.print(`Pipeline [${commands.join(' \u2192 ')}] done`);
  });
};
