/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs');
const path = require('path');

/**
 * Refuse a destination that escapes its root or traverses a symbolic link.
 * @param {string} root - Allowed output directory
 * @param {string} destination - Path to inspect
 */
function assertNoSymlinkPath(root, destination) {
  const base = path.resolve(root);
  const target = path.resolve(destination);
  const relative = path.relative(base, target);
  if (
    relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)
  ) {
    throw new Error(`Refusing to write outside ${base}: ${target}`);
  }
  let current = base;
  for (const part of relative.split(path.sep).filter(item => item !== '' && item !== '.')) {
    current = path.join(current, part);
    let stat;
    try {
      stat = fs.lstatSync(current);
    } catch (error) {
      if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
        return;
      }
      throw error;
    }
    if (stat.isSymbolicLink()) {
      throw new Error(`Refusing to write through symbolic link: ${current}`);
    }
  }
}

/**
 * Recursively find all files with given extension in a directory.
 * @param {string} dir - Directory to search
 * @param {string} ext - File extension including dot (e.g. '.xmir')
 * @return {Array.<string>} List of absolute file paths
 */
function findFiles(dir, ext, visited = new Set()) {
  if (!fs.existsSync(dir)) {return [];}
  const real = fs.realpathSync(dir);
  if (visited.has(real)) {return [];}
  visited.add(real);
  const result = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    let directory = entry.isDirectory();
    if (!directory && entry.isSymbolicLink()) {
      try {
        directory = fs.statSync(full).isDirectory();
      } catch (error) {
        directory = false;
      }
    }
    if (directory) {
      result.push(...findFiles(full, ext, visited));
    } else if (entry.name.endsWith(ext)) {
      result.push(full);
    }
  }
  visited.delete(real);
  return result;
}

/**
 * Write content to a file, creating parent directories as needed.
 * @param {string} dir - Parent directory
 * @param {string} name - File name relative to dir
 * @param {Buffer} content - File content
 * @param {string} [root=dir] - Allowed output directory
 */
function saveFile(dir, name, content, root = dir) {
  const file = path.join(dir, name);
  assertNoSymlinkPath(root, file);
  fs.mkdirSync(path.dirname(file), {recursive: true});
  assertNoSymlinkPath(root, file);
  fs.writeFileSync(file, content);
}

/**
 * Recursively copy files with given extension from src to dst directory.
 * @param {string} src - Source directory
 * @param {string} dst - Destination directory
 * @param {string} ext - File extension filter (e.g. '.eo'), or empty for all files
 * @param {string} [excluded] - Directory to exclude from recursive traversal
 * @param {Set} [visited] - Real source directories already visited
 * @param {string} [root=dst] - Allowed output directory
 */
function copyDir(src, dst, ext, excluded, visited = new Set(), root = dst) {
  if (!fs.existsSync(src)) {return;}
  if (excluded && path.resolve(src) === path.resolve(excluded)) {return;}
  const real = fs.realpathSync(src);
  if (visited.has(real)) {return;}
  visited.add(real);
  assertNoSymlinkPath(root, dst);
  fs.mkdirSync(dst, {recursive: true});
  assertNoSymlinkPath(root, dst);
  for (const entry of fs.readdirSync(src, {withFileTypes: true})) {
    const source = path.join(src, entry.name);
    const dest = path.join(dst, entry.name);
    let directory = entry.isDirectory();
    if (!directory && entry.isSymbolicLink()) {
      try {
        directory = fs.statSync(source).isDirectory();
      } catch (error) {
        directory = false;
      }
    }
    if (directory) {
      copyDir(source, dest, ext, excluded, visited, root);
    } else if (!ext || entry.name.endsWith(ext)) {
      assertNoSymlinkPath(root, dest);
      fs.copyFileSync(source, dest);
    }
  }
  visited.delete(real);
}

/**
 * Write a file under an output root without following symbolic links.
 * @param {string} root - Allowed output directory
 * @param {string} file - Destination file
 * @param {string|Buffer} content - File content
 */
function safeWriteFile(root, file, content) {
  assertNoSymlinkPath(root, file);
  fs.mkdirSync(path.dirname(file), {recursive: true});
  assertNoSymlinkPath(root, file);
  fs.writeFileSync(file, content);
}

module.exports = {findFiles, saveFile, copyDir, assertNoSymlinkPath, safeWriteFile};
