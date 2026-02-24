/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

/**
 * Runs multiple JS pipeline steps sequentially.
 * @param {Array.<String>} commands - Command names to run in order
 * @param {Object} opts - All options
 * @return {Promise} of pipeline task
 */
module.exports = async function(commands, opts) {
  const coms = this;
  for (const cmd of commands) {
    await coms[cmd](opts);
  }
};
