/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const rel = require('relative');
const {mvnw, flags} = require('../../mvnw');
const {elapsed} = require('../../elapsed');
const path = require('path');

/**
 * Disassemble .class files to .xmir files.
 * @param {Object} opts - All options
 * @return {Promise} of disassemble task
 */
module.exports = function(opts) {
  return elapsed(async (tracked) => {
    const r = await mvnw(
      ['jeo:disassemble']
        .concat(flags(opts))
        .concat(
          [
            `-Djeo.version=${opts.jeoVersion}`,
            `-Djeo.disassemble.sourcesDir=${path.resolve(opts.target, opts.classes)}`,
            `-Djeo.disassemble.outputDir=${path.resolve(opts.target, opts.xmirs)}`,
          ]
        ),
      opts.target, opts.batch
    );
    tracked.print(
      `Bytecode .class files from ${rel(opts.classes)} disassembled to .xmir files in ${rel(opts.xmirs)}`
    );
    return r;
  });
};
