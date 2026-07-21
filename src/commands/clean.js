/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const rel = require('relative');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Checks that deleting the given directory would not destroy anything
 * outside the project's own temporary files: the current working
 * directory itself, an ancestor of it, or the user's home directory.
 * @param {String} target - Resolved absolute path of the directory to delete
 * @return {Boolean} True when the target is not the current directory,
 *  an ancestor of it, or the home directory
 */
function isSafeToDelete(target) {
  const cwd = process.cwd();
  const fromTargetToCwd = path.relative(target, cwd);
  const targetIsCwdOrAncestor = fromTargetToCwd === '' ||
    (!fromTargetToCwd.startsWith('..') && !path.isAbsolute(fromTargetToCwd));
  return !targetIsCwdOrAncestor && target !== os.homedir();
}

/**
 * Deletes all temporary files.
 * @param {Hash} opts - All options
 */
module.exports = function(opts) {
  const home = path.resolve(opts.target);
  if (!isSafeToDelete(home)) {
    throw new Error(
      `Refusing to delete ${rel(home)}: it is the current directory, an ancestor of it, or the home directory`
    );
  }
  if (fs.existsSync(home)) {
    fs.rmSync(home, {recursive: true, force: true});
    console.info('The directory %s was deleted', rel(home));
  } else {
    console.info('The directory %s does not exist, no need to delete it', rel(home));
  }
  if (opts.global) {
    const eo = path.join(os.homedir(), '.eo');
    if (fs.existsSync(eo)) {
      fs.rmSync(eo, {recursive: true});
      console.info('The directory %s was deleted', eo);
    } else {
      console.info('The directory %s does not exist, no need to delete it', eo);
    }
  }
};
