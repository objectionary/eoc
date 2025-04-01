/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const rel = require('relative');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Deletes all temporary files.
 * @param {Hash} opts - All options
 */
module.exports = function(opts) {
  const home = path.resolve(opts.target);
  if (fs.existsSync(home)) {
    fs.rmSync(home, {recursive: true, force: true});
    console.info('The directory %s deleted', rel(home));
  } else {
    console.info('The directory %s doesn\'t exist, no need to delete', rel(home));
  }
  if (opts.global) {
    const eo = path.join(os.homedir(), '.eo');
    if (fs.existsSync(eo)) {
      fs.rmSync(eo, {recursive: true});
      console.info('The directory %s deleted', eo);
    } else {
      console.info('The directory %s doesn\'t exist, no need to delete', eo);
    }
  }
};
