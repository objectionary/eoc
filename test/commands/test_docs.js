/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {runSync} = require('../helpers');
const generateDocs = require('../../src/commands/docs');

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
   * Tests that a root-level XMIR is not assigned the "." filesystem
   * marker as its package name.
   * @param {Mocha.Done} done - Mocha callback signaling asynchronous completion
   */
  it('does not expose "." as a package for root-level XMIR', (done) => {
    fs.writeFileSync(
      path.join(parsed, 'app.xmir'),
      '<program name="app" />'
    );
    runSync([
      'docs',
      '--verbose',
      '-s', path.resolve(home, 'src'),
      '-t', home,
    ]);
    const app_html = path.join(docs, 'app.html');
    assert(
      fs.existsSync(app_html),
      `Expected root object page ${app_html} but it was not created`
    );
    const invalid_package = path.join(docs, 'package_..html');
    assert(
      !fs.existsSync(invalid_package),
      `Unexpected package page ${invalid_package}`
    );
    const summary = fs.readFileSync(
      path.join(docs, 'summary.xml'),
      'utf-8'
    );
    assert(
      summary.includes('packages="0"'),
      'Expected no package for a root-level XMIR'
    );
    assert(
      summary.includes('objects="1"'),
      'Expected the root-level object to remain in the object count'
    );
    assert(
      !summary.includes('<package name=".">'),
      'The filesystem marker "." must not be exposed as a package name'
    );
    done();
  });
  /**
   * Tests that 'docs' does not crash for a package whose name is an
   * inherited object property, such as 'constructor'.
   * @param {Mocha.Done} done - Mocha callback signaling asynchronous completion
   */
  it('generates HTML for a package named after an object prototype member', (done) => {
    const sample = path.join(parsed, 'constructor');
    fs.mkdirSync(sample, {recursive: true});
    fs.writeFileSync(path.join(sample, 'foo.xmir'), '<program name="test" />');
    runSync([
      'docs',
      '--verbose',
      '-s', path.resolve(home, 'src'),
      '-t', home,
    ]);
    const package_html = path.join(docs, 'package_constructor.html');
    assert(fs.existsSync(package_html), `Expected file ${package_html} but it was not created`);
    done();
  });
  /**
   * Tests that the 'docs' command generates a summary.xml with correct counts.
   * @param {Mocha.Done} done - Mocha callback signaling asynchronous completion
   */
  it('generates summary XML with correct package and object counts', (done) => {
    const sample = path.join(parsed, 'foo', 'bar');
    fs.mkdirSync(sample, {recursive: true});
    fs.writeFileSync(path.join(sample, 'test1.xmir'), '<program name="test" />');
    fs.writeFileSync(path.join(sample, 'test2.xmir'), '<program name="test" />');
    runSync([
      'docs',
      '--verbose',
      '-s', path.resolve(home, 'src'),
      '-t', home,
    ]);
    const summary = path.join(docs, 'summary.xml');
    assert(fs.existsSync(summary), `Expected file ${summary} but it was not created`);
    const content = fs.readFileSync(summary, 'utf-8');
    assert(content.includes('packages="1"'), 'Expected 1 package in summary.xml');
    assert(content.includes('objects="2"'), 'Expected 2 objects in summary.xml');
    assert(content.includes('<package name="foo.bar">'), 'Expected package foo.bar in summary.xml');
    assert(content.includes('<object name="test1"/>'), 'Expected object test1 in summary.xml');
    assert(content.includes('<object name="test2"/>'), 'Expected object test2 in summary.xml');
    done();
  });
  /**
   * Tests that the 'docs' command reports the real summary path, rather
   * than the literal "%s" left over by a printf-style call.
   * @return {Promise} of the docs command, resolved to its summary message
   */
  it('reports the path of the generated summary', async () => {
    const sample = path.join(parsed, 'foo', 'bar');
    fs.mkdirSync(sample, {recursive: true});
    fs.writeFileSync(path.join(sample, 'test1.xmir'), '<program name="test" />');
    const expected = path.relative(process.cwd(), path.join(docs, 'summary.xml'));
    const message = await generateDocs({target: home, sources: path.resolve(home, 'src')});
    assert(
      message.includes(expected),
      `Expected "${message}" to contain "${expected}"`
    );
  });
  /**
   * Tests exact object title and signature rendering in generated HTML.
   * @param {Mocha.Done} done - Mocha callback signaling asynchronous completion
   */
  it('renders exact object titles and signatures', (done) => {
    const sample = path.join(parsed, 'foo');
    fs.mkdirSync(sample, {recursive: true});
    const xmir = path.join(sample, 'test1.xmir');
    fs.writeFileSync(
      xmir,
      fs.readFileSync(path.join(__dirname, '..', 'resources', 'test1.xmir')).toString()
    );
    runSync([
      'docs',
      '--verbose',
      '-s', path.resolve(home, 'src'),
      '-t', home,
    ]);
    const html = path.join(docs, 'foo/test1.html');
    const content = fs.readFileSync(html, 'utf-8');
    const expected = [
      '<h1 class="object-title">app</h1>',
      '<p class="object-sign">app(args)</p>',
      '<h1 class="object-title">app.test_obj</h1>',
      '<p class="object-sign">app.test_obj()</p>',
    ];
    for (const fragment of expected) {
      assert(
        content.includes(fragment),
        `Expected exact HTML fragment "${fragment}" in ${html}`
      );
    }
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
  /**
   * Tests that the 'docs' command generates markdown correctly.
   * @param {Mocha.Done} done - Mocha callback signaling asynchronous completion
   */
  it('generates markdown correctly', (done) => {
    const sample = parsed;
    fs.mkdirSync(sample, {recursive: true});
    const xmir = path.join(sample, 'test.xmir');
    fs.writeFileSync(xmir, fs.readFileSync(path.join(__dirname, '..', 'resources', 'test6.xmir')).toString());
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
    assert(test_content.includes('<strong>Strong test</strong>'), `Markdown not processed correctly in ${test_html}`);
    assert(test_content.includes('<code>Code test</code>'), `Markdown not processed correctly in ${test_html}`);
    done();
  });
  /**
   * Tests that createXmirHtmlBlock keeps the original error as the cause
   * when the XSL transform fails, instead of silently discarding it.
   * @param {Mocha.Done} done - Mocha callback signaling asynchronous completion
   */
  it('preserves the original error as the cause when the XSL transform fails', (done) => {
    const bad = path.join(parsed, 'bad.xmir');
    fs.writeFileSync(bad, 'not valid xmir <<<');
    let thrown;
    try {
      generateDocs.createXmirHtmlBlock(bad);
    } catch (error) {
      thrown = error;
    }
    assert.ok(thrown.cause instanceof Error, 'the wrapper must keep the original XSL error as its cause');
    done();
  });
  /**
   * Tests that the original error survives to the top of the docs command,
   * rather than being dropped by the outer catch block.
   * @return {Promise} of the docs command run against a broken XMIR
   */
  it('surfaces the original error as the cause when docs fails', async () => {
    const sample = path.join(parsed, 'pkg');
    fs.mkdirSync(sample, {recursive: true});
    fs.writeFileSync(path.join(sample, 'bad.xmir'), 'not valid xmir <<<');
    let thrown;
    try {
      await generateDocs({target: home, sources: path.resolve(home, 'src')});
    } catch (error) {
      thrown = error;
    }
    assert.ok(thrown.cause instanceof Error, 'docs must surface the original XSL error as its cause');
  });
  /**
   * Tests that the wrapper message is derived from the original error,
   * so the failure text is not lost alongside the cause.
   * @param {Mocha.Done} done - Mocha callback signaling asynchronous completion
   */
  it('embeds the original error text in the wrapper message', (done) => {
    const bad = path.join(parsed, 'bad.xmir');
    fs.writeFileSync(bad, 'not valid xmir <<<');
    let thrown;
    try {
      generateDocs.createXmirHtmlBlock(bad);
    } catch (error) {
      thrown = error;
    }
    assert.ok(
      thrown.message.includes(thrown.cause.message),
      'the wrapper message must embed the original error text'
    );
    done();
  });
  /**
   * Tests that 'saxon-js', required directly by this module, is declared
   * as its own dependency instead of relying on it being pulled in
   * transitively through 'eo2js'.
   */
  it('declares saxon-js as a direct dependency', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf-8'));
    assert.ok(pkg.dependencies['saxon-js'], 'saxon-js must be listed in package.json dependencies');
  });
});
