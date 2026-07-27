/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {copyDir} = require('../src/files');

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
});
