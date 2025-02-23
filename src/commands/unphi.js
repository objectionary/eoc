/*
 * The MIT License (MIT)
 *
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const rel = require('relative');
const path = require('path');
const {mvnw, flags} = require('../mvnw');
const {gte} = require('../demand');

/**
 * Command to convert .PHI files into .XMIR files.
 * @param {Object} opts - All options
 * @return {Promise} of assemble task
 */
module.exports = function(opts) {
  gte('EO parser', opts.parser, '0.35.2');
  const input = path.resolve(opts.target, opts.unphiInput);
  console.debug('Reading .PHI files from %s', rel(input));
  const output = path.resolve(opts.target, opts.unphiOutput);
  console.debug('Writing .XMIR files to %s', rel(output));
  return mvnw(
    ['eo:phi-to-xmir']
      .concat(flags(opts))
      .concat(
        [
          `-Deo.unphiInputDir=${input}`,
          `-Deo.unphiOutputDir=${output}`,
          opts.tests ? '-Deo.unphiMetas=+tests' : ''
        ]
      ),
    opts.target, opts.batch
  ).then((r) => {
    console.info('PHI files converted into XMIR files at %s', rel(output));
    return r;
  });
};
