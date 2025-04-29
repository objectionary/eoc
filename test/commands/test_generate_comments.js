/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {runSync, assertFilesExist} = require('../helpers');

describe('generate_comments', () => {
  it('throws error on unknown provider', (done) => {
    const home = makeHome();
    const exampleInput = `<COMMENT-TO-BE-ADDED>`;
    assert.throws(() =>
      runSync([
        'generate_comments',
        '--provider=nonexisting',
        `--prompt_template=${makePromptFile(home, '')}`,
        `--source=${makeInputFile(home, exampleInput)}`]),
    (error) => error.message.includes('`nonexisting` provider is not supported.'));
    done();
  });

  it('fills output depending on the number of placeholders in the input code', (done) => {
    const home = makeHome();
    for (numberOfPlaceholders = 0; numberOfPlaceholders < 3; ++numberOfPlaceholders) {
      const exampleInput =
        '# <COMMENT-TO-BE-ADDED>\n'.repeat(numberOfPlaceholders);
      const outputFilePath = path.resolve(home, 'out.json');
      const stdout = runSync([
        'generate_comments',
        '--provider=placeholder',
        `--prompt_template=${makePromptFile(home, '')}`,
        `--source=${makeInputFile(home, exampleInput)}`,
        `--output=${outputFilePath}`]);
      const expectedContents = Array(numberOfPlaceholders).fill('<PLACEHOLDER_RESPONSE>');
      verifyGeneratedOutput(stdout, home, outputFilePath, expectedContents);
    }
    done();
  });

  it('fills output as expected when encountering valid EO code', (done) => {
    const home = makeHome();
    for (numberOfPlaceholders = 0; numberOfPlaceholders < 3; ++numberOfPlaceholders) {
      const exampleInput = [
        '# <STRUCTURE-BELOW-IS-TO-BE-DOCUMENTED>',
        '[args] > simple',
        '  QQ.io.stdout (args.at 0) > @',
        '  # <STRUCTURE-BELOW-IS-TO-BE-DOCUMENTED>',
        '  [] > current-time',
        '    output. > @',
        '      QQ.sys.posix',
        '        "gettimeofday"',
        '        * QQ.sys.posix.timeval'
      ].join('\n');
      const outputFilePath = path.resolve(home, 'out.json');
      const stdout = runSync([
        'generate_comments',
        '--provider=placeholder',
        '--comment_placeholder="<STRUCTURE-BELOW-IS-TO-BE-DOCUMENTED>"',
        `--prompt_template=${makePromptFile(home, '')}`,
        `--source=${makeInputFile(home, exampleInput)}`,
        `--output=${outputFilePath}`]);
      const expectedContents = ['<PLACEHOLDER_RESPONSE>', '<PLACEHOLDER_RESPONSE>'];
      verifyGeneratedOutput(stdout, home, outputFilePath, expectedContents);
    }
    done();
  });
});

/**
 * Assert that the output file exists and contains expected content
 *
 * @param {String} stdout - The stdout printed
 * @param {String} home - Home directory
 * @param {String} outputFilePath - Path to expected output file
 * @param {Object} expectedContents - Expected contents of the output file
 */
function verifyGeneratedOutput(stdout, home, outputFilePath, expectedContents) {
  assertFilesExist(stdout, home, [outputFilePath]);
  const fileContents = JSON.parse(fs.readFileSync(outputFilePath));
  assert.deepStrictEqual(
    fileContents,
    expectedContents,
    `${stdout}\nExpected ${outputFilePath} to be ${JSON.stringify(expectedContents)}, ` +
      `but found ${JSON.stringify(fileContents)}`
  );
}

/**
 * @param {String} home - Home directory
 * @param {String} code - EO code to save
 * @return {String} Path to the file with given content
 */
function makeInputFile(home, code) {
  return ensureFileWithContent(home, 'input.eo', code);
}

/**
 * @param {String} home - Home directory
 * @param {String} prompt - Prompt to save
 * @return {String} Path to the file with given content
 */
function makePromptFile(home, prompt) {
  return ensureFileWithContent(home, 'prompt_template.txt', prompt);
}

/**
 * @param {String} home - Home directory
 * @param {String} filePath - File path relative to home directory
 * @param {String} content - Content to save
 * @return {String} Path to the file with given content
 */
function ensureFileWithContent(home, filePath, content) {
  const resolvedFilePath = path.resolve(home, filePath);
  fs.rmSync(resolvedFilePath, {recursive: true, force: true});
  fs.writeFileSync(resolvedFilePath, content);
  return resolvedFilePath;
}

/**
 * Setup home directory for IO sandboxing
 *
 * @return {String} Path to home directory
 */
function makeHome() {
  const home = path.resolve('temp/test-generate-comments/simple');
  fs.rmSync(home, {recursive: true, force: true});
  fs.mkdirSync(path.resolve(home, 'src'), {recursive: true});
  return home;
}
