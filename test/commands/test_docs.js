/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {runSync} = require('../helpers');

/**
 * It should create an empty 'eodocs.html' file in the current directory.
 * @param {Function} done - Mocha's callback to signal completion
 */
describe('docs', function() {
  it('creates an empty eodocs.html file', function(done) {
    const filePath = path.resolve('eodocs.html');
    fs.rmSync(filePath, {recursive: true, force: true});
    runSync(['docs']);
    assert(fs.existsSync(filePath), `Expected eodocs.html to be created, but it's missing`);
    const content = fs.readFileSync(filePath, 'utf8');
    assert.strictEqual(
      content,
      '',
      `Expected eodocs.html to be empty, but it has content: ${content}`
    );
    done();
  });
});
