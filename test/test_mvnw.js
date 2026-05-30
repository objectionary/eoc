/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const {mvnw, flags} = require('../src/mvnw');
const assert = require('assert');
const fs = require('fs');
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
  it('should handle ENOENT race condition in count function', function (done) {
    this.timeout(3000);
    const tempDir = path.resolve('temp/test-mvnw-enoent');
    const classesDir = path.resolve(tempDir, 'classes');
    const subDir = path.resolve(classesDir, 'EOorg/EOeolang');
    fs.rmSync(tempDir, { recursive: true, force: true });
    fs.mkdirSync(subDir, { recursive: true });
    const problematicFile = path.resolve(classesDir, 'EOorg/EOeolang/EOnan$EOtimes.class');
    fs.writeFileSync(problematicFile, 'test content');
    function count(dir, curr) {
      if (fs.existsSync(dir)) {
        for (const f of fs.readdirSync(dir)) {
          const next = path.join(dir, f);
          try {
            if (fs.statSync(next).isDirectory()) {
              curr = count(next, curr);
            } else {
              curr++;
            }
          } catch (error) {
            if (error.code === 'ENOENT') {
              throw error;
            }
            throw error;
          }
        }
      }
      return curr;
    }
    if (fs.existsSync(problematicFile)) {
      fs.unlinkSync(problematicFile);
    }
    try {
      const result = count(classesDir, 0);
      assert(result >= 0, 'Count should complete without ENOENT error');
      done();
    } catch (error) {
      if (error.code === 'ENOENT') {
        assert.fail('ENOENT error should be handled gracefully');
      } else {
        throw error;
      }
    }
    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});
