/*
 * The MIT License (MIT)
 *
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const rel = require('relative');
const path = require('path');
const {gte} = require('../demand');
const {mvnw, flags} = require('../mvnw');

/**
 * Command to convert .XMIR files into .PHI files.
 * @param {Object} opts - All options
 * @return {Promise} of assemble task
 */
module.exports = function(opts) {
  gte('EO parser', opts.parser, '0.35.2');
  const target = path.resolve(opts.target);
  const input = path.resolve(opts.target, opts.phiInput);
  console.debug('Reading .XMIR files from %s', rel(input));
  const output = path.resolve(opts.target, opts.phiOutput);
  console.debug('Writing .PHI files to %s', rel(output));
  return mvnw(
    ['eo:xmir-to-phi']
      .concat(flags(opts))
      .concat(
        [
          `-Deo.phiInputDir=${input}`,
          `-Deo.phiOutputDir=${output}`,
        ]
      ),
    opts.target, opts.batch
  ).then((r) => {
    console.info('XMIR files converted into PHI files at %s', rel(target));
    return r;
  });
};
