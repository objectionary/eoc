/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const rel = require('relative');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Resolves symbolic links in the parent part of a path.
 * @param {String} target - Path to canonicalize
 * @return {String} Path with its parent resolved
 */
function canonical(target) {
  const parent = path.dirname(target);
  return fs.existsSync(parent)
    ? path.join(fs.realpathSync(parent), path.basename(target))
    : target;
}

/**
 * Whether base is the same as or an ancestor of candidate.
 * @param {String} base - Directory that may contain candidate
 * @param {String} candidate - Path to check
 * @return {Boolean} True when candidate is inside base or equals it
 */
function containsPath(base, candidate) {
  const route = path.relative(base, candidate);
  return route === '' || (
    route !== '..' && !route.startsWith(`..${path.sep}`) && !path.isAbsolute(route)
  );
}

/**
 * Refuses, by throwing, to delete a directory that resolves to the current
 * working directory, an ancestor of it, or the user's home directory;
 * otherwise returns the original target unchanged, so the guard cannot be
 * skipped or reordered away from the value it protects.
 * @param {String} target - Resolved absolute path of the directory to delete
 * @return {String} The original target, once confirmed safe to delete
 */
function guarded(target) {
  const actual = canonical(target);
  const cwd = fs.realpathSync(process.cwd());
  const home = fs.realpathSync(os.homedir());
  const encloses = containsPath(actual, cwd);
  const encloses_home = containsPath(actual, home);
  if (encloses || encloses_home) {
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
