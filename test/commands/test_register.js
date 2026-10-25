/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {runSync, assertFilesExist, weAreOnline} = require('../helpers');

describe('register', () => {
  before(weAreOnline);
  it('registers a simple .EO program', (done) => {
    const home = path.resolve('temp/test-register/simple');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(home, 'src'), {recursive: true});
    fs.writeFileSync(path.resolve(home, 'src/simple.eo'), '# sample\n[] > simple\n');
    const stdout = runSync([
      'register',
      '--verbose',
      '-s', path.resolve(home, 'src'),
      '-t', path.resolve(home, 'target'),
    ]);
    assertFilesExist(
      stdout, home,
      [
        'target/eo-foreign.json',
      ]
    );
    assert(!fs.existsSync(path.resolve('../../mvnw/target')));
    done();
  });
  it('does not register .EO files found inside the .eoc target directory', (done) => {
    const home = path.resolve('temp/test-register/inside-eoc');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(home, '.eoc', 'print'), {recursive: true});
    fs.mkdirSync(path.resolve(home, '.eoc-x'), {recursive: true});
    fs.writeFileSync(path.resolve(home, 'app.eo'), '# sample\n[] > app\n');
    fs.writeFileSync(path.resolve(home, '.eoc-x/other.eo'), '# sample\n[] > other\n');
    fs.writeFileSync(path.resolve(home, '.eoc', 'print/app.eo'), '# sample\n[] > app\n');
    const stdout = runSync([
      'register',
      '--verbose',
      '-s', home,
      '-t', path.resolve(home, '.eoc'),
    ]);
    const ids = JSON.parse(
      fs.readFileSync(path.resolve(home, '.eoc', 'eo-foreign.json'), 'utf8')
    ).map((obj) => obj.id).sort();
    assert.deepStrictEqual(ids, ['.eoc-x.other', 'app'], stdout);
    done();
  });
  it('still skips nested .eoc directories and registers other sources', (done) => {
    const home = path.resolve('temp/test-register/nested-eoc');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(home, 'src/sub/.eoc'), {recursive: true});
    fs.writeFileSync(path.resolve(home, 'src/sub/a.eo'), '# sample\n[] > a\n');
    fs.writeFileSync(path.resolve(home, 'src/sub/.eoc/b.eo'), '# sample\n[] > b\n');
    const stdout = runSync([
      'register',
      '--verbose',
      '-s', path.resolve(home, 'src'),
      '-t', path.resolve(home, 'target'),
    ]);
    const ids = JSON.parse(
      fs.readFileSync(path.resolve(home, 'target', 'eo-foreign.json'), 'utf8')
    ).map((obj) => obj.id);
    assert.deepStrictEqual(ids, ['sub.a'], stdout);
    done();
  });
});
