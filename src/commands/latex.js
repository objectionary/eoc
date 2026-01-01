/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const rel = require('relative');
const {mvnw, flags} = require('../mvnw');
const {elapsed} = require('../elapsed');
const path = require('path');
const fs = require('fs');

/**
 * Command to generate LaTeX files from XMIR.
 * @param {Object} opts - All options
 * @return {Promise} of latex generation task
 */
module.exports = function(opts) {
  const latex = path.resolve(opts.target, 'latex');
  return elapsed(async (tracked) => {
    const r = await mvnw(['eo:latex'].concat(flags(opts)), opts.target, opts.batch);
    tracked.print(`LaTeX files generated in ${rel(latex)}`);
    return r;
  });
};
