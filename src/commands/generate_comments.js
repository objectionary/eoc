/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const {FakeListChatModel} = require('@langchain/core/utils/testing');
const {PromptTemplate} = require('@langchain/core/prompts');
const {RunnableSequence} = require('@langchain/core/runnables');
const {StringOutputParser} = require('@langchain/core/output_parsers');
const {readFileSync, writeFileSync} = require('fs');
// eslint-disable-next-line no-unused-vars
const {BaseChatModel} = require('@langchain/core/language_models/chat_models');

/**
 * Construct LLM chat model based on provider specified in cli options
 *
 * @param {Object} opts - All options
 * @return {BaseChatModel} Constructed model
 */
function makeModel(opts) {
  switch (opts.provider) {
  case 'placeholder':
    const model = new FakeListChatModel({
      responses: ['<PLACEHOLDER_RESPONSE>'],
    });
    return model;
  default:
    throw new Error(
      `\`${opts.provider}\` provider is not supported. ` +
        `Currently supported providers are: \`placeholder\``);
  }
}

/**
 * Escape string to allow usage in regexp expressions to search for this exact string.
 * Based on {@link https://stackoverflow.com/a/6969486|this answer}
 *
 * @param {String} string - Unescaped string
 * @return {String} Escaped string
 */
function escapeRegExp(string) {
  // $& means the whole matched string
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Command to auto-complete EO documentation from .EO sources.
 *
 * @param {Object} opts - All options
 * @return {Promise} of documentation generation task
 */
module.exports = async function(opts) {
  const model = makeModel(opts);
  const prompt = new PromptTemplate({
    template: readFileSync(opts.prompt_template, 'utf-8'),
    inputVariables: ['code'],
  });

  const chain = RunnableSequence.from([
    prompt,
    model,
    new StringOutputParser(),
  ]);

  const inputCode = readFileSync(opts.source, 'utf-8');
  const commentPlaceholder = opts.comment_placeholder;

  const results = [];
  const commentPlaceholderRegex = new RegExp(escapeRegExp(commentPlaceholder), 'g');
  const allLocationsOfPlaceholderInInputCode =
    Array.from(inputCode.matchAll(commentPlaceholderRegex));

  let index = 0;

  for (const location of allLocationsOfPlaceholderInInputCode) {
    const codeBefore = inputCode.slice(0, location.index);
    const replacedCodeBefore = codeBefore.replace(commentPlaceholderRegex, '');

    const codeAfter = inputCode.slice(location.index + commentPlaceholder.length);
    const replacedCodeAfter = codeAfter.replace(commentPlaceholderRegex, '');

    const focusedInputCode = replacedCodeBefore + commentPlaceholder + replacedCodeAfter;

    console.debug(
      `Generating documentation... ${index}/${allLocationsOfPlaceholderInInputCode.length}`);

    const result = await chain.invoke({code: focusedInputCode});

    results.push(result);
    index++;
  }

  writeFileSync(opts.output, JSON.stringify(results));
};
