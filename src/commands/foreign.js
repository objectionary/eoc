/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const rel = require('relative');
const path = require('path');
const fs = require('fs');

/**
 * Inspects and prints the list of foreign objects.
 * @param {Hash} opts - All options
 */
module.exports = function(opts) {
  const file = path.resolve(opts.target, 'eo-foreign.json');
  const all = JSON.parse(fs.readFileSync(file, 'utf8'));
  console.info('There are %d objects in %s:', all.length, rel(file));
  all.forEach((obj) => {
    console.info('  %s', obj['id']);
  });
};
