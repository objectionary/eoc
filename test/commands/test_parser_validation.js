/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');
const {weAreOnline} = require('../helpers');

describe('parser version validation', () => {
  before(weAreOnline);

  const createTestProject = (dir) => {
    fs.rmSync(dir, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(dir, 'src'), {recursive: true});
    fs.writeFileSync(
      path.resolve(dir, 'src/simple.eo'),
      '# sample\n[] > simple\n'
    );
  };

  const runCommand = (args) => {
    try {
      return execSync(
        `node ${path.resolve('./src/eoc.js')} --batch ${args}`,
        {
          timeout: 30000,
          windowsHide: true,
          encoding: 'utf8'
        }
      );
    } catch (ex) {
      return {
        stdout: ex.stdout ? ex.stdout.toString() : '',
        stderr: ex.stderr ? ex.stderr.toString() : '',
        error: ex.message,
        status: ex.status
      };
    }
  };

  it('rejects invalid parser version with clear error message', function () {
    this.timeout(30000);
    const home = path.resolve('temp/test-parser-validation/invalid');
    createTestProject(home);

    const result = runCommand([
      'parse',
      '--parser=999.999.999',
      '-s', path.resolve(home, 'src'),
      '-t', path.resolve(home, 'target'),
    ].join(' '));

    assert(result.status !== 0, 'Command should fail with non-zero exit code');
    const output = result.stderr || result.stdout || result.error;
    assert(
      output.includes('Parser version 999.999.999 is not available'),
      `Error message should mention version unavailability. Got: ${output}`
    );
    assert(
      output.includes('Maven Central'),
      `Error message should mention Maven Central. Got: ${output}`
    );
  });

  it('accepts valid parser version', function () {
    this.timeout(60000);
    const home = path.resolve('temp/test-parser-validation/valid');
    createTestProject(home);

    const result = runCommand([
      'parse',
      '--parser=0.28.11',
      '-s', path.resolve(home, 'src'),
      '-t', path.resolve(home, 'target'),
    ].join(' '));

    if (typeof result === 'object' && result.status !== undefined) {
      const output = result.stderr || result.stdout || result.error;
      assert(
        !output.includes('is not available'),
        `Valid version should not be rejected. Got: ${output}`
      );
    }
  });

  it('provides helpful guidance in error message', function () {
    this.timeout(30000);
    const home = path.resolve('temp/test-parser-validation/guidance');
    createTestProject(home);

    const result = runCommand([
      'parse',
      '--parser=999.999.999',
      '-s', path.resolve(home, 'src'),
      '-t', path.resolve(home, 'target'),
    ].join(' '));

    const output = result.stderr || result.stdout || result.error;
    assert(
      output.includes('--latest'),
      `Error message should suggest --latest flag. Got: ${output}`
    );
    assert(
      output.includes('repo.maven.apache.org'),
      `Error message should include link to Maven Central. Got: ${output}`
    );
  });

  it('validates parser version before calling Maven', function () {
    this.timeout(30000);
    const home = path.resolve('temp/test-parser-validation/early');
    createTestProject(home);

    const result = runCommand([
      'parse',
      '--parser=999.999.999',
      '-s', path.resolve(home, 'src'),
      '-t', path.resolve(home, 'target'),
    ].join(' '));

    const output = result.stderr || result.stdout || result.error;
    assert(
      !output.includes('No plugin found for prefix'),
      `Should show our error message, not Maven's. Got: ${output}`
    );
    assert(
      output.includes('is not available'),
      `Should show our validation error. Got: ${output}`
    );
  });

  it('handles assemble command with invalid version', function () {
    this.timeout(30000);
    const home = path.resolve('temp/test-parser-validation/assemble');
    createTestProject(home);

    const result = runCommand([
      'assemble',
      '--parser=999.999.999',
      '-s', path.resolve(home, 'src'),
      '-t', path.resolve(home, 'target'),
    ].join(' '));

    assert(result.status !== 0, 'Assemble should fail with invalid version');
    const output = result.stderr || result.stdout || result.error;
    assert(
      output.includes('is not available'),
      `Should validate version for assemble command. Got: ${output}`
    );
  });

  it('handles lint command with invalid version', function () {
    this.timeout(30000);
    const home = path.resolve('temp/test-parser-validation/lint');
    createTestProject(home);

    const result = runCommand([
      'lint',
      '--parser=999.999.999',
      '-s', path.resolve(home, 'src'),
      '-t', path.resolve(home, 'target'),
    ].join(' '));

    assert(result.status !== 0, 'Lint should fail with invalid version');
    const output = result.stderr || result.stdout || result.error;
    assert(
      output.includes('is not available'),
      `Should validate version for lint command. Got: ${output}`
    );
  });
});
