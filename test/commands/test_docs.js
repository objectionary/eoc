/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {runSync} = require('../helpers');

describe('docs', () => {
  const home = path.resolve('temp/test-docs');
  const target = path.resolve(home, 'target');
  const source = path.resolve(home, 'src');
  beforeEach(() => {
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(source, {recursive: true});
  });
  /**
   * Tests that the 'docs' command generates HTML files in the docs directory.
   * @param {Mocha.Done} done - Mocha callback signaling asynchronous completion
   */
  it('generates HTML files for files and packages', (done) => {
    const sample = path.join(source, 'foo', 'bar');
    fs.mkdirSync(sample, {recursive: true});
    const xmir1 = path.join(sample, 'test1.xmir');
    fs.writeFileSync(xmir1, '<program name="test" />');
    const xmir2 = path.join(sample, 'test1.xmir');
    fs.writeFileSync(xmir2, '<program name="test" />');
    runSync([
      'docs',
      '--verbose',
      '-s', source,
      '-t', target,
    ]);
    const docs = path.join(target, 'docs');
    assert(fs.existsSync(docs), 'Expected the docs directory to be created but it is missing');

    const test1_html = path.join(docs, 'foo/bar/test1.html');
    assert(fs.existsSync(test1_html), `Expected file ${test1_html} but it was not created`);

    const test2_html = path.join(docs, 'foo/bar/test2.html');
    assert(fs.existsSync(test2_html), `Expected file ${test2_html} but it was not created`);

    const package_foo_bar_html = path.join(docs, 'package_foo.bar.html');
    assert(fs.existsSync(package_foo_bar_html), `Expected file ${package_foo_bar_html} but it was not created`);

    const packages_html = path.join(docs, 'packages.html');
    assert(fs.existsSync(packages), `Expected file ${packages} but it was not created`);

    const css = path.join(docs, 'styles.css');
    assert(fs.existsSync(css), `Expected file ${css} but it was not created`);
    done();
  });
});
