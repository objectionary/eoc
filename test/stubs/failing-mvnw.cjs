/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const Module = require('module');
const path = require('path');
const file = require.resolve(path.resolve(__dirname, '../../src/mvnw.js'));
const real = require(file);
const stub = new Module(file, null);
stub.filename = file;
stub.loaded = true;
stub.exports = {
  mvnw: () => Promise.reject(new Error('the Maven command exited with #1 code')),
  flags: real.flags,
  summary: real.summary
};
require.cache[file] = stub;
