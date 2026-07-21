/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const rel = require('relative');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Refuses, by throwing, to delete a directory that is the current
 * working directory, an ancestor of it, or the user's home directory;
 * otherwise returns it unchanged, so the guard cannot be skipped or
 * reordered away from the value it protects.
 * @param {String} target - Resolved absolute path of the directory to delete
 * @return {String} The same target, once confirmed safe to delete
 */
function guarded(target) {
  const cwd = process.cwd();
  const route = path.relative(target, cwd);
  const encloses = route === '' || (!route.startsWith('..') && !path.isAbsolute(route));
  if (encloses || target === os.homedir()) {
    throw new Error(
      `Refusing to delete ${rel(target)}: it is the current directory, an ancestor of it, or the home directory`
    );
  }
  return target;
}

/**
 * Deletes all temporary files.
 * @param {Hash} opts - All options
 */
module.exports = function(opts) {
  const home = guarded(path.resolve(opts.target));
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
