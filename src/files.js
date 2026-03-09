/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs');
const path = require('path');

/**
 * Recursively find all files with given extension in a directory.
 * @param {string} dir - Directory to search
 * @param {string} ext - File extension including dot (e.g. '.xmir')
 * @return {Array.<string>} List of absolute file paths
 */
function findFiles(dir, ext) {
  if (!fs.existsSync(dir)) {return [];}
  const result = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...findFiles(full, ext));
    } else if (entry.name.endsWith(ext)) {
      result.push(full);
    }
  }
  return result;
}
module.exports.findFiles = findFiles;

/**
 * Write content to a file, creating parent directories as needed.
 * @param {string} dir - Parent directory
 * @param {string} name - File name relative to dir
 * @param {Buffer} content - File content
 */
function saveFile(dir, name, content) {
  const file = path.join(dir, name);
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, content);
}
module.exports.saveFile = saveFile;

/**
 * Recursively copy files with given extension from src to dst directory.
 * @param {string} src - Source directory
 * @param {string} dst - Destination directory
 * @param {string} ext - File extension filter (e.g. '.eo'), or empty for all files
 */
function copyDir(src, dst, ext) {
  if (!fs.existsSync(src)) {return;}
  fs.mkdirSync(dst, {recursive: true});
  for (const entry of fs.readdirSync(src, {withFileTypes: true})) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, dstPath, ext);
    } else if (!ext || entry.name.endsWith(ext)) {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}
module.exports.copyDir = copyDir;
