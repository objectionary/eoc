/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require("assert");
const path = require("path");
const { parseBlock, updateSection, bulletListTemplate } = require(path.join(__dirname, "../scripts/readme_automation/help_to_markdown.js"));

describe("readme_automation scripts", () => {
  it("parseBlock builds a markdown table from a help block", () => {
    const text = `\nUsage: eoc [options] [command]\nCommands:\n  foo   does foo\n  bar   does bar\n\nOptions:\n  -h, --help  output help`;
    const res = parseBlock("Commands:", text);
    assert.deepEqual(res,[['foo','does foo'],['bar','does bar']]);
    const res2 = parseBlock("Options:", text);
    assert.deepEqual(res2,[['-h, --help','output help']] );
  });
  it("parseBlock throws when no rows are found", () => {
    assert.throws(
      () => parseBlock("Commands:", ""),
      /no data/
    );
  });
  it("updateSection replaces only the requested section", () => {
    const readme = `before\n<!-- BEGIN COMMANDS SECTION -->\nold\n<!-- END COMMANDS SECTION -->\n<!-- BEGIN OPTIONS SECTION -->\nkeep\n<!-- END OPTIONS SECTION -->\nafter`
    const updated = updateSection("commands", "new content", readme);
    assert.ok(!updated.includes("old"));
    assert.ok(["new content","keep","after","before","<!-- BEGIN COMMANDS SECTION -->"].every(sub => updated.includes(sub)));
  });
  it("bulletListTemplate renders a list", async () => {
    const output = bulletListTemplate([['one','a'],['two','b'],['three','c']]);
    assert.strictEqual(output, "* `one`  a\n* `two`  b\n* `three`  c\n");
  });
});
