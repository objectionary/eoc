/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const rel = require('relative');
const path = require('path');
const {mvnw, flags} = require('../mvnw');

/**
 * Command to convert .XMIR files into .EO files.
 * @param {Object} opts - All options
 * @return {Promise} of assemble task
 */
module.exports = async function(opts) {
  const input = path.resolve(opts.target, opts.printInput);
  console.debug('Reading from %s', rel(input));
  const output = path.resolve(opts.target, opts.printOutput);
  console.debug('Writing to %s', rel(output));
  const r = await mvnw(
    ['eo:print']
      .concat(flags(opts))
      .concat(
        [
          `-Deo.printSourcesDir=${input}`,
          `-Deo.printOutputDir=${output}`,
        ]
      ),
    opts.target, opts.batch
  );
  console.info('XMIR files converted to EO files at %s', rel(output));
  return r;
};
