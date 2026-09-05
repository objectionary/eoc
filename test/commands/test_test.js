/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {runSync, assertFilesExist, parserVersion, homeTag, weAreOnline} = require('../helpers');

describe('test', () => {
  before(weAreOnline);
  /**
   * Run test command.
   * @param {String} home - Home directory
   * @param {String} lang - Target language
   * @param {String} parser - Version of EO parser
   * @param {String} hash - Git SHA in objectionary/home
   * @return {String} - Stdout
   */
  const test = function(home, lang = 'Java', parser, hash, args = []) {
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(home, 'src'), {recursive: true});
    fs.writeFileSync(
      path.resolve(home, 'src/simple.eo'),
      [
        '+any',
        '',
        '[] > simple',
        '',
        '  [] +> works-correctly',
        '    gt. > @',
        '      10',
        '      5',
      ].join('\n')
    );
    return runSync([
      'test',
      '--verbose',
      '--easy',
      '--blind',
      `--parser=${parser}`,
      `--home-tag=${hash}`,
      '--stack=16M',
      '--heap=128M',
      '-s', path.resolve(home, 'src'),
      '-t', path.resolve(home, 'target'),
      `--language=${lang}`,
      ...args,
    ]);
  };
  it('executes a single Java unit test', (done) => {
    const home = path.resolve('temp/test-test/java'),
      stdout = test(home, 'Java', parserVersion, homeTag);
    assertFilesExist(
      stdout, home,
      [
        'target/generated-sources/org/eolang/EOsimple.java',
        'target/generated-test-sources/org/eolang/EOsimpleTest.java',
        'target/classes/org/eolang/EOsimple.class',
        'target/test-classes/org/eolang/EOsimpleTest.class'
      ]
    );
    done();
  });
  it('executes a single JavaScript unit test', function(done) {
    this.skip(); // it doesn't work with 0.42.0
    const home = path.resolve('temp/test-test/javascript'),
      stdout = test(home, 'JavaScript', '0.42.0', '0.42.0');
    assert.ok(stdout.includes('1 passing'));
    assertFilesExist(
      stdout, home, ['target/project/simple-test.test.js',]
    );
    done();
  });
  it('executes a unit test that allocates memory', function(done) {
    this.timeout(0);
    const home = path.resolve('temp/test-test/malloc');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(home, 'src'), {recursive: true});
    fs.writeFileSync(
      path.resolve(home, 'src/allocates.eo'),
      [
        '+any',
        '',
        '[] > allocates',
        '',
        '  [] +> keeps-a-number',
        '    eq. > @',
        '      malloc.of',
        '        8',
        '        [m]',
        '          seq > @',
        '            *',
        '              m.put 42',
        '              m.get',
        '      42',
      ].join('\n')
    );
    assert.ok(
      runSync([
        'test',
        '--verbose',
        '--easy',
        '--blind',
        `--parser=${parserVersion}`,
        `--home-tag=${homeTag}`,
        '--stack=16M',
        '--heap=128M',
        '-s', path.resolve(home, 'src'),
        '-t', path.resolve(home, 'target'),
      ]).includes('Tests run: 1, Failures: 0, Errors: 0, Skipped: 0'),
      'malloc cannot be dataized by the pinned EO version'
    );
    done();
  });
  it('runs only the specified test when --object is provided', (done) => {
    const home = path.resolve('temp/test-test/object-filter'),
      stdout = test(home, 'Java', parserVersion, homeTag, ['--object', 'simple.works-correctly']);
    assert.ok(
      stdout.includes('Tests run: 1, Failures: 0, Errors: 0, Skipped: 0'),
      `expected exactly 1 test to run, got: ${stdout}`
    );
    done();
  });
});

describe('test/java', () => {
  const javaTest = require('../../src/commands/java/test');
  /**
   * Run the command with Maven replaced by a spy.
   * @param {String} object - Value of the --object option
   * @return {Promise<Array.<String>>} The arguments Maven was called with
   */
  async function selector(object) {
    let seen;
    await javaTest(
      {object, stack: '64M', heap: '256M', target: 'temp/none', sources: 'temp/none'},
      (args) => {
        seen = args;
        return Promise.resolve(args);
      }
    );
    return seen.filter((arg) => arg.startsWith('-Dtest='));
  }
  it('folds a package path into the class name', async () => {
    assert.deepStrictEqual(
      await selector('string.regex.compile.some-method'),
      ['-Dtest=org.eolang.EOstringEOregexEOcompile*Test#some_method'],
      'the transpiler puts every generated test class directly in org.eolang'
    );
  });
  it('keeps working for a top-level object', async () => {
    assert.deepStrictEqual(
      await selector('number.plus'),
      ['-Dtest=org.eolang.EOnumber*Test#plus']
    );
  });
});
