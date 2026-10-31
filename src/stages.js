/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const rel = require('relative');
const {findFiles} = require('./files');

/**
 * Fail when a pipeline stage has left no files for the next one to read.
 * @param {String} dir - Directory the stage writes to
 * @param {String} ext - Extension of the files it produces, e.g. '.xmir'
 * @param {String} command - The eoc command that fills the directory
 */
module.exports.filled = function(dir, ext, command) {
  if (findFiles(dir, ext).length === 0) {
    throw new Error(
      `There are no ${ext} files in ${rel(dir)}, run "eoc ${command}" first`
    );
  }
};
