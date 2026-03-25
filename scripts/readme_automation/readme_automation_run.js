#!/usr/bin/env node
/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const fs = require("fs");
const assert = require('assert');
const { parseBlock, bulletListTemplate, updateSection } = require("./help_to_markdown");
const { getHelp } = require("../../src/eoc");

function main (){
  let help_text = getHelp();
  help_text = help_text.replace(/\r\n/g, "\n");
  assert.ok(["Options:","Commands:"].every(sub => help_text.includes(sub)),'"eoc --help" should includes Commands and Options');
  const commands = parseBlock('Commands:',help_text);
  assert.ok(commands.length > 0,'Commands should have rows')
  const commandsMarkdown = bulletListTemplate(commands);
  assert.ok(commandsMarkdown.length > 0,"commandsMarkdown result should have text")
  let readMeContent = fs.readFileSync('README.md', "utf8");
  assert.ok(readMeContent.length > 0,"readMeContent should have text")
  readMeContent = updateSection('commands', commandsMarkdown, readMeContent);
  assert.ok(readMeContent.length > 0,"readMeContent should sill have text after modification")
  fs.writeFileSync('README.md',readMeContent);
}

if (require.main === module) {
  main();
};
