/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {runSync} = require('../helpers');

describe('docs', () => {
  const test = path.resolve('temp/test-docs-command');
  const eoc = path.join(test, '.eoc', '1-parse');
  const docs = path.join(test, 'docs');

  beforeEach(() => {
    fs.rmSync(test, {recursive: true, force: true});
    fs.mkdirSync(eoc, {recursive: true});
  });

  /**
   * Tests that the 'docs' command generates empty HTML files in the docs directory.
   * @param {Mocha.Done} done - Mocha callback signaling asynchronous completion
   */
  it('generates empty HTML files for packages', (done) => {
    const sample = path.join(eoc, 'foo', 'bar');
    fs.mkdirSync(sample, {recursive: true});
    const xmir = path.join(sample, 'test.xmir');
    fs.writeFileSync(xmir, '<program name="test" />');

    runSync([
      'docs',
      '--verbose',
      '-s', path.resolve(test, 'src'),
      '-t', test,
    ]);

    assert(fs.existsSync(docs), 'Expected the docs directory to be created but it is missing');

    const generated = path.join(docs, 'package_foo.bar.html');
    assert(fs.existsSync(generated), `Expected file ${generated} but it was not created`);
    const content = fs.readFileSync(generated, 'utf8');
    assert.strictEqual(content, '', 'Expected the generated file to be empty');

    const packages = path.join(docs, 'packages.html');
    assert(fs.existsSync(packages), `Expected file ${packages} but it was not created`);
    assert.strictEqual(
      fs.readFileSync(packages, 'utf8'), '', 'Expected packages.html to be empty'
    );

    const css = path.join(docs, 'styles.css');
    assert(fs.existsSync(css), `Expected file ${css} but it was not created`);
    assert.strictEqual(fs.readFileSync(css, 'utf8'), '', 'Expected styles.css to be empty');

    done();
  });
});
