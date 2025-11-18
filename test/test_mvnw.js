/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const {mvnw, flags} = require('../src/mvnw');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

describe('mvnw', () => {
  it('prints Maven own version', async () => {
    const opts = {batch: true};
    await mvnw(['--version', '--quiet'], null, opts.batch);
  });
  it('sets right flags from options', async () => {
    const opts = {
      sources: 'sources',
      target: 'target',
      parser: 'parser',
      homeTag: 'homeTag'
    };
    const args = await mvnw(['--version', '--quiet', ...flags(opts)]);
    assert.ok(args.includes('-Deo.tag=homeTag'));
    assert.ok(args.includes('-Deo.version=parser'));
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
