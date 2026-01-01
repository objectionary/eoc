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
 * @return {Promise} of executed command
 */
module.exports = function(obj, args, opts) {
  return eo2jsw(
    ['dataize', obj, ...args.filter((arg) => !arg.startsWith('-'))].join(' '),
    {...opts, alone: true, project: 'project'}
  );
};
