/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const rel = require('relative');
const path = require('path');
const eo2jsw = require('../../eo2jsw');
const {program} = require('commander');

/**
 * Command to create and build NPM project.
 * @param {Object} opts - All options
 * @return {Promise} of link task
 */
module.exports = function(opts) {
  const tests = program.args[0] === 'test' || Boolean(opts.tests);
  return eo2jsw('link', {...opts, alone: true, project: 'project', tests}).then((r) => {
    console.info(`NPM project generated in ${rel(path.resolve(opts.target, 'project'))}`);
    return r;
  });
};
