/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const eo2jsw = require('../src/eo2jsw');

describe('eo2jsw flags', () => {
  const lib = '/fake/lib/path';
  it('splits --foreign and eo-foreign.json into separate argv elements', () => {
    const result = eo2jsw.flags({target: '/target'}, lib);
    const foreignIdx = result.indexOf('--foreign');
    assert.notStrictEqual(foreignIdx, -1, '--foreign flag must be present');
    assert.strictEqual(result[foreignIdx + 1], 'eo-foreign.json', 'eo-foreign.json must follow --foreign');
  });
  it('no argv element contains both --foreign and eo-foreign.json', () => {
    const result = eo2jsw.flags({target: '/target'}, lib);
    for (const element of result) {
      assert.ok(
        !(element.includes('--foreign') && element.includes('eo-foreign.json')),
        `No single argv element should contain both --foreign and eo-foreign.json: "${element}"`
      );
    }
  });
  it('passes target path with spaces as a single intact element', () => {
    const result = eo2jsw.flags({target: '/path with spaces/target'}, lib);
    const targetIdx = result.indexOf('--target');
    assert.strictEqual(result[targetIdx + 1], '/path with spaces/target',
      'target path with spaces must remain intact');
  });
  it('passes target path with shell metacharacters as a single intact element', () => {
    const result = eo2jsw.flags({target: '/path (weird) & dir/target'}, lib);
    const targetIdx = result.indexOf('--target');
    assert.strictEqual(result[targetIdx + 1], '/path (weird) & dir/target',
      'target path with metacharacters must remain intact');
  });
  it('passes target path with semicolons as a single intact element', () => {
    const result = eo2jsw.flags({target: '/path; rm -rf/target'}, lib);
    const targetIdx = result.indexOf('--target');
    assert.strictEqual(result[targetIdx + 1], '/path; rm -rf/target',
      'target path with semicolons must remain intact');
  });
  it('handles target path with multiple spaces', () => {
    const result = eo2jsw.flags({target: '/path with   multiple   spaces/target'}, lib);
    const targetIdx = result.indexOf('--target');
    assert.strictEqual(result[targetIdx + 1], '/path with   multiple   spaces/target',
      'target path with multiple spaces must remain intact');
  });
  it('handles target path with combined special characters', () => {
    const result = eo2jsw.flags({target: '/path (weird) & dir; with spaces/target'}, lib);
    const targetIdx = result.indexOf('--target');
    assert.strictEqual(result[targetIdx + 1], '/path (weird) & dir; with spaces/target',
      'target path with combined special chars must remain intact');
  });
  it('includes --alone flag when alone is true', () => {
    const result = eo2jsw.flags({target: '/target', alone: true}, lib);
    assert.notStrictEqual(result.indexOf('--alone'), -1, '--alone flag must be present');
  });
  it('excludes --alone flag when alone is false', () => {
    const result = eo2jsw.flags({target: '/target', alone: false}, lib);
    assert.strictEqual(result.indexOf('--alone'), -1, '--alone flag must not be present');
  });
  it('includes --tests flag when tests is true', () => {
    const result = eo2jsw.flags({target: '/target', tests: true}, lib);
    assert.notStrictEqual(result.indexOf('--tests'), -1, '--tests flag must be present');
  });
  it('excludes --tests flag when tests is false', () => {
    const result = eo2jsw.flags({target: '/target', tests: false}, lib);
    assert.strictEqual(result.indexOf('--tests'), -1, '--tests flag must not be present');
  });
  it('uses default project name when project is not provided', () => {
    const result = eo2jsw.flags({target: '/target'}, lib);
    const projectIdx = result.indexOf('--project');
    assert.strictEqual(result[projectIdx + 1], 'project', 'default project name must be used');
  });
  it('uses custom project name when provided', () => {
    const result = eo2jsw.flags({target: '/target', project: 'my-project'}, lib);
    const projectIdx = result.indexOf('--project');
    assert.strictEqual(result[projectIdx + 1], 'my-project', 'custom project name must be used');
  });
  it('includes resources path resolved from lib', () => {
    const result = eo2jsw.flags({target: '/target'}, lib);
    const resourcesIdx = result.indexOf('--resources');
    assert.strictEqual(result[resourcesIdx + 1], '/fake/lib/path/resources',
      'resources path must be resolved correctly');
  });
});
