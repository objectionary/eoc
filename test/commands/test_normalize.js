/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');
const {runSync, parserVersion, homeTag, weAreOnline} = require('../helpers');

const eo = '# sample\n[] > simple\n';

function setup(name, content = eo) {
  const home = path.resolve('temp/test-normalize', name);
  const source = path.resolve(home, 'src');
  const target = path.resolve(home, 'target');
  fs.rmSync(home, {recursive: true, force: true});
  fs.mkdirSync(source, {recursive: true});
  fs.mkdirSync(target, {recursive: true});
  fs.writeFileSync(path.resolve(source, 'simple.eo'), content);
  runSync([
    'normalize',
    '--verbose',
    `--parser=${parserVersion}`,
    `--home-tag=${homeTag}`,
    '-s', source,
    '-t', target,
  ]);
  return {home, source, target};
}

describe('normalize', () => {
  before(weAreOnline);
  before(() => {
    try {
      execSync('phino --version', {stdio: 'pipe'});
    } catch (e) {
      throw new Error(
        'phino is required to run normalize tests, see https://github.com/objectionary/phino',
        {cause: e}
      );
    }
  });
  it('normalizes EO files and saves originals in before-normalize/', done => {
    const {source, target} = setup('simple');
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
  it('normalized output matches expected content', done => {
    const {source} = setup('content');
    const actual = fs.readFileSync(path.resolve(source, 'simple.eo'), 'utf8');
    const expected = '# No comments.\n[] > simple\n';
    assert.strictEqual(
      actual, expected,
      `Normalized output must equal expected.\nExpected:\n${expected}\nActual:\n${actual}`
    );
    done();
  });
  it('backup matches original input and all pipeline files are produced', done => {
    const {source, target} = setup('pipeline');
    const backup = fs.readFileSync(
      path.resolve(target, 'before-normalize/simple.eo'), 'utf8'
    );
    assert.strictEqual(
      backup, eo,
      'Backup in before-normalize/ must exactly match the original input'
    );
    const xmirNorm = path.resolve(target, 'xmir-normalized/simple.xmir');
    assert(fs.existsSync(xmirNorm), 'Normalized XMIR file must exist');
    assert(fs.readFileSync(xmirNorm).length > 0, 'Normalized XMIR file must not be empty');
    const normalized = fs.readFileSync(path.resolve(source, 'simple.eo'), 'utf8');
    assert(normalized.length > 0, 'Normalized .eo file must not be empty');
    done();
  });
});
