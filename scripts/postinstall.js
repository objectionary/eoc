#!/usr/bin/env node

/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
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

// Check if we're in a development environment by checking if devDependencies are installed
const gruntMochaCli = path.join(__dirname, '..', 'node_modules', 'grunt-mocha-cli');
const patchPackageBin = path.join(__dirname, '..', 'node_modules', '.bin', 'patch-package');

if (fs.existsSync(gruntMochaCli) && fs.existsSync(patchPackageBin)) {
  console.log('Development environment detected, running patch-package...');
  const child = spawn(patchPackageBin, [], { stdio: 'inherit' });
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