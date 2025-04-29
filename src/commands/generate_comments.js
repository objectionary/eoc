/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const {FakeListChatModel} = require('@langchain/core/utils/testing');
const {PromptTemplate} = require('@langchain/core/prompts');
const {RunnableSequence} = require('@langchain/core/runnables');
const {StringOutputParser} = require('@langchain/core/output_parsers');
const {readFileSync, writeFileSync} = require('fs');
const {BaseChatModel} = require('@langchain/core/language_models/chat_models');
const {ChatOpenAI} = require('@langchain/openai');

/**
 * Construct LLM chat model based on provider specified in cli options
 *
 * @param {Object} opts - All options
 * @return {BaseChatModel} Constructed model
 */
function makeModel(opts) {
  switch (opts.provider) {
    case 'placeholder':
      return new FakeListChatModel({
        responses: ['<PLACEHOLDER_RESPONSE>'],
      });
    case 'openai':
      return new ChatOpenAI({
        model: opts.openai_model,
        configuration: {
          baseURL: opts.openai_url,
          apiKey: opts.openai_token,
        },
      });
    default:
      throw new Error(
        `\`${opts.provider}\` provider is not supported. ` +
        `Currently supported providers are: \`openai\`, \`placeholder\``);
  }
}

/**
 * Construct Langchain LLM pipeline based on given cli options
 *
 * @param {Object} opts - All options
 * @return {RunnableSequence}
 */
function constructChain(opts) {
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
  return chain;
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
 * Focus on specific comment placeholder in the text
 * by removing all other placeholders from it
 *
 * @param {String} inputCode - Code to replace placeholders in
 * @param {Number} location of beggining of the placeholder that is being focused on
 * @param {String} commentPlaceholder
 * @param {RegExp} commentPlaceholderRegex - regexp matching placeholders
 * @return {String}
 */
function getTextFocusedOnSpecificPlaceholder(
  inputCode, 
  location, 
  commentPlaceholder, 
  commentPlaceholderRegex) {
  const codeBefore = inputCode.slice(0, location.index);
  const replacedCodeBefore = codeBefore.replace(commentPlaceholderRegex, '');
  const codeAfter = inputCode.slice(location.index + commentPlaceholder.length);
  const replacedCodeAfter = codeAfter.replace(commentPlaceholderRegex, '');
  return replacedCodeBefore + commentPlaceholder + replacedCodeAfter;
}

/**
 * Generates documentation with LLMs to replace placeholders in the text
 *
 * @param {String} inputCode - Code to replace placeholders in
 * @param {String} commentPlaceholder - Placeholder to replace
 * @param {RunnableSequence} chain - Langchain LLM pipeline
 * @return {Promise<Array.<String>>} of ordered LLM outputs (one for each placeholder in the input)
 */
function generateDocumentationForPlaceholders(
  inputCode, 
  commentPlaceholder, 
  chain) {
  const commentPlaceholderRegex = new RegExp(escapeRegExp(commentPlaceholder), 'g');
  const allLocationsOfPlaceholderInInputCode = Array.from(inputCode.matchAll(commentPlaceholderRegex));
  return Promise.all(allLocationsOfPlaceholderInInputCode.map((location) => {
    const focusedInputCode = getTextFocusedOnSpecificPlaceholder(inputCode, location, commentPlaceholder, commentPlaceholderRegex);
    return chain.invoke({ code: focusedInputCode });
  }));
}

/**
 * Command to auto-complete EO documentation from .EO sources.
 *
 * @param {Object} opts - All options
 * @return {Promise} of documentation generation task
 */
module.exports = async function(opts) {
  const chain = constructChain(opts);
  const inputCode = readFileSync(opts.source, 'utf-8');
  const commentPlaceholder = opts.comment_placeholder;
  const results = await generateDocumentationForPlaceholders(
    inputCode,
    commentPlaceholder,
    chain);
  writeFileSync(opts.output, JSON.stringify(results));
};
