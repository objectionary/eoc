/*
 * The MIT License (MIT)
 *
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const {mvnw} = require('../mvnw');

/**
 * Command to audit all packages.
 * @param {Hash} opts - All options
 * @return {Promise} of audit task
 */
module.exports = function(opts) {
  return mvnw(['--version'], null, opts.batch);
};
