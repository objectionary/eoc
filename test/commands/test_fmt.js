/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */
const assert = require('assert')
const fs = require('fs')
const path = require('path')
const { runSync, parserVersion, homeTag, weAreOnline } = require('../helpers')

/**
 * Prepare test directory and return the home path
 * @return {string} Home directory path
 */
function prepareTestDirectory () {
  const home = path.resolve('temp/test-fmt/simple')
  fs.rmSync(home, { recursive: true, force: true })
  fs.mkdirSync(home, { recursive: true })
  return home
}

/**
 * Create a file with the given content
 * @param {string} home - Home directory path
 * @param {string} content - File content
 * @param {string} filename - File name
 * @return {string} Full path to the created file
 */
function createFile (home, content, filename = 'app.eo') {
  const source = path.resolve(home, filename)
  fs.writeFileSync(source, content)
  return source
}

/**
 * Run the formatter on the source directory
 * @param {string} home - Home directory path
 */
function fmt (home) {
  runSync([
    'fmt',
    '--verbose',
    `--parser=${parserVersion}`,
    `--home-tag=${homeTag}`,
    '-s',
    home,
    '-t',
    path.resolve(home, '.eoc')
  ])
}

/**
 * Test cases for formatting
 * Each case has 'before' (input) and 'after' (expected output) fields
 */
const formatTestCases = [
  {
    before: [
      '+package f ',
      '+alias stdout org.eolang.io.stdout',
      '',
      '[args] >   app',
      '  stdout > @',
      '    "Hello, world!"'
    ].join('\n'),
    after: [
      '+package f',
      '+alias stdout Q.org.eolang.io.stdout',
      '',
      'app',
      '  Q.f.@',
      '',
      'io.stdout > @',
      '  "Hello, world!"',
      ''
    ].join('\n')
  },
  {
    before: [
      '+package test',
      '',
      '-badly-formatted',
      '-  Q.test.@',
      '-',
      '-42 > @'
    ].join('\n'),
    after: [
      '+package test',
      '',
      'badly-formatted',
      ''
    ].join('\n')
  },
  {
    before: [
      '+package p',
      '+alias math org.eolang.math',
      '',
      '[] >   calc',
      '  math.plus > @',
      '    5',
      '    10'
    ].join('\n'),
    after: [
      '+package p',
      '+alias math Q.org.eolang.math',
      '',
      'calc',
      '  Q.p.@',
      '',
      'math.plus > @',
      '  5',
      '  10',
      ''
    ].join('\n')
  },
  {
    before: [
      '+package f',
      '+alias stdout Q.org.eolang.io.stdout',
      '',
      'app',
      '  Q.f.@',
      '',
      'io.stdout > @',
      '  "Hello, world!"'
    ].join('\n'),
    after: [
      '+package f',
      '+alias stdout Q.org.eolang.io.stdout',
      '',
      'app',
      '  Q.f.@',
      '',
      'io.stdout > @',
      '  "Hello, world!"',
      ''
    ].join('\n')
  },
  {
    before: [
      '+package f',
      '+alias org.eolang.io.stdout',
      '+alias org.eolang.txt.sprintf',
      '',
      '# No comments.',
      '[] > app',
      '  stdout > @',
      '    sprintf *1',
      '      "Hello, %s"',
      '      "Jeff"'
    ].join('\n'),
    after: [
      '+package f',
      '+alias stdout Q.org.eolang.io.stdout',
      '+alias sprintf Q.org.eolang.txt.sprintf',
      '',
      '# No comments.',
      '[] > app',
      '  io.stdout > @',
      '    txt.sprintf',
      '      "Hello, %s"',
      '      *',
      '        "Jeff"',
      ''
    ].join('\n')
  }
]

describe('fmt', () => {
  before(weAreOnline)
  it('formats EO files according to expected patterns', done => {
    const home = prepareTestDirectory()
    formatTestCases.forEach((testCase, index) => {
      const filename = `test${index}.eo`
      const source = createFile(home, testCase.before, filename)
      fmt(home)
      const formatted = fs.readFileSync(source, 'utf8')
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
