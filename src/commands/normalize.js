/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const path = require('path');
const {execSync} = require('child_process');
const {mvnw, flags} = require('../mvnw');
const {elapsed} = require('../elapsed');
const {findFiles, saveFile, copyDir} = require('../files');
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
  if (opts.sources === undefined) {
    throw new Error('Sources directory is not specified. Please provide it with --sources option.');
  }
  if (opts.target === undefined) {
    throw new Error('Target directory is not specified. Please provide it with --target option.');
  }
  const sources = path.resolve(opts.sources);
  const target = path.resolve(opts.target);
  return elapsed(async (tracked) => {
    try {
      execSync('phino --version', {stdio: 'pipe'});
    } catch (e) {
      throw new Error('phino is not installed, see https://github.com/objectionary/phino', { cause: e });
    }
    copyDir(sources, path.join(target, 'before-normalize'), '.eo');
    const xmirDir = path.join(target, '1-parse');
    const phiDir = opts.debug ? path.join(target, 'phi') : null;
    const phiNormDir = opts.debug ? path.join(target, 'phi-normalized') : null;
    const xmirNormDir = path.join(target, 'xmir-normalized');
    const xmirFiles = findFiles(xmirDir, '.xmir');
    console.debug('Found %d XMIR file(s) to normalize', xmirFiles.length);
    for (const xmirFile of xmirFiles) {
      const relPath = path.relative(xmirDir, xmirFile);
      const base = relPath.replace(/\.xmir$/, '');
      console.debug('Normalizing %s', relPath);
      let ts = Date.now();
      const phi = execSync(
        `phino rewrite --input=xmir --output=phi "${xmirFile}"`,
        {stdio: ['pipe', 'pipe', 'pipe']}
      );
      console.debug('XMIR -> phi done in %dms', Date.now() - ts);
      ts = Date.now();
      const phiNorm = execSync(
        'phino rewrite --normalize',
        {input: phi, stdio: ['pipe', 'pipe', 'pipe']}
      );
      console.debug('phi normalized in %dms', Date.now() - ts);
      ts = Date.now();
      const xmirNorm = execSync(
        'phino rewrite --input=phi --output=xmir',
        {input: phiNorm, stdio: ['pipe', 'pipe', 'pipe']}
      );
      console.debug('phi -> XMIR done in %dms', Date.now() - ts);
      if (opts.debug) {
        saveFile(phiDir, `${base}.phi`, phi);
        saveFile(phiNormDir, `${base}.phi`, phiNorm);
      }
      saveFile(xmirNormDir, `${base}.xmir`, xmirNorm);
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
