/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const rel = require('relative');
const eo2jsw = require('../../eo2jsw');
const {elapsed} = require('../../elapsed');
const path = require('path');

/**
 * Command to transpile XMIR files into target language.
 * @param {Object} opts - All options
 * @return {Promise} of transpile task
 */
module.exports = function(opts) {
  return elapsed(async (tracked) => {
    const r = await eo2jsw('transpile', { ...opts, alone: true, project: 'project' });
    tracked.print(`JS sources generated in ${rel(path.resolve(opts.target, 'project'))}`);
    return r;
  });
};
