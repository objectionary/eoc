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

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { runSync, assertFilesExist } = require('../helpers');

describe('generate_comments', function() {
  it('throws error on unknown provider', function(done) {
    const home = makeHome();
    const exampleInput = `<COMMENT-TO-BE-ADDED>`;

    assert.throws(() =>
      runSync([
        'generate_comments',
        '--provider=nonexisting',
        `--prompt_template=${makePromptFile(home, "")}`,
        `--source=${makeInputFile(home, exampleInput)}`]),
      error => error.message.includes('`nonexisting` provider is not supported.'));
    done();
  });
  it('fills output depending on the number of placeholders in the input code', function(done) {
    const home = makeHome();

    for (numberOfPlaceholders = 0; numberOfPlaceholders < 3; ++numberOfPlaceholders) {
      const exampleInput =
        "# <COMMENT-TO-BE-ADDED>\n".repeat(numberOfPlaceholders);
      const outputFilePath = path.resolve(home, 'out.json');
      const stdout = runSync([
        'generate_comments',
        '--provider=placeholder',
        `--prompt_template=${makePromptFile(home, "")}`,
        `--source=${makeInputFile(home, exampleInput)}`,
        `--output=${outputFilePath}`]);
      assertFilesExist(stdout, home, [outputFilePath]);

      const fileContents = JSON.parse(fs.readFileSync(outputFilePath));
      const expectedContents = Array(numberOfPlaceholders).fill("<PLACEHOLDER_RESPONSE>");
      assert.deepStrictEqual(
        fileContents,
        expectedContents,
        `Expected ${outputFilePath} to be ${JSON.stringify(expectedContents)}, but found ${JSON.stringify(fileContents)}`
      );
    }

    done();
  });
});

function makeInputFile(home, code) {
  return ensureFileWithContent(home, 'input.eo', code)
}

function makePromptFile(home, prompt) {
  return ensureFileWithContent(home, 'prompt_template.txt', prompt)
}

function ensureFileWithContent(home, filePath, content) {
  const resolvedFilePath = path.resolve(home, filePath);
  fs.rmSync(resolvedFilePath, { recursive: true, force: true });
  fs.writeFileSync(resolvedFilePath, content);
  return resolvedFilePath;
}

function makeHome() {
  const home = path.resolve('temp/test-generate-comments/simple');
  fs.rmSync(home, { recursive: true, force: true });
  fs.mkdirSync(path.resolve(home, 'src'), { recursive: true });
  return home;
}
