/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {runSync, assertFilesExist, parserVersion, homeTag, weAreOnline} = require('../helpers');

describe('compile', () => {
  before(weAreOnline);
  it('compiles a simple .EO program into Java bytecode .class files', (done) => {
    const home = path.resolve('temp/test-compile/simple');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(home, 'src', 'foo', 'bar'), {recursive: true});
    fs.writeFileSync(path.resolve(home, 'src/foo/bar/compile.eo'), simple('compile'));
    const stdout = runSync([
      'compile',
      `--parser=${parserVersion}`,
      `--home-tag=${homeTag}`,
      '--easy',
      '--blind',
      '-s', path.resolve(home, 'src'),
      '-t', path.resolve(home, 'target'),
    ]);
    assertFilesExist(
      stdout, home,
      [
        'target/generated-sources/EOfoo/EObar/EOcompile.java',
        'target/generated-sources/EOorg/EOeolang/EObytes.java',
        'target/classes/EOfoo/EObar/EOcompile.class',
        'target/classes/EOorg/EOeolang/EOnumber.class',
      ]
    );
    assert(!fs.existsSync(path.resolve('../../mvnw/target')));
    done();
  });
  it('compiles a simple .EO unit test into Java bytecode .class files', (done) => {
    const home = path.resolve('temp/test-compile/junit');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(home, 'src', 'foo', 'bar'), {recursive: true});
    fs.writeFileSync(
      path.resolve(home, 'src/foo/bar/simple-test-compile.eo'),
      [
        '+package foo.bar',
        '+tests',
        '',
        '# This is a sample object',
        '[] > simple-test-compile',
        '  true > tests',
      ].join('\n')
    );
    const stdout = runSync([
      'compile',
      '--verbose',
      '--easy',
      '--blind',
      `--parser=${parserVersion}`,
      `--home-tag=${homeTag}`,
      '-s', path.resolve(home, 'src'),
      '-t', path.resolve(home, 'target'),
    ]);
    assertFilesExist(
      stdout, home,
      [
        'target/generated-sources/EOfoo/EObar/EOsimple_test_compileTest.java',
        'target/classes/EOfoo/EObar/EOsimple_test_compileTest.class',
      ]
    );
    done();
  });
  it('Cleans and compiles a simple .EO program', (done) => {
    const home = path.resolve('temp/test-compile/simple');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(home, 'target'), {recursive: true});
    fs.mkdirSync(path.resolve(home, 'src', 'foo', 'bar'), {recursive: true});
    fs.writeFileSync(path.resolve(home, 'src/foo/bar/compile2.eo'), simple('compile2'));
    runSync([
      'compile',
      '--clean',
      '--easy',
      '--blind',
      `--parser=${parserVersion}`,
      `--home-tag=${homeTag}`,
      '-s', path.resolve(home, 'src'),
      '-t', path.resolve(home, 'target'),
    ]);
    done();
  });
  it('Skips compilation for JavaScript', () => {
    const stdout = runSync([
      'compile',
      '--alone',
      '--language=JavaScript'
    ]);
    assert.ok(stdout.includes('skipped for JavaScript'));
  });
  it('Skips linting if --blind specified', () => {
    const home = path.resolve('temp/test-compile/simple');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(home, 'src', 'foo', 'bar'), {recursive: true});
    fs.writeFileSync(path.resolve(home, 'src/foo/bar/compile3.eo'), simple('compile3'));
    const stdout = runSync([
      'compile',
      '--verbose',
      '--blind',
      `--parser=${parserVersion}`,
      `--home-tag=${homeTag}`,
      '-s', path.resolve(home, 'src'),
      '-t', path.resolve(home, 'target'),
    ]);
    assert.ok(
      stdout.includes('Linting is skipped because eo:skipLinting is TRUE'),
      'Linting should be skipped with --blind option'
    );
  });
});

/**
 * Creates simple correct eo program.
 * @param {string} name - Name of object
 * @return {string} simple eo program
 */
function simple(name) {
  return [
    '+package foo.bar',
    '+alias org.eolang.io.stdout',
    '',
    '# This is a simple object',
    `[args] > ${name}`,
    '  stdout "Hello, world!" > @',
  ].join('\n');
}
