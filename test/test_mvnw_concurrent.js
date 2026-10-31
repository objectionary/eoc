/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const vm = require('vm');
const {EventEmitter} = require('events');

/**
 * Load the real wrapper with controlled child processes, clock callbacks and terminal output.
 * @param {Object} terminal Terminal properties of stdout
 * @return {Object} Wrapper exports and captured external effects
 */
function wrapper(terminal = {isTTY: true}) {
  const children = [];
  const timers = [];
  const lines = [];
  const controls = [];
  const loaded = {exports: {}};
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'eoc-concurrent-progress-'));
  const targets = ['one', 'two'].map(name => path.join(home, name));
  targets.forEach(target => {
    fs.mkdirSync(target);
    fs.writeFileSync(path.join(target, 'first.class'), 'first');
  });
  fs.writeFileSync(path.join(targets[1], 'second.class'), 'second');
  let now = 0;
  const source = path.resolve(__dirname, '../src/mvnw.js');
  vm.runInNewContext(fs.readFileSync(source, 'utf8'), {
    require: name => {
      if (name === 'child_process') {
        return {spawn: () => {
          const child = new EventEmitter();
          children.push(child);
          return child;
        }};
      }
      if (name === 'readline') {
        return {clearLine: () => controls.push('clear'), cursorTo: () => controls.push('cursor')};
      }
      return name === './parser-version' ? {} : require(name);
    },
    module: loaded,
    __dirname: path.dirname(source),
    process: {platform: process.platform, env: process.env, stdout: {...terminal, write: line => lines.push(line)}},
    console,
    setTimeout: callback => timers.push(callback),
    Date: {now: () => now}
  }, {filename: source});
  return {
    mvnw: loaded.exports.mvnw, children, timers, lines, controls, targets,
    advance: millis => { now += millis; },
    dispose: () => fs.rmSync(home, {recursive: true, force: true})
  };
}

describe('concurrent Maven progress', () => {
  it('keeps each invocation label when its next progress callback runs', async () => {
    const run = wrapper();
    const one = run.mvnw(['first-goal', '--quiet'], run.targets[0], false);
    run.advance(5000);
    const two = run.mvnw(['second-goal', '--quiet'], run.targets[1], false);
    run.advance(5000);
    try {
      run.timers[0]();
      assert(run.lines.at(-1).includes('[first-goal] 10s; 1 files'), 'first run adopted another goal, clock or target');
    } finally {
      run.children.forEach(child => child.emit('close', 0));
      await Promise.all([one, two]);
      run.dispose();
    }
  });
  it('continues reporting the second process after the first one closes', async () => {
    const run = wrapper();
    const one = run.mvnw(['first-goal', '--quiet'], run.targets[0], false);
    const two = run.mvnw(['second-goal', '--quiet'], run.targets[1], false);
    run.children[0].emit('close', 0);
    const before = run.lines.length;
    try {
      run.timers[1]();
      assert.strictEqual(run.lines.length, before + 1, 'first completion stopped the other progress loop');
      assert(run.lines.at(-1).includes('[second-goal]'), 'remaining process lost its own label');
    } finally {
      run.children[1].emit('close', 0);
      await Promise.all([one, two]);
      run.dispose();
    }
  });
});

describe('Maven progress output', () => {
  [{}, {isTTY: false}].forEach((terminal) => {
    it(`leaves redirected stdout untouched when isTTY is ${terminal.isTTY}`, async () => {
      const run = wrapper(terminal);
      const pending = run.mvnw(['first-goal', '--quiet'], run.targets[0], false);
      try {
        run.children[0].emit('close', 0);
        await pending;
        assert.deepStrictEqual(run.lines, [], 'redirected stdout contains progress text');
        assert.deepStrictEqual(run.controls, [], 'redirected stdout received terminal control sequences');
        assert.deepStrictEqual(run.timers, [], 'a non-terminal output started the progress timer');
      } finally {
        run.dispose();
      }
    });
  });
  it('does not clear redirected stdout after a spawn error', async () => {
    const run = wrapper({});
    const pending = run.mvnw(['first-goal', '--quiet'], run.targets[0], false);
    try {
      const failed = assert.rejects(pending, /Maven unavailable/);
      run.children[0].emit('error', new Error('Maven unavailable'));
      await failed;
      assert.deepStrictEqual(run.lines, [], 'the failed process wrote progress to redirected stdout');
      assert.deepStrictEqual(run.controls, [], 'the failed process cleared a non-terminal output');
      assert.deepStrictEqual(run.timers, [], 'the failed non-terminal process scheduled progress');
    } finally {
      run.dispose();
    }
  });
  it('keeps batch mode quiet even on a terminal', async () => {
    const run = wrapper();
    const pending = run.mvnw(['first-goal', '--quiet'], run.targets[0], true);
    try {
      run.children[0].emit('close', 0);
      await pending;
      assert.deepStrictEqual(run.lines, [], 'batch mode displayed progress');
      assert.deepStrictEqual(run.controls, [], 'batch mode moved the terminal cursor');
      assert.deepStrictEqual(run.timers, [], 'batch mode started a progress timer');
    } finally {
      run.dispose();
    }
  });
});
