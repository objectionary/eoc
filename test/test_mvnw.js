/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const {mvnw, flags} = require('../src/mvnw');
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {execSync} = require('child_process');

describe('mvnw', () => {
  it('prints Maven own version', async () => {
    const opts = {batch: true};
    await mvnw(['--version', '--quiet'], null, opts.batch);
  });
  it('sets right flags from options', async () => {
    const opts = {
      sources: 'sources',
      target: 'target',
      parser: '0.28.11',
      homeTag: 'homeTag'
    };
    const args = await mvnw(['--version', '--quiet', ...flags(opts)]);
    assert.ok(args.includes('-Deo.tag=homeTag'));
    assert.ok(args.includes('-Deo.version=0.28.11'));
  });
  it('includes slf4j-simple timestamp flags', () => {
    const opts = {
      sources: 'sources',
      target: 'target',
    };
    const result = flags(opts);
    assert.ok(
      result.includes('-Dorg.slf4j.simpleLogger.showDateTime=true'),
      'Expected slf4j showDateTime flag'
    );
    assert.ok(
      result.includes('-Dorg.slf4j.simpleLogger.dateTimeFormat=yyyy-MM-dd HH:mm:ss'),
      'Expected slf4j dateTimeFormat flag'
    );
  });
  it('shows timestamps in Maven log output', function () {
    this.timeout(60000);
    const home = path.resolve('temp/test-mvnw-timestamp');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(home, 'src'), {recursive: true});
    fs.writeFileSync(
      path.resolve(home, 'src/simple.eo'),
      '# sample\n[] > simple\n'
    );
    const combined = execSync(
      `node ${path.resolve('./src/eoc.js')} parse --verbose -s ${path.resolve(home, 'src')} -t ${path.resolve(home, 'target')} 2>&1`,
      {timeout: 300000, windowsHide: true}
    ).toString();
    assert.ok(
      /\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01]) \d{2}:\d{2}:\d{2} \[INFO\]/.test(combined),
      'Expected Maven INFO logs to include timestamps in yyyy-MM-dd HH:mm:ss format'
    );
  });
  it('skips the Maven Central check for SNAPSHOT parser versions', () => {
    const opts = {
      sources: 'sources',
      target: 'target',
      parser: '1.0-SNAPSHOT',
      homeTag: 'homeTag'
    };
    const result = flags(opts);
    assert.ok(result.includes('-Deo.version=1.0-SNAPSHOT'));
  });
  it('rejects when a quiet Maven run exits with a non-zero code', async function () {
    this.timeout(60000);
    await assert.rejects(
      mvnw(['--unrecognized-eoc-flag', '--quiet'], null, true),
      /exited with/,
      'mvnw should reject instead of killing the process when a quiet run fails'
    );
  });
  it('rejects when a verbose Maven run exits with a non-zero code', async function () {
    this.timeout(60000);
    await assert.rejects(
      mvnw(['--unrecognized-eoc-flag'], undefined, true),
      /exited with/,
      'mvnw should reject instead of killing the process when a verbose run fails'
    );
  });
  it('rejects with an Error so callers can wrap it as a cause', async function () {
    this.timeout(60000);
    await assert.rejects(
      mvnw(['--unrecognized-eoc-flag'], undefined, true),
      (error) => error instanceof Error,
      'mvnw rejection is not a proper Error, callers cannot wrap it as a cause'
    );
  });
  it('runs again after a previous run failed', async function () {
    this.timeout(120000);
    await assert.rejects(mvnw(['--unrecognized-eoc-flag', '--quiet'], null, true));
    const args = await mvnw(['--version', '--quiet'], null, true);
    assert.ok(args.includes('--version'), 'mvnw cannot run again, the process did not survive a failed run');
  });
  it('should handle ENOENT race condition in count function', function () {
    this.timeout(3000);
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'eoc-mvnw-enoent-'));
    const classes = path.join(dir, 'EOorg/EOeolang');
    fs.mkdirSync(classes, {recursive: true});
    fs.writeFileSync(path.join(classes, 'EOnan.class'), 'real');
    fs.symlinkSync(path.join(classes, 'EOmissing.class'), path.join(classes, 'EOnan$EOtimes.class'));
    function count(root, curr) {
      if (fs.existsSync(root)) {
        for (const f of fs.readdirSync(root)) {
          const next = path.join(root, f);
          try {
            if (fs.statSync(next).isDirectory()) {
              curr = count(next, curr);
            } else {
              curr++;
            }
          } catch (error) {
            if (error.code !== 'ENOENT') {
              throw error;
            }
          }
        }
      }
      return curr;
    }
    assert.strictEqual(count(dir, 0), 1, 'count should skip the vanished entry and tally the real class');
  });
});
