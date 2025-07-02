/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const rel = require('relative');
const {mvnw, flags} = require('../../mvnw');
const path = require('path');

/**
 * Assemble .xmir files from .class files.
 * @param {Object} opts - All options
 * @return {Promise} of assemble task
 */
module.exports = function(opts) {
  return mvnw(
    ['jeo:assemble']
      .concat(flags(opts))
      .concat(
        [
          `-Djeo.version=${opts.jeoVersion}`,
          `-Djeo.assemble.sourcesDir=${path.resolve(opts.target, opts.xmirs)}`,
          `-Djeo.assemble.outputDir=${path.resolve(opts.target, opts.classes)}`,
        ]
      ),
    opts.target, opts.batch
  ).then((r) => {
    console.info(
      'EO .xmir files from %s assembled to .class to %s',
      rel(opts.xmirs), rel(opts.classes)
    );
    return r;
  });
};
