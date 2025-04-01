/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const rel = require('relative');
const {mvnw, flags} = require('../mvnw');
const path = require('path');

/**
 * Command to register .EO sources.
 * @param {Hash} opts - All options
 * @return {Promise} of register task
 */
module.exports = function(opts) {
  const foreign = path.resolve(opts.target, 'eo-foreign.json');
  return mvnw(['eo:register'].concat(flags(opts)), opts.target, opts.batch).then((r) => {
    console.info('EO objects registered in %s', rel(foreign));
    return r;
  });
};
