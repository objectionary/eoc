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
  const parsed = path.resolve(home, '1-parse');
  const docs = path.join(home, 'docs');
  beforeEach(() => {
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(parsed, {recursive: true});
  });
  /**
   * Tests that the 'docs' command generates HTML files in the docs directory.
   * @param {Mocha.Done} done - Mocha callback signaling asynchronous completion
   */
  it('generates HTML files for files and packages', (done) => {
    const sample = path.join(parsed, 'foo', 'bar');
    fs.mkdirSync(sample, {recursive: true});
    const xmir1 = path.join(sample, 'test1.xmir');
    fs.writeFileSync(xmir1, '<program name="test" />');
    const xmir2 = path.join(sample, 'test2.xmir');
    fs.writeFileSync(xmir2, '<program name="test" />');
    runSync([
      'docs',
      '--verbose',
      '-s', path.resolve(home, 'src'),
      '-t', home,
    ]);
    assert(fs.existsSync(docs), 'Expected the docs directory to be created but it is missing');
    const test1_html = path.join(docs, 'foo/bar/test1.html');
    assert(fs.existsSync(test1_html), `Expected file ${test1_html} but it was not created`);
    const test2_html = path.join(docs, 'foo/bar/test2.html');
    assert(fs.existsSync(test2_html), `Expected file ${test2_html} but it was not created`);
    const package_foo_bar_html = path.join(docs, 'package_foo.bar.html');
    assert(fs.existsSync(package_foo_bar_html), `Expected file ${package_foo_bar_html} but it was not created`);
    const packages_html = path.join(docs, 'packages.html');
    assert(fs.existsSync(packages_html), `Expected file ${packages_html} but it was not created`);
    const css_html = path.join(docs, 'styles.css');
    assert(fs.existsSync(css_html), `Expected file ${css_html} but it was not created`);
    done();
  });
  /**
   * Tests that the 'docs' command generates expected comments from XMIR to HTML.
   * @param {Mocha.Done} done - Mocha callback signaling asynchronous completion
   */
  it('generates necessary comments from XMIR to HTML', (done) => {
    const sample = path.join(parsed, 'foo');
    fs.mkdirSync(sample, {recursive: true});
    const xmir1 = path.join(sample, 'test1.xmir');
    fs.writeFileSync(xmir1, fs.readFileSync(path.join(__dirname, '..', 'resources', 'test1.xmir')).toString());
    const xmir2 = path.join(sample, 'test2.xmir');
    fs.writeFileSync(xmir2, fs.readFileSync(path.join(__dirname, '..', 'resources', 'test2.xmir')).toString());
    runSync([
      'docs',
      '--verbose',
      '-s', path.resolve(home, 'src'),
      '-t', home,
    ]);
    assert(fs.existsSync(docs), 'Expected the docs directory to be created but it is missing');
    const test1_html = path.join(docs, 'foo/test1.html');
    assert(fs.existsSync(test1_html), `Expected file ${test1_html} but it was not created`);
    const test1_content = fs.readFileSync(test1_html);
    assert(test1_content.includes('This is documentation for app'), `Expected documentation but it was not found in ${test1_html}`);
    assert(test1_content.includes('First docs line'), `Expected documentation but it was not found in ${test1_html}`);
    assert(test1_content.includes('Second docs line'), `Expected documentation but it was not found in ${test1_html}`);
    const package_html = path.join(docs, 'package_foo.html');
    assert(fs.existsSync(package_html), `Expected file ${package_html} but it was not created`);
    const package_content = fs.readFileSync(package_html);
    assert(package_content.includes('This is documentation for app'), `Expected documentation but it was not found in ${package_html}`);
    assert(package_content.includes('First docs line'), `Expected documentation but it was not found in ${package_html}`);
    assert(package_content.includes('Second docs line'), `Expected documentation but it was not found in ${package_html}`);
    assert(package_content.includes('Second test app'), `Expected documentation but it was not found in ${package_html}`);
    const packages_html = path.join(docs, 'packages.html');
    assert(fs.existsSync(packages_html), `Expected file ${packages_html} but it was not created`);
    const packages_content = fs.readFileSync(packages_html);
    assert(packages_content.includes('This is documentation for app'), `Expected documentation but it was not found in ${packages_html}`);
    assert(packages_content.includes('First docs line'), `Expected documentation but it was not found in ${packages_html}`);
    assert(packages_content.includes('Second docs line'), `Expected documentation but it was not found in ${packages_html}`);
    assert(packages_content.includes('Second test app'), `Expected documentation but it was not found in ${packages_html}`);
    done();
  });
  /**
   * Tests that the 'docs' command does not generate unnecessary comments from XMIR to HTML.
   * @param {Mocha.Done} done - Mocha callback signaling asynchronous completion
   */
  it('does not generate unnecessary comment from XMIR to HTML', (done) => {
    const sample = parsed;
    fs.mkdirSync(sample, {recursive: true});
    const xmir = path.join(sample, 'test.xmir');
    fs.writeFileSync(xmir, fs.readFileSync(path.join(__dirname, '..', 'resources', 'test3.xmir')).toString());
    runSync([
      'docs',
      '--verbose',
      '-s', path.resolve(home, 'src'),
      '-t', home,
    ]);
    assert(fs.existsSync(docs), 'Expected the docs directory to be created but it is missing');
    const test_html = path.join(docs, 'test.html');
    assert(fs.existsSync(test_html), `Expected file ${test_html} but it was not created`);
    const test_content = fs.readFileSync(test_html);
    assert(!test_content.includes('Not docs'), `Unnecessary comment found in ${test_html}`);
    done();
  });
  /**
   * Tests that the 'docs' command does not generate test to HTML.
   * @param {Mocha.Done} done - Mocha callback signaling asynchronous completion
   */
  it('does not generate tests to HTML', (done) => {
    const sample = parsed;
    fs.mkdirSync(sample, {recursive: true});
    const xmir = path.join(sample, 'test.xmir');
    fs.writeFileSync(xmir, fs.readFileSync(path.join(__dirname, '..', 'resources', 'test4.xmir')).toString());
    runSync([
      'docs',
      '--verbose',
      '-s', path.resolve(home, 'src'),
      '-t', home,
    ]);
    assert(fs.existsSync(docs), 'Expected the docs directory to be created but it is missing');
    const test_html = path.join(docs, 'test.html');
    assert(fs.existsSync(test_html), `Expected file ${test_html} but it was not created`);
    const test_content = fs.readFileSync(test_html);
    assert(!test_content.includes('Tests this comment is not in docs.'), `Unnecessary comment found in ${test_html}`);
    done();
  });
  /**
   * Tests that the 'docs' command does not generate completely empty HTML for empty docblocks.
   * @param {Mocha.Done} done - Mocha callback signaling asynchronous completion
   */
  it('does not generate empty HTML for empty docblocks', (done) => {
    const sample = parsed;
    fs.mkdirSync(sample, {recursive: true});
    const xmir = path.join(sample, 'test.xmir');
    fs.writeFileSync(xmir, fs.readFileSync(path.join(__dirname, '..', 'resources', 'test5.xmir')).toString());
    runSync([
      'docs',
      '--verbose',
      '-s', path.resolve(home, 'src'),
      '-t', home,
    ]);
    assert(fs.existsSync(docs), 'Expected the docs directory to be created but it is missing');
    const test_html = path.join(docs, 'test.html');
    assert(fs.existsSync(test_html), `Expected file ${test_html} but it was not created`);
    const test_content = fs.readFileSync(test_html).toString();
    const text_only = test_content.replace(/<[^>]*>/g, '')
                                  .replace(/\s+/g, '');
    assert(text_only.length > 0);
    done();
  });
});
