/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const rel = require('relative');
const path = require('path');
const {mvnw, flags} = require('../mvnw');
const {elapsed} = require('../elapsed');

/**
 * Command to assemble .XMIR files.
 * @param {Hash} opts - All options
 * @return {Promise} of assemble task
 */
module.exports = function(opts) {
  const target = path.resolve(opts.target);
  return elapsed(async (tracked) => {
    const r = await mvnw(['eo:assemble'].concat(flags(opts)), opts.target, opts.batch);
    tracked.print(`EO program assembled in ${rel(target)}`);
    return r;
  });
};
