/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const lock = require('../package-lock.json');
const pkg = require('../package.json');

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

describe('postinstall', () => {
  const root = path.resolve(__dirname, '..');
  it('does not run stale patch-package hook', () => {
    assert.strictEqual(hasOwn(pkg.scripts, 'postinstall'), false);
    assert.strictEqual(hasOwn(pkg.devDependencies, 'patch-package'), false);
    assert.strictEqual(
      fs.existsSync(path.join(root, 'scripts', 'postinstall.js')),
      false
    );
    assert.strictEqual(
      fs.existsSync(
        path.join(root, 'patches', 'grunt-mocha-cli+7.0.0.patch')
      ),
      false
    );
  });
  it('does not keep stale install metadata in package lock', () => {
    assert.strictEqual(lock.packages[''].hasInstallScript, undefined);
    assert.strictEqual(
      hasOwn(lock.packages[''].devDependencies, 'patch-package'),
      false
    );
    assert.deepStrictEqual(
      Object.keys(lock.packages).filter((name) => (
        name.includes('patch-package') || name.includes('grunt-mocha-cli')
      )),
      []
    );
  });
});
