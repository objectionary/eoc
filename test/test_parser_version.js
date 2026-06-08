/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const parserVersion = require('../src/parser-version');
const {weAreOnline} = require('./helpers');

describe('parser-version', () => {
  before(weAreOnline);
  describe('get()', () => {
    it('fetches the latest version from Maven Central', () => {
      const version = parserVersion.get();
      assert(version);
      assert(typeof version === 'string');
      assert(/^\d+\.\d+\.\d+$/.test(version), `Version ${version} should match semver pattern`);
    });
    it('caches the version after first fetch', () => {
      const first = parserVersion.get();
      const second = parserVersion.get();
      assert.strictEqual(first, second);
    });
  });
  describe('exists()', () => {
    it('returns true for a known valid version', function () {
      this.timeout(15000);
      const exists = parserVersion.exists('0.28.11');
      assert.strictEqual(exists, true, 'Version 0.28.11 should exist in Maven Central');
    });
    it('returns true for current default version', function () {
      this.timeout(15000);
      const fs = require('fs');
      const path = require('path');
      const defaultVersion = fs.readFileSync(
        path.join(__dirname, '../eo-version.txt'),
        'utf8'
      ).trim();
      const exists = parserVersion.exists(defaultVersion);
      assert.strictEqual(exists, true, `Default version ${defaultVersion} should exist`);
    });
    it('returns false for an obviously invalid version', function () {
      this.timeout(15000);
      const exists = parserVersion.exists('999.999.999');
      assert.strictEqual(exists, false, 'Version 999.999.999 should not exist');
    });
    it('returns false for undefined version', () => {
      const exists = parserVersion.exists(undefined);
      assert.strictEqual(exists, false, 'Undefined version should return false');
    });
    it('returns false for null version', () => {
      const exists = parserVersion.exists(null);
      assert.strictEqual(exists, false, 'Null version should return false');
    });
    it('returns false for empty string version', () => {
      const exists = parserVersion.exists('');
      assert.strictEqual(exists, false, 'Empty string version should return false');
    });
    it('returns false for "undefined" string', () => {
      const exists = parserVersion.exists('undefined');
      assert.strictEqual(exists, false, 'String "undefined" should return false');
    });
    it('constructs correct Maven Central URL', () => {
      const url = parserVersion.url('0.28.11');
      assert.strictEqual(
        url,
        'https://repo.maven.apache.org/maven2/org/eolang/eo-maven-plugin/0.28.11/eo-maven-plugin-0.28.11.pom',
        `URL ${url} should point to the eo-maven-plugin POM of 0.28.11`
      );
    });
    it('returns false when the HTTP call throws', () => {
      const exists = parserVersion.exists('0.28.11', () => {
        throw new Error('connection refused');
      });
      assert.strictEqual(exists, false, 'A failing HTTP call should make exists return false');
    });
    it('returns false when the HTTP status is not 200', () => {
      const exists = parserVersion.exists('0.28.11', () => ({statusCode: 404}));
      assert.strictEqual(exists, false, 'A non-200 response should make exists return false');
    });
  });
});
