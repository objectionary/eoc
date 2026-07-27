/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const path = require('path');
const childProcess = require('child_process');

describe('eo2jsw', () => {
  it('passes a target path with spaces as a single argument', async () => {
    const original = childProcess.execFileSync;
    const calls = [];
    childProcess.execFileSync = (file, args, options) => {
      calls.push({file, args, options});
    };
    delete require.cache[require.resolve('../src/eo2jsw')];
    const eo2jsw = require('../src/eo2jsw');
    try {
      await eo2jsw('transpile', {
        target: path.join('temp', 'My Project', 'target'),
        project: 'project',
        alone: true,
      });
    } finally {
      childProcess.execFileSync = original;
      delete require.cache[require.resolve('../src/eo2jsw')];
    }
    assert.strictEqual(calls.length, 1, 'expected one eo2js invocation');
    assert.strictEqual(calls[0].file, 'node');
    assert.ok(
      calls[0].args.includes(path.join('temp', 'My Project', 'target')),
      `expected target path to stay intact, got: ${JSON.stringify(calls[0].args)}`
    );
    assert.ok(
      !calls[0].args.includes('temp/My') && !calls[0].args.includes('temp\\My'),
      `expected no shell-split fragments, got: ${JSON.stringify(calls[0].args)}`
    );
  });
});
