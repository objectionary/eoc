/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const path = require('path');
const {execSync} = require('child_process');
const {mvnw, flags} = require('../mvnw');
const {elapsed} = require('../elapsed');
const {findFiles, saveFile, copyDir} = require('../files');
const relative = require('relative');

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
  try {
    execSync('phino --version', {stdio: 'pipe'});
  } catch (e) {
    throw new Error('phino is not installed, see https://github.com/objectionary/phino', {cause: e});
  }
  const sources = path.resolve(opts.sources);
  const target = path.resolve(opts.target);
  return elapsed(async (tracked) => {
    copyDir(sources, path.join(target, 'before-normalize'), '.eo');
    const parsed = path.join(target, '1-parse');
    const normed = path.join(target, 'xmir-normalized');
    const xmirs = findFiles(parsed, '.xmir');
    console.debug('Found %d XMIR file(s) to normalize', xmirs.length);
    for (const xmir of xmirs) {
      const rel = path.relative(parsed, xmir);
      console.debug('Normalizing %s', rel);
      const ts = Date.now();
      const out = execSync(
        `phino rewrite --input=xmir --output=xmir --normalize ${xmir}`,
        {stdio: ['pipe', 'pipe', 'pipe']}
      );
      console.debug('Normalized in %dms', Date.now() - ts);
      let xmlContent = out.toString('utf8');
      console.debug('phino output (first 300 chars): %s', xmlContent.slice(0, 300));
      const declEnd = xmlContent.startsWith('<?xml') ? xmlContent.indexOf('?>') + 2 : 0;
      if (declEnd > 0) {
        xmlContent = xmlContent.slice(0, declEnd) +
          xmlContent.slice(declEnd).replace(/<\?xml[^?]*\?>/g, '');
      }
      saveFile(normed, rel, xmlContent);
    }
    const r = await mvnw(
      ['eo:print']
        .concat(flags(opts))
        .concat([
          `-Deo.printSourcesDir=${normed}`,
          `-Deo.printOutputDir=${sources}`,
        ]),
      opts.target, opts.batch
    );
    tracked.print(`EO files normalized in ${relative(sources)}`);
    return r;
  });
};
