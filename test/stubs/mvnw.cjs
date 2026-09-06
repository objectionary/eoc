/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const Module = require('module');
const path = require('path');
const file = require.resolve(path.resolve(__dirname, '../../src/mvnw.js'));

/**
 * Maven, replaced by a stub that only prints the goals it was asked to run.
 * @param {Array.<String>} args - Maven arguments
 * @return {Promise<Array.<String>>} of the same arguments
 */
const mvnw = function(args) {
  console.log(`>>> goals: ${JSON.stringify(args.filter((a) => a.startsWith('eo:')))}`);
  return Promise.resolve(args);
};

const stub = new Module(file, null);
stub.filename = file;
stub.loaded = true;
stub.exports = {
  mvnw,
  flags: () => [],
  summary: () => 'stub'
};
require.cache[file] = stub;
