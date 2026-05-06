#!/usr/bin/env node
/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const { commandsDescription } = require("../src/eoc");

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function updateSection(sectionName, newContent, readMeContent) {
  const start = `<!-- BEGIN ${sectionName.toUpperCase()} SECTION -->`;
  const end = `<!-- END ${sectionName.toUpperCase()} SECTION -->`;
  const regex = new RegExp(
    `(${escapeRegex(start)})([\\s\\S]*?)(${escapeRegex(end)})`,
    "g"
  );
  return readMeContent.replace(regex, `$1\n${newContent}$3`);
}

function bulletListTemplate(rows) {
  return `${rows.map(([cmd, desc]) => `* \`${cmd}\` ${desc}`).join("\n")  }\n`;
}

function modifyReadme(commands,fs) {
  assert.ok(commands.length > 0,'Commands should have rows')
  const commandsMarkdown = bulletListTemplate(commands);
  assert.ok(commandsMarkdown.length > 0,"commandsMarkdown result should have text")
  let readMeContent = fs.readFileSync('README.md', "utf8");
  assert.ok(readMeContent.length > 0,"readMeContent should have text")
  readMeContent = updateSection('commands', commandsMarkdown, readMeContent);
  assert.ok(readMeContent.length > 0,"readMeContent should sill have text after modification")
  fs.writeFileSync('README.md',readMeContent);
}

function syncCommandsToReadme(fs)
{
  modifyReadme(commandsDescription(),fs);
}

module.exports = {
  bulletListTemplate, updateSection, modifyReadme, syncCommandsToReadme
};

if (require.main === module) {
  syncCommandsToReadme(require("fs"));
};
