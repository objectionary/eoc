/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const rel = require('relative');
const eo2jsw = require('../../eo2jsw');
const path = require('path');

/**
 * Command to transpile XMIR files into target language.
 * @param {Object} opts - All options
 * @return {Promise} of transpile task
 */
module.exports = function(opts) {
  return eo2jsw('transpile', {...opts, alone: true, project: 'project'}).then((r) => {
    console.info(`JS sources are generated in ${rel(path.resolve(opts.target, 'project'))}`);
    return r;
  });
};
