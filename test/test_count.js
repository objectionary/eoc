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

const assert = require('assert');
const mock = require('mock-fs');
const {count} = require('../src/mvnw.js');
const fs = require('fs');
const path = require('path');

describe('count', function() {
  beforeEach(() => {
    mock({
      'mainDir': {
        'testDir': {
          'file1.txt': 'content1',
          'folder1': {
            'file2.txt': 'content2',
            'folder2': {
              'file3.txt': 'content3',
              'folder3': {
                'file4.txt': 'content4'
              }
            }
          },
          'folder4': {
            'file5.txt': 'content5'
          }
        },
        'flatDir': {
          'file1.txt': 'content1',
          'file2.txt': 'content2'
        }
      }
    });
  });

  afterEach(() => {
    mock.restore();
  });

  it('counts all files in a directory tree', () => {
    const result = count('mainDir', 0);
    assert.strictEqual(result, 7, `Expected to find 5 files, but found ${result}`);
  });
  it('returns 0 for an empty directory', () => {
    mock({'emptyDir': {}}); // Пустая директория
    const result = count('emptyDir', 0);
    assert.strictEqual(result, 0, `Expected to find 0 files, but found ${result}`);
  });
  it('handles files being deleted during count', async () => {
    await fs.promises.unlink(path.join('mainDir', 'testDir', 'folder1', 'file2.txt'));
    await fs.promises.unlink(path.join('mainDir', 'flatDir', 'file1.txt'));

    const result = count('mainDir', 0);
    assert.ok(
      result === 5,
      `Expected to find 5 files (handling deletion), but found ${result}`
    );
  });
});
