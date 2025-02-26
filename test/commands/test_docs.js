/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {runSync} = require('../helpers');

describe('docs', function() {
  const testDir = path.resolve('temp/test-docs-command');
  const eocDir = path.join(testDir, '.eoc', '1-parse');
  const docsDir = path.join(testDir, 'docs');

  beforeEach(function() {
    fs.rmSync(testDir, { recursive: true, force: true });
    fs.mkdirSync(eocDir, { recursive: true });
  });

  /**
   * Tests that the 'docs' command generates empty HTML files in the docs directory.
   * @param {Mocha.Done} done - Mocha callback signaling asynchronous completion
   */
  it('generates empty HTML files for packages', function(done) {
    const samplePackageDir = path.join(eocDir, 'foo', 'bar');
    fs.mkdirSync(samplePackageDir, { recursive: true });
    const xmirFilePath = path.join(samplePackageDir, 'test.xmir');
    fs.writeFileSync(xmirFilePath, '<program name="test" />');

    runSync([
      'docs',
      '--verbose',
      '-s', path.resolve(testDir, 'src'),
      '-t', testDir,
    ]);

    assert(fs.existsSync(docsDir), 'Expected the docs directory to be created but it is missing');

    const generatedFile = path.join(docsDir, 'package_foo.bar.html');
    assert(fs.existsSync(generatedFile), `Expected file ${generatedFile} but it was not created`);
    const content = fs.readFileSync(generatedFile, 'utf8');
    assert.strictEqual(content, '', 'Expected the generated file to be empty');

    const packagesFile = path.join(docsDir, 'packages.html');
    assert(fs.existsSync(packagesFile), `Expected file ${packagesFile} but it was not created`);
    assert.strictEqual(
      fs.readFileSync(packagesFile, 'utf8'), '', 'Expected packages.html to be empty'
    );

    const cssFile = path.join(docsDir, 'styles.css');
    assert(fs.existsSync(cssFile), `Expected file ${cssFile} but it was not created`);
    assert.strictEqual(fs.readFileSync(cssFile, 'utf8'), '', 'Expected styles.css to be empty');

    done();
  });
});
