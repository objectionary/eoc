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
    const mockStdout = new stream.PassThrough();
    const mockStderr = new stream.PassThrough();
    const mockStdin = new stream.PassThrough();
    const javaProc = {
      stdout: mockStdout,
      stderr: mockStderr,
      kill: sinon.stub(),
      on: (event, cb) => {
        if (event === 'close') {
          setTimeout(() => cb(0), 100);
        }
      }
    };
    const mvnProc = {
      on: (event, cb) => {
        if (event === 'close') {
          setTimeout(() => cb(0), 100);
        }
      }
    };
    const spawnStub = sinon.stub();
    spawnStub.onCall(0).returns(mvnProc);
    spawnStub.onCall(1).returns(javaProc);
    let lastResponseBody = null;
    const inspect = proxyquire('../../src/commands/inspect', {
      'child_process': { spawn: spawnStub },
      'node-fetch': async (url, opts) => {
        lastResponseBody = opts.body;
        return { ok: true, text: async () => opts.body };
      },
    });
    const inspectPromise = inspect({ stdin: mockStdin, stdout: mockStdout });
    mockStdin.write('hello\n');
    await new Promise(res => setTimeout(res, 5000));
    mockStdin.write('exit\n');
    await new Promise(res => setTimeout(res, 5000));
    mockStdin.end();
    await inspectPromise;
    assert.strictEqual(lastResponseBody, 'hello', 'Expected echo response "hello"');
    assert(spawnStub.calledTwice, 'Expected 2 spawn-call: mvn and java');
    assert(javaProc.kill.called, 'Expected terminating server with kill()');
  });
});
