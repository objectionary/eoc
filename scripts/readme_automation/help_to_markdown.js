#!/usr/bin/env node
/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

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
  return readMeContent.replace(regex, `$1\n${newContent}\n$3`);
}

function bulletListTemplate(rows)
{
  const list = rows.map(([cmd, desc]) => `* \`${cmd}\`  ${desc}`);
  return `${list.join("\n")  }\n`;
}

function parseBlock(block_name,text) {
  const lines = text.split("\n");
  let inBlock = false;
  const rows = [];
  for (const line of lines) {
    if (line.trim() === block_name) {
      inBlock = true;
    }
    else if (inBlock) {
      if (!line.trim()) {break;}
      const parts = line.trim().split(/\s{2,}/);
      const cmd = parts[0];
      const desc = parts.slice(1).join(" ") || "";
      rows.push([cmd, desc]);
    }
  }
  if (!rows.length)
  {
    throw new Error('no data something wrong');
  }
  return rows;
}

module.exports = {
  parseBlock, bulletListTemplate, updateSection
};

