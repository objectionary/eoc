/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { runSync, parserVersion, homeTag, weAreOnline } = require('../helpers');

/**
 * Prepare test directory and return the home path
 * @return {string} Home directory path
 */
function prepareTestDirectory() {
  const home = path.resolve('temp/test-fmt/simple');
  fs.rmSync(home, { recursive: true, force: true });
  fs.mkdirSync(home, { recursive: true });
  return home;
}

/**
 * Create a poorly formatted EO file
 * @param {string} home - Home directory path
 * @return {Object} Source path and original content
 */
function createPoorlyFormattedFile(home) {
  const source = path.resolve(home, 'app.eo');
  const originalContent = [
    '+package f ',
    '+alias stdout org.eolang.io.stdout',
    '',
    '[args] >   app',
    '  stdout > @',
    '    "Hello, world!"'
  ].join('\n');

  fs.writeFileSync(source, originalContent);
  return { source, originalContent };
}

/**
 * Run the formatter on the source directory
 * @param {string} home - Home directory path
 */
function fmt(home) {
  runSync([
    'fmt',
    '--verbose',
    `--parser=${parserVersion}`,
    `--home-tag=${homeTag}`,
    '-s',
    home,
    '-t',
    path.resolve(home, '.eoc'),
  ]);
}

/**
 * Verify the formatting results
 * @param {string} source - Source file path
 * @param {string} originalContent - Original file content
 */
function verifyFormatting(source, originalContent) {
  const formatted = fs.readFileSync(source, 'utf8');
  assert(
    formatted.includes('+package f'),
    'Package declaration should be preserved'
  );
  assert(
    formatted.includes('+alias stdout Q.org.eolang.io.stdout'),
    'Alias should be updated with Q prefix'
  );
  assert(formatted.includes('app'), 'Object declaration should be simplified');
  assert(formatted.includes('io.stdout > @'), 'Should format stdout properly');
  assert(
    formatted.includes('"Hello, world!"'),
    'String content should be preserved'
  );
  assert(
    formatted !== originalContent,
    'File should be different after formatting'
  );
}

describe('fmt', () => {
  before(weAreOnline);

  it('formats EO files in the source directory', done => {
    const home = prepareTestDirectory();
    const { source, originalContent } = createPoorlyFormattedFile(home);
    fmt(home);
    verifyFormatting(source, originalContent);
    done();
  });
});
