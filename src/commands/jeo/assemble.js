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
 * Assemble .xmir files from .class files.
 * @param {Object} opts - All options
 * @return {Promise} of assemble task
 */
module.exports = function(opts) {
  return elapsed(async (tracked) => {
    const sources = existing(path.resolve(opts.target, opts.xmirs));
    const r = await mvnw(
      ['jeo:assemble']
        .concat(flags(opts))
        .concat(
          [
            `-Djeo.version=${opts.jeoVersion}`,
            `-Djeo.assemble.sourcesDir=${sources}`,
            `-Djeo.assemble.outputDir=${path.resolve(opts.target, opts.classes)}`,
          ]
        ),
      opts.target, opts.batch
    );
    tracked.print(`EO .xmir files from ${rel(sources)} assembled to .class files in ${rel(path.resolve(opts.target, opts.classes))}`);
    return r;
  });
};
