/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {copyDir, findFiles} = require('../src/files');

describe('files', () => {
  it('excludes a nested target from recursive copying', done => {
    const home = path.resolve('temp/test-files/nested-target'),
      target = path.resolve(home, '.eoc'),
      backup = path.resolve(target, 'before-normalize');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(home, {recursive: true});
    fs.writeFileSync(
      path.resolve(home, 'simple.eo'),
      '# sample\n[] > simple\n'
    );
    try {
      copyDir(home, backup, '.eo', target);
      assert(
        fs.existsSync(path.resolve(backup, 'simple.eo')),
        'EO source file must be copied into before-normalize'
      );
      assert(
        !fs.existsSync(path.resolve(backup, path.basename(target))),
        'the excluded target must not be copied into itself'
      );
    } finally {
      fs.rmSync(home, {recursive: true, force: true});
    }
    done();
  });
  it('traverses symlinked directories without following cycles', done => {
    if (process.platform === 'win32') {
      done();
      return;
    }
    const home = path.resolve('temp/test-files/symlinked-directory');
    const destination = path.resolve('temp/test-files/symlinked-copy');
    const real = path.join(home, 'real');
    fs.rmSync(path.resolve('temp/test-files'), {recursive: true, force: true});
    fs.mkdirSync(real, {recursive: true});
    fs.writeFileSync(path.join(real, 'main.eo'), '# sample\n[] > main\n');
    fs.symlinkSync(real, path.join(home, 'linked'), 'dir');
    fs.symlinkSync(home, path.join(real, 'loop'), 'dir');
    try {
      const files = findFiles(home, '.eo').map(file => path.relative(home, file));
      assert.deepStrictEqual(
        files.sort(),
        ['linked/main.eo', 'real/main.eo'],
        'symlinked sources should be found once without recursing forever'
      );
      copyDir(home, destination, '.eo');
      assert(
        fs.existsSync(path.join(destination, 'linked', 'main.eo')),
        'files below a symlinked source directory must be copied'
      );
    } finally {
      fs.rmSync(path.resolve('temp/test-files'), {recursive: true, force: true});
    }
    done();
  });
});
