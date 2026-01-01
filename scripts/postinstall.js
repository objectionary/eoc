#!/usr/bin/env node

/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

/**
 * Conditional postinstall script that only runs patch-package in development.
 * This prevents patch-package from running during production installs where
 * devDependencies (like grunt-mocha-cli) are not available.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const gruntMochaCli = path.join(__dirname, '..', 'node_modules', 'grunt-mocha-cli');

function findPatchPackage() {
  const binDir = path.join(__dirname, '..', 'node_modules', '.bin');
  if (process.platform === 'win32') {
    const cmdFile = path.join(binDir, 'patch-package.cmd');
    if (fs.existsSync(cmdFile)) {
      return cmdFile;
    }
  }
  const binFile = path.join(binDir, 'patch-package');
  if (fs.existsSync(binFile)) {
    return binFile;
  }
  return null;
}

const patchPackageBin = findPatchPackage();

if (fs.existsSync(gruntMochaCli) && patchPackageBin) {
  console.log('Development environment detected, running patch-package...');
  const spawnOptions = {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  };
  const child = spawn(patchPackageBin, [], spawnOptions);
  child.on('exit', (code) => {
    process.exit(code);
  });
  child.on('error', (err) => {
    console.error('Failed to execute patch-package:', err);
    process.exit(1);
  });
} else {
  console.log('Production environment detected, skipping patch-package.');
}
