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
 * @param {string} name - Unique sub-directory name for this case
 * @return {Array} Array containing source and target directory paths
 */
function prepareTestDirectory (name) {
  const home = path.resolve('temp/test-fmt', name)
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
    name: 'removes redundant comments from a bare object',
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
    name: 'expands a single alias to fully qualified form',
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
    name: 'expands stdout alias and qualifies its usage',
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
    name: 'expands multiple aliases with nested arguments',
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
      '  tt.sprintf',
      '    "Hello, %s"',
      '    "Jeff"',
      ''
    ].join('\n')
  }
]

describe('fmt', () => {
  before(weAreOnline)
  testCases.forEach((testCase, index) => {
    it(testCase.name, done => {
      const [source, target] = prepareTestDirectory(`case-${index}`)
      const file = createFile(source, testCase.before)
      fmt(source, target)
      assert.strictEqual(
        fs.readFileSync(file, 'utf8'),
        testCase.after,
        `${testCase.name}: formatting result doesn't match expected output`
      )
      done()
    })
  })
  it('formats relative sources in place without writing under target', done => {
    const [source, target] = prepareTestDirectory('relative')
    const file = createFile(source, testCases[0].before)
    const relativeSource = path.relative(process.cwd(), source)
    fmt(relativeSource, target)
    assert.strictEqual(
      fs.readFileSync(file, 'utf8'),
      testCases[0].after,
      'Relative --sources must be overwritten in place'
    )
    assert(
      !fs.existsSync(path.resolve(target, relativeSource, 'app.eo')),
      'Relative --sources must not create formatted files under --target'
    )
    done()
  })
  it('keeps an already formatted file unchanged on a second run', done => {
    const [source, target] = prepareTestDirectory('idempotent')
    const file = createFile(source, testCases[0].before)
    fmt(source, target)
    fmt(source, target)
    assert.strictEqual(
      fs.readFileSync(file, 'utf8'),
      testCases[0].after,
      'Formatting an already formatted file must be idempotent'
    )
    done()
  })
})
