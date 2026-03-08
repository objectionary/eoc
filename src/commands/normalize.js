/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');
const {mvnw, flags} = require('../mvnw');
const {elapsed} = require('../elapsed');
const rel = require('relative');

/**
 * Command to normalize .EO files via phi-calculus using phino.
 * Runs parse, converts XMIR → .phi → normalize → .phi → XMIR → .eo.
 * Original .eo files are saved to .eoc/before-normalize/ for debugging.
 * Fails if phino is not installed.
 * @param {Object} opts - All options
 * @return {Promise} of normalize task
 */
module.exports = function(opts) {
  const sources = path.resolve(opts.sources);
  const target = path.resolve(opts.target);
  return elapsed(async (tracked) => {
    try {
      execSync('phino --version', {stdio: 'pipe'});
    } catch (e) {
      throw new Error('phino is not installed, see https://github.com/objectionary/phino', { cause: e });
    }
    const backup = path.join(target, 'before-normalize');
    copyDir(sources, backup, '.eo');
    const xmirDir = path.join(target, '1-parse');
    const phiDir = path.join(target, 'phi');
    const phiNormDir = path.join(target, 'phi-normalized');
    const xmirNormDir = path.join(target, 'xmir-normalized');
    const xmirFiles = findFiles(xmirDir, '.xmir');
    for (const xmirFile of xmirFiles) {
      const relPath = path.relative(xmirDir, xmirFile);
      const base = relPath.replace(/\.xmir$/, '');
      const phiFile = path.join(phiDir, `${base}.phi`);
      fs.mkdirSync(path.dirname(phiFile), {recursive: true});
      fs.writeFileSync(phiFile,
        execSync(`phino rewrite --input=xmir --output=phi "${xmirFile}"`, {stdio: ['pipe', 'pipe', 'pipe']}));
      const phiNormFile = path.join(phiNormDir, `${base}.phi`);
      fs.mkdirSync(path.dirname(phiNormFile), {recursive: true});
      fs.writeFileSync(phiNormFile,
        execSync(`phino rewrite --normalize "${phiFile}"`, {stdio: ['pipe', 'pipe', 'pipe']}));
      const xmirNormFile = path.join(xmirNormDir, `${base}.xmir`);
      fs.mkdirSync(path.dirname(xmirNormFile), {recursive: true});
      fs.writeFileSync(xmirNormFile,
        execSync(`phino rewrite --input=phi --output=xmir "${phiNormFile}"`, {stdio: ['pipe', 'pipe', 'pipe']}));
    }
    const r = await mvnw(
      ['eo:print']
        .concat(flags(opts))
        .concat([
          `-Deo.printSourcesDir=${xmirNormDir}`,
          `-Deo.printOutputDir=${sources}`,
        ]),
      opts.target, opts.batch
    );
    tracked.print(`EO files normalized in ${rel(sources)}`);
    return r;
  });
};

/**
 * Recursively find all files with given extension in a directory.
 * @param {string} dir - Directory to search
 * @param {string} ext - File extension including dot (e.g. '.xmir')
 * @return {Array.<string>} - List of absolute file paths
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

/**
 * Recursively copy files with given extension from src to dst directory.
 * @param {string} src - Source directory
 * @param {string} dst - Destination directory
 * @param {string} ext - File extension filter (e.g. '.eo'), or empty for all
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
