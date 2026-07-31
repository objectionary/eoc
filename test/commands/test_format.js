/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {spawnSync} = require('child_process');
const {runSync, parserVersion, homeTag, weAreOnline} = require('../helpers');

const messy = '[] > app';
const tidy = ['[] > app', ''].join('\n');

/**
 * Put a single .EO file into a fresh sandbox.
 * @param {String} name - Unique sub-directory for this case
 * @param {String} content - Content of the .EO file
 * @return {String} Home directory of the sandbox
 */
function sandbox(name, content) {
  const home = path.resolve('temp/test-format', name);
  fs.rmSync(home, {recursive: true, force: true});
  fs.mkdirSync(path.resolve(home, 'src'), {recursive: true});
  fs.writeFileSync(path.resolve(home, 'src/app.eo'), content);
  return home;
}

/**
 * Arguments that point eoc at the sandbox.
 * @param {String} home - Home directory of the sandbox
 * @param {String} sources - Directory with .EO sources
 * @return {Array} Command line arguments
 */
function args(home, sources) {
  return [
    `--parser=${parserVersion}`,
    `--home-tag=${homeTag}`,
    '-s', sources,
    '-t', path.resolve(home, 'target')
  ];
}

/**
 * Run eoc quietly and report the code it exited with.
 * @param {Array} argv - Command line arguments
 * @return {Number} Exit code
 */
function attempt(argv) {
  return spawnSync(
    'node',
    [path.resolve('./src/eoc.js'), '--batch'].concat(argv),
    {timeout: 1200000, windowsHide: true}
  ).status;
}

const cases = [
  {
    name: 'adds the missing final newline to a bare object',
    before: messy,
    after: tidy
  },
  {
    name: 'drops the redundant target of a self-named alias',
    before: ['+alias math math', '', 'math.plus > app', '  5', '  10', ''].join('\n'),
    after: ['+alias math', '', 'math.plus > app', '  5', '  10', ''].join('\n')
  },
  {
    name: 'expands a single alias and qualifies its usage',
    before: ['+alias out stdout', '', 'out > app', '  "Hello, world!"', ''].join('\n'),
    after: ['+alias out Q.stdout', '', 'stdout > app', '  "Hello, world!"', ''].join('\n')
  },
  {
    name: 'expands multiple aliases with nested arguments',
    before: [
      '+alias out stdout', '+alias printf string.printf', '',
      'out > app', '  printf', '    "Hello, %s"', '    "Jeff"', ''
    ].join('\n'),
    after: [
      '+alias out Q.stdout', '+alias string.printf', '',
      'stdout > app', '  string.printf', '    "Hello, %s"', '    "Jeff"', ''
    ].join('\n')
  }
];

describe('format', () => {
  before(weAreOnline);
  it('fails when a source file is not formatted', function(done) {
    this.timeout(0);
    const home = sandbox('messy', messy);
    assert.strictEqual(
      attempt(['format'].concat(args(home, path.resolve(home, 'src')))), 1,
      'format doesnt fail on a source file that needs reformatting'
    );
    done();
  });
  it('leaves a badly formatted source file untouched', function(done) {
    this.timeout(0);
    const home = sandbox('intact', messy);
    attempt(['format'].concat(args(home, path.resolve(home, 'src'))));
    assert.strictEqual(
      fs.readFileSync(path.resolve(home, 'src/app.eo'), 'utf8'), messy,
      'format rewrites the source file even without --fix'
    );
    done();
  });
  it('succeeds when every source file is already formatted', function(done) {
    this.timeout(0);
    const home = sandbox('tidy', tidy);
    assert.strictEqual(
      attempt(['format'].concat(args(home, path.resolve(home, 'src')))), 0,
      'format doesnt accept a source file that is already formatted'
    );
    done();
  });
  cases.forEach((one, index) => {
    it(one.name, function(done) {
      this.timeout(0);
      const home = sandbox(`fix-${index}`, one.before);
      runSync(['format', '--fix'].concat(args(home, path.resolve(home, 'src'))));
      assert.strictEqual(
        fs.readFileSync(path.resolve(home, 'src/app.eo'), 'utf8'), one.after,
        `format --fix doesnt reformat the source file so that it ${one.name}`
      );
      done();
    });
  });
  it('formats relative sources in place', function(done) {
    this.timeout(0);
    const home = sandbox('relative', messy);
    runSync(
      ['format', '--fix'].concat(
        args(home, path.relative(process.cwd(), path.resolve(home, 'src')))
      )
    );
    assert.strictEqual(
      fs.readFileSync(path.resolve(home, 'src/app.eo'), 'utf8'), tidy,
      'format --fix doesnt overwrite a relative --sources in place'
    );
    done();
  });
  it('keeps an already formatted file unchanged on a second run', function(done) {
    this.timeout(0);
    const home = sandbox('idempotent', messy);
    runSync(['format', '--fix'].concat(args(home, path.resolve(home, 'src'))));
    runSync(['format', '--fix'].concat(args(home, path.resolve(home, 'src'))));
    assert.strictEqual(
      fs.readFileSync(path.resolve(home, 'src/app.eo'), 'utf8'), tidy,
      'format --fix isnt idempotent on an already formatted file'
    );
    done();
  });
});
