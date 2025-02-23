/*
 * The MIT License (MIT)
 *
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const rel = require('relative');
const path = require('path');
const {mvnw, flags} = require('../mvnw');

/**
 * Generate SODG files from XMIR.
 * @param {Hash} opts - All options
 * @return {Promise} of sodg task
 */
module.exports = function(opts) {
  const argv = ['eo:sodg'].concat(flags(opts));
  argv.push('-Deo.sodgIncludes=' + opts.include);
  if (opts.exclude) {
    argv.push('-Deo.sodgExcludes=' + opts.exclude);
  }
  if (opts.xml) {
    argv.push('-Deo.generateSodgXmlFiles');
  }
  if (opts.xembly) {
    argv.push('-Deo.generateSodgXmlFiles');
    argv.push('-Deo.generateXemblyFiles');
  }
  if (opts.graph) {
    argv.push('-Deo.generateSodgXmlFiles');
    argv.push('-Deo.generateXemblyFiles');
    argv.push('-Deo.generateGraphFiles');
  }
  if (opts.dot) {
    argv.push('-Deo.generateSodgXmlFiles');
    argv.push('-Deo.generateXemblyFiles');
    argv.push('-Deo.generateGraphFiles');
    argv.push('-Deo.generateDotFiles');
  }
  return mvnw(argv, opts.target, opts.batch).then((r) => {
    console.info('SODG files generated in %s', rel(path.resolve(opts.target)));
    return r;
  });
};
