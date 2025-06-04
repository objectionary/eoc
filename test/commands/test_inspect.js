/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */
const assert = require('assert');
const sinon = require('sinon');
const stream = require('stream');
const proxyquire = require('proxyquire');
describe('inspect command (mocked)', () => {
  it('should send text and receive echoed response, then exit cleanly', async () => {
    const out = new stream.PassThrough();
    const err = new stream.PassThrough();
    const input = new stream.PassThrough();
    const java = {
      stdout: out,
      stderr: err,
      kill: sinon.stub(),
      on: (event, cb) => {
        if (event === 'close') {
          setTimeout(() => cb(0), 100);
        }
      }
    };
    const spawn = sinon.stub();
    spawn.onCall(0).returns(java);
    let lastBody = null;
    const inspect = proxyquire('../../src/commands/inspect', {
      'child_process': { spawn },
      'node-fetch': async (url, opts) => {
        lastBody = opts.body;
        return { ok: true, text: async () => opts.body };
      },
    });
    const inspectPromise = inspect({ stdin: input, stdout: out });
    input.write('hello\n');
    await new Promise(res => setTimeout(res, 5000));
    input.write('exit\n');
    await new Promise(res => setTimeout(res, 5000));
    input.end();
    await inspectPromise;
    assert.strictEqual(lastBody, 'hello', 'Expected echo response "hello"');
    assert(java.kill.called, 'Expected terminating server with kill()');
  });
});
