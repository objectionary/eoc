/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const rel = require('relative');
const {mvnw, flags} = require('../../mvnw');
const path = require('path');

/**
 * Command to link binaries into a single executable binary.
 * @param {Object} opts - All options
 * @return {Promise} of link task
 */
module.exports = async function(opts) {
  const jar = path.resolve(opts.target, 'eoc.jar');
  const r = await mvnw(['jar:jar', 'shade:shade'].concat(flags(opts)), opts.target, opts.batch);
  console.info('Executable JAR created at %s', rel(jar));
  return r;
};
