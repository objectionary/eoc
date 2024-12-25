/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2022-2024 Objectionary.com
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
 * Command to create docs from .EO sources.
 * This command scans for .xmir files and generates empty HTML files for each package.
 * @param {Object} opts - All options
 */
module.exports = function(opts) {
  const inputDir = './.eoc/1-parse';
  const outputDir = 'docs';

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  /**
   * Recursively reads all .xmir files from directory
   * @param {string} dir - Directory path
   * @returns {string[]} Array of file paths
   */
  function readXmirFilesRecursively(dir) {
    let xmirFiles = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        xmirFiles = xmirFiles.concat(readXmirFilesRecursively(entryPath));
      } else if (entry.isFile() && entry.name.endsWith('.xmir')) {
        xmirFiles.push(entryPath);
      }
    }
    
    return xmirFiles;
  }

  /**
   * Gets package name from file path
   * @param {string} filePath - Path to file
   * @returns {string} Package name
   */
  function getPackageNameFromFilePath(filePath) {
    const relativePath = path.relative(inputDir, filePath);
    const dirName = path.dirname(relativePath);
    if (dirName === '.' || dirName === '') {
      return '';
    }
    return dirName.split(path.sep).join('.');
  }

  /**
   * Creates safe filename for package
   * @param {string} packageName - Package name
   * @returns {string} Safe filename
   */
  function sanitizeFileName(packageName) {
    return `package_${packageName.replace(/[^a-z0-9.]/gi, '_').toLowerCase()}.html`;
  }

  try {
    const argv = ['eo:docs'].concat(flags(opts));
    mvnw(argv, opts.target || '.', opts.batch).then(() => {
      const allFiles = readXmirFilesRecursively(inputDir);

      const packages = new Set();
      allFiles.forEach((filePath) => {
        const packageName = getPackageNameFromFilePath(filePath);
        packages.add(packageName);
      });

      for (const packageName of packages) {
        const fileName = sanitizeFileName(packageName || 'default');
        const outputPath = path.join(outputDir, fileName);

        fs.writeFileSync(outputPath, '');
      }

      const packagesPath = path.join(outputDir, 'packages.html');
      fs.writeFileSync(packagesPath, '');

      const cssPath = path.join(outputDir, 'styles.css');
      fs.writeFileSync(cssPath, '');

      console.info('Documentation generation completed in %s directory', outputDir);
    }).catch((error) => {
      console.error('Error executing Maven command:', error);
    });
  } catch (error) {
    console.error('Error generating documentation:', error);
  }
};