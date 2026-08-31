/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs');
const path = require('path');

module.exports.parserVersion = fs.readFileSync(
  path.join(__dirname, '../eo-version.txt'),
  'utf8'
).trim();
module.exports.homeTag = fs.readFileSync(
  path.join(__dirname, '../home-tag.txt'),
  'utf8'
).trim();
module.exports.jeoVersion = fs.readFileSync(
  path.join(__dirname, '../jeo-version.txt'),
  'utf8'
).trim();

/**
 * Helper to run EOC command line tool.
 *
 * @param {Array} args - Array of args
 * @return {String} Stdout
 */
module.exports.runSync = function runSync(args) {
  const path = require('path'),
    {execFileSync} = require('child_process');
  try {
    return execFileSync(
      'node',
      [path.resolve('./src/eoc.js'), '--batch'].concat(args),
      {
        'timeout': 1200000,
        'windowsHide': true,
      }
    ).toString();
  } catch (ex) {
    console.log(ex.stdout.toString());
    throw ex;
  }
};

/**
 * Helper to run EOC command line tool and capture everything it produces.
 *
 * @param {Array} args - Array of args
 * @param {Object} options - Extra options for the child process
 * @return {Object} Stdout, stderr and exit status
 */
module.exports.runOutput = function runOutput(args, options = {}) {
  const {spawnSync} = require('child_process');
  const outcome = spawnSync(
    'node',
    [path.resolve('./src/eoc.js'), '--batch'].concat(args),
    {
      'timeout': 1200000,
      'windowsHide': true,
      ...options,
    }
  );
  return {
    'stdout': outcome.stdout.toString(),
    'stderr': outcome.stderr.toString(),
    'status': outcome.status,
  };
};

/**
 * Assert that all files exist.
 *
 * @param {String} stdout - The stdout printed
 * @param {String} home - The location of files to match
 * @param {Array} paths - Array of file paths
 */
module.exports.assertFilesExist = function assertFilesExist(stdout, home, paths) {
  const path = require('path');
  const assert = require('assert');
  const fs = require('fs');
  paths.forEach((p) => {
    const abs = path.resolve(home, p);
    assert(
      fs.existsSync(abs),
      `${stdout}\nFile ${abs} is absent`
    );
  });
};

/**
 * Skips the test if we are not online.
 *
 * @param {function} done - Should be passed by Mocha test
 */
module.exports.weAreOnline = function weAreOnline(done) {
  const dns = require('dns');
  dns.lookup('google.com', (err) => {
    if (err && err.code === 'ENOTFOUND') {
      console.log('No internet connection, skipping tests');
      this.skip();
    }
    done();
  });
};
