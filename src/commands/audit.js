/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs');
const path = require('path');
const {mvnw} = require('../mvnw');
const version = require('../version');

/**
 * The packages the build depends on, with the versions resolved for this run.
 * @param {Hash} opts - All options
 * @return {Array.<Array.<String>>} of name and version pairs
 */
function packages(opts) {
  return [
    ['eoc', version.what],
    ['eo-maven-plugin', opts.parser],
    ['objectionary/home', opts.homeTag],
    [
      'jeo-maven-plugin',
      opts.jeoVersion ||
        fs.readFileSync(path.resolve(__dirname, '../../jeo-version.txt'), 'utf8').trim()
    ]
  ];
}

/**
 * Command to audit all packages.
 * @param {Hash} opts - All options
 * @return {Promise} of audit task
 */
module.exports = function(opts) {
  packages(opts).forEach(([name, ver]) => {
    console.info(`${name}: ${ver === undefined ? 'not resolved' : ver}`);
  });
  return mvnw(['--version'], null, opts.batch);
};

module.exports.packages = packages;
