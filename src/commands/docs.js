/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs');
const path = require('path');

/**
 * Recursively reads all .xmir files from a directory.
 * @param {string} dir - Directory path
 * @return {string[]} Array of file paths
 */
function readxmirsRecursively(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, {withFileTypes: true});
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...readxmirsRecursively(full));
    } else if (entry.name.endsWith('.xmir')) {
      files.push(full);
    }
  }
  return files;
}

/**
 * Command to generate documentation.
 * @param {Hash} opts - All options
 */
module.exports = function(opts) {
  try {
    const input = path.resolve(opts.target, '.eoc', '1-parse');
    const output = path.resolve(opts.target, 'docs');
    fs.mkdirSync(output, {recursive: true});
    const xmirs = readxmirsRecursively(input);
    for (const xmir of xmirs) {
      const relative = path.relative(input, xmir);
      const packages = path.dirname(relative).split(path.sep).join('.');
      const output = path.join(output, `package_${packages}.html`);
      fs.mkdirSync(path.dirname(output), {recursive: true});
      fs.writeFileSync(output, '');
    }
    const packages = path.join(output, 'packages.html');
    fs.writeFileSync(packages, '');
    const css = path.join(output, 'styles.css');
    fs.writeFileSync(css, '');
    console.info('Documentation generation completed in %s directory', output);
  } catch (error) {
    console.error('Error generating documentation:', error);
    throw error;
  }
};
