/*
 * The MIT License (MIT)
 *
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const eo2jsw = require('../../eo2jsw');

/**
 * Command to run all available unit tests.
 * @param {Object} opts - All options
 * @return {Promise} of compile task
 */
module.exports = function(opts) {
  return eo2jsw('test', {...opts, alone: true, project: 'project'});
};
