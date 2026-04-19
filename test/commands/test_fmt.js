/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert')
const fs = require('fs')
const path = require('path')
const { runSync, parserVersion, homeTag, weAreOnline } = require('../helpers')

/**
 * Prepare test directory and return the home path
 * @return {Array} Array containing source and target directory paths
 */
function prepareTestDirectory () {
  const home = path.resolve('temp/test-fmt/simple')
  const source = path.resolve(home, 'src')
  const target = path.resolve(home, 'target')
  fs.rmSync(home, { recursive: true, force: true })
  fs.mkdirSync(source, { recursive: true })
  fs.mkdirSync(target, { recursive: true })
  return [source, target]
}

/**
 * Create a file with the given content
 * @param {string} source - Source directory path
 * @param {string} content - File content
 * @param {string} filename - File name
 * @return {string} Full path to the created file
 */
function createFile (source, content, filename = 'app.eo') {
  const file = path.resolve(source, filename)
  fs.writeFileSync(file, content)
  return file
}

/**
 * Run the formatter on the source directory
 * @param {string} source - Source directory path
 * @param {string} target - Target directory path
 */
function fmt (source, target) {
  runSync([
    'fmt',
    '--verbose',
    `--parser=${parserVersion}`,
    `--home-tag=${homeTag}`,
    '-s',
    source,
    '-t',
    target
  ])
}

/**
 * Test cases for formatting
 * Each case has 'before' (input) and 'after' (expected output) fields
 */
const testCases = [
  {
    before: [
      '# EO file header',
      '# Copyright notice for testing',
      '# This is a comment for the app',
      '[] > app',
      ''
    ].join('\n'),
    after: [
      '# No comments.',
      '[] > app',
      ''
    ].join('\n')
  },
  {
    before: [
      '+alias math math',
      '# Calculator app',
      'math.plus > app',
      '  5',
      '  10',
      ''
    ].join('\n'),
    after: [
      '+alias math Q.math',
      '',
      'math.plus > app',
      '  5',
      '  10',
      ''
    ].join('\n')
  },
  {
    before: [
      '+alias stdout io.stdout',
      '# Application entry point',
      'stdout > app',
      '  "Hello, world!"'
    ].join('\n'),
    after: [
      '+alias stdout Q.io.stdout',
      '',
      'io.stdout > app',
      '  "Hello, world!"',
      ''
    ].join('\n')
  },
  {
    before: [
      '+alias stdout io.stdout',
      '+alias sprintf tt.sprintf',
      '# Application entry point',
      'stdout > app',
      '  sprintf',
      '    "Hello, %s"',
      '    "Jeff"'
    ].join('\n'),
    after: [
      '+alias stdout Q.io.stdout',
      '+alias sprintf Q.tt.sprintf',
      '',
      'io.stdout > app',
      '  txt.sprintf',
      '    "Hello, %s"',
      '    "Jeff"',
      ''
    ].join('\n')
  }
]

describe('fmt', () => {
  before(weAreOnline)
  it('formats EO files according to expected patterns', done => {
    const [source, target] = prepareTestDirectory()
    testCases.forEach((testCase, index) => {
      const file = createFile(source, testCase.before)
      fmt(source, target)
      const formatted = fs.readFileSync(file, 'utf8')
      assert.strictEqual(
        formatted,
        testCase.after,
        `Test case ${index} failed: formatting result doesn't match expected output`
      )
      assert(
        formatted !== testCase.before,
        `Test case ${index} failed: file should be different after formatting`
      )
    })
    done()
  })
})
