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
function readXmirFilesRecursively(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...readXmirFilesRecursively(fullPath));
    } else if (entry.name.endsWith('.xmir')) {
      files.push(fullPath);
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
    const inputDir = path.resolve(opts.target, '.eoc', '1-parse');
    const outputDir = path.resolve(opts.target, 'docs');

    fs.mkdirSync(outputDir, { recursive: true });

    const xmirFiles = readXmirFilesRecursively(inputDir);

    for (const xmirFile of xmirFiles) {
      const relativePath = path.relative(inputDir, xmirFile);
      const packagePath = path.dirname(relativePath).split(path.sep).join('.');
      const outputPath = path.join(outputDir, `package_${packagePath}.html`);
      
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, '');
    }

    const packagesPath = path.join(outputDir, 'packages.html');
    fs.writeFileSync(packagesPath, '');

    const cssPath = path.join(outputDir, 'styles.css');
    fs.writeFileSync(cssPath, '');

    console.info('Documentation generation completed in %s directory', outputDir);
  } catch (error) {
    console.error('Error generating documentation:', error);
    throw error;
  }
};