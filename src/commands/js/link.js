/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const rel = require('relative');
const path = require('path');
const eo2jsw = require('../../eo2jsw');
const {elapsed} = require('../../elapsed');
const {program} = require('commander');

/**
 * Command to create and build NPM project.
 * @param {Object} opts - All options
 * @return {Promise} of link task
 */
module.exports = function(opts) {
  return elapsed(async (tracked) => {
    const tests = program.args[0] === 'test' || Boolean(opts.tests);
    const r = await eo2jsw('link', { ...opts, alone: true, project: 'project', tests });
    tracked.print(`NPM project generated in ${rel(path.resolve(opts.target, 'project'))}`);
    return r;
  });
};
