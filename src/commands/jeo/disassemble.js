/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const rel = require('relative');
const {mvnw, flags} = require('../../mvnw');
const {elapsed} = require('../../elapsed');
const path = require('path');
const {existing} = require('../../files');

/**
 * Disassemble .class files to .xmir files.
 * @param {Object} opts - All options
 * @return {Promise} of disassemble task
 */
module.exports = function(opts) {
  return elapsed(async (tracked) => {
    const sources = existing(path.resolve(opts.target, opts.classes));
    const r = await mvnw(
      ['jeo:disassemble']
        .concat(flags(opts))
        .concat(
          [
            `-Djeo.version=${opts.jeoVersion}`,
            `-Djeo.disassemble.sourcesDir=${sources}`,
            `-Djeo.disassemble.outputDir=${path.resolve(opts.target, opts.xmirs)}`,
          ]
        ),
      opts.target, opts.batch
    );
    tracked.print(`Bytecode .class files from ${rel(sources)} disassembled to .xmir files in ${rel(path.resolve(opts.target, opts.xmirs))}`);
    return r;
  });
};
