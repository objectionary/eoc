/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {spawn} = require('child_process');

describe('package installation', () => {
  const testDir = path.resolve('temp/test-package-install');
  
  beforeEach(() => {
    fs.rmSync(testDir, {recursive: true, force: true});
    fs.mkdirSync(testDir, {recursive: true});
  });

  /**
   * Tests that the postinstall script correctly detects production environment.
   * This verifies that the fix for issue #568 works correctly.
   * @param {Mocha.Done} done - Mocha callback signaling asynchronous completion
   */
  it('postinstall script skips patch-package in production environment', (done) => {
    // Create a fake production environment (no grunt-mocha-cli)
    const fakeNodeModules = path.join(testDir, 'node_modules');
    fs.mkdirSync(fakeNodeModules, {recursive: true});
    
    // Copy the postinstall script to the test directory
    const postinstallScript = path.join(testDir, 'postinstall.js');
    fs.copyFileSync(path.resolve('scripts/postinstall.js'), postinstallScript);
    
    // Run the postinstall script
    const scriptProcess = spawn('node', [postinstallScript], {
      cwd: testDir,
      stdio: ['inherit', 'pipe', 'pipe']
    });

    let output = '';
    let error = '';
    
    scriptProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    scriptProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    scriptProcess.on('exit', (code) => {
      assert.strictEqual(code, 0, `Script should exit successfully. stdout: ${output}, stderr: ${error}`);
      assert(output.includes('Production environment detected, skipping patch-package.'), 
             `Should detect production environment. Output: ${output}`);
      done();
    });
  });
});