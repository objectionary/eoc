/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');
const {runSync, parserVersion, homeTag, weAreOnline} = require('../helpers');

/**
 * Check whether phino is installed on this machine.
 * @return {boolean} - true if phino is available
 */
function phinoInstalled() {
  try {
    execSync('phino --version', {stdio: 'pipe'});
    return true;
  } catch (e) {
    return false;
  }
}

describe('normalize', () => {
  before(weAreOnline);
  it('normalizes EO files and saves originals in before-normalize/', function(done) {
    if (!phinoInstalled()) {
      this.skip();
    }
    const home = path.resolve('temp/test-normalize/simple');
    const source = path.resolve(home, 'src');
    const target = path.resolve(home, 'target');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(source, {recursive: true});
    fs.mkdirSync(target, {recursive: true});
    const content = '# sample\n[] > simple\n';
    fs.writeFileSync(path.resolve(source, 'simple.eo'), content);
    runSync([
      'normalize',
      '--verbose',
      `--parser=${parserVersion}`,
      `--home-tag=${homeTag}`,
      '-s', source,
      '-t', target,
    ]);
    assert(
      fs.existsSync(path.resolve(target, 'before-normalize/simple.eo')),
      'Original .eo file should be saved in before-normalize/'
    );
    assert(
      fs.existsSync(path.resolve(source, 'simple.eo')),
      'Normalized .eo file should exist in sources directory'
    );
    done();
  });
  it('normalized output matches expected content', function(done) {
    if (!phinoInstalled()) {
      this.skip();
    }
    const home = path.resolve('temp/test-normalize/content');
    const source = path.resolve(home, 'src');
    const target = path.resolve(home, 'target');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(source, {recursive: true});
    fs.mkdirSync(target, {recursive: true});
    fs.writeFileSync(path.resolve(source, 'simple.eo'), '# sample\n[] > simple\n');
    runSync([
      'normalize',
      '--verbose',
      `--parser=${parserVersion}`,
      `--home-tag=${homeTag}`,
      '-s', source,
      '-t', target,
    ]);
    const actual = fs.readFileSync(path.resolve(source, 'simple.eo'), 'utf8');
    const expected = '# No comments.\n[] > simple\n';
    assert.strictEqual(
      actual, expected,
      `Normalized output must equal expected.\nExpected:\n${expected}\nActual:\n${actual}`
    );
    done();
  });
  it('backup matches original input and all pipeline files are produced', function(done) {
    if (!phinoInstalled()) {
      this.skip();
    }
    const home = path.resolve('temp/test-normalize/pipeline');
    const source = path.resolve(home, 'src');
    const target = path.resolve(home, 'target');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(source, {recursive: true});
    fs.mkdirSync(target, {recursive: true});
    const original = '# sample\n[] > simple\n';
    fs.writeFileSync(path.resolve(source, 'simple.eo'), original);
    runSync([
      'normalize',
      '--verbose',
      '--debug',
      `--parser=${parserVersion}`,
      `--home-tag=${homeTag}`,
      '-s', source,
      '-t', target,
    ]);
    const backup = fs.readFileSync(
      path.resolve(target, 'before-normalize/simple.eo'), 'utf8'
    );
    assert.strictEqual(
      backup, original,
      'Backup in before-normalize/ must exactly match the original input'
    );
    const intermediates = [
      'phi/simple.phi',
      'phi-normalized/simple.phi',
      'xmir-normalized/simple.xmir',
    ];
    for (const p of intermediates) {
      const abs = path.resolve(target, p);
      assert(fs.existsSync(abs), `Intermediate file must exist: ${p}`);
      assert(
        fs.readFileSync(abs).length > 0,
        `Intermediate file must not be empty: ${p}`
      );
    }
    const normalized = fs.readFileSync(path.resolve(source, 'simple.eo'), 'utf8');
    assert(normalized.length > 0, 'Normalized .eo file must not be empty');
    done();
  });
  it('fails when phino is not installed', function(done) {
    if (phinoInstalled()) {
      this.skip();
    }
    const home = path.resolve('temp/test-normalize/no-phino');
    const source = path.resolve(home, 'src');
    const target = path.resolve(home, 'target');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(source, {recursive: true});
    fs.mkdirSync(target, {recursive: true});
    fs.writeFileSync(path.resolve(source, 'simple.eo'), '# sample\n[] > simple\n');
    assert.throws(
      () => runSync([
        'normalize',
        '--verbose',
        `--parser=${parserVersion}`,
        `--home-tag=${homeTag}`,
        '-s', source,
        '-t', target,
      ]),
      'normalize should fail when phino is not installed'
    );
    done();
  });
});
