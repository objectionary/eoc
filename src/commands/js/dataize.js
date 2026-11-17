/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const eo2jsw = require('../../eo2jsw');

/**
 * Runs the single executable binary.
 * @param {String} obj - Name of object to dataize
 * @param {Array} args - Arguments
 * @param {Object} opts - All options
 * @param {Function} [run] - Optional runner, defaults to eo2jsw
 * @return {Promise} of executed command
 */
module.exports = function(obj, args, opts, run = eo2jsw) {
  return run(
    ['dataize', obj, ...args],
    {...opts, alone: true, project: 'project'}
  );
};
