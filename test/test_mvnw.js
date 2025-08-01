/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const {mvnw, flags} = require('../src/mvnw');
const { spawn } = require('child_process');
const assert = require('assert');

describe('mvnw', () => {
  it('prints Maven own version', (done) => {
    const opts = {batch: true};
    mvnw(['--version', '--quiet'], null, opts.batch);
    done();
  });
  it('sets right flags from options', (done) => {
    const opts = {
      sources: 'sources',
      target: 'target',
      parser: 'parser',
      homeTag: 'homeTag'
    };
    mvnw(['--version', '--quiet', ...flags(opts)]).then((args) => {
      assert.ok(args.includes('-Deo.tag=homeTag'));
      assert.ok(args.includes('-Deo.version=parser'));
      done();
    });
  });

  it('includes timestamps in Maven logs', (done) => {
    const mvnwPath = require('path').resolve(__dirname, '../mvnw/mvnw');
    const args = [
      '-Dorg.slf4j.simpleLogger.showDateTime=true',
      '-Dorg.slf4j.simpleLogger.dateTimeFormat=yyyy-MM-dd HH:mm:ss',
      'validate',
      '--quiet'
    ];
    const proc = spawn(mvnwPath, args);

    let output = '';
    proc.stdout.on('data', (data) => {
      output += data.toString();
    });
    proc.stderr.on('data', (data) => {
      output += data.toString();
    });
    proc.on('close', (code) => {
      const lines = output.split('\n');
      const hasTimestamp = lines.some(line => /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(line));
      assert.ok(hasTimestamp, 'Maven output should include timestamps');
      done();
    });
  });
});
