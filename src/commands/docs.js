/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2022-2025 Objectionary.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
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
  /*try {
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
  }*/
  const filePath = path.resolve('eodocs.html');
  fs.writeFileSync(filePath, '');
};