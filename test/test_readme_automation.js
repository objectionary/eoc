/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require("assert");
const path = require("path");
const { updateSection, bulletListTemplate, modifyReadme, syncCommandsToReadme} = require(path.join(__dirname, "../scripts/readme_automation.js"));

const readme = `before\n<!-- BEGIN COMMANDS SECTION -->\nold content\n<!-- END COMMANDS SECTION -->\n<!-- BEGIN OPTIONS SECTION -->\nkeep\n<!-- END OPTIONS SECTION -->\nafter`
const commandsList = [['one','a'],['two','b'],['three','c']];
const keywords = ["keep","after","before","<!-- BEGIN COMMANDS SECTION -->","<!-- END COMMANDS SECTION -->"];
const fsMockProto = {readMeContent:null, readFileSync(path,options){ return readme; }, writeFileSync(path,data){ this.readMeContent = data; }};


describe("readme_automation scripts", () => {
  it("updateSection replaces only the requested section", () => {
    const readmeUpdated = updateSection("commands", "new content", readme);
    assert.ok(!readmeUpdated.includes("old content"),"Update README should no have 'old content'");
    assert.ok(keywords.every(sub => readmeUpdated.includes(sub)),"Update README should have all keywords");
    assert.ok(readmeUpdated.includes("new content"),"Update README should have `new content`");
  });
  it("bulletListTemplate renders a list", async () => {
    const bulletListMarkdown = bulletListTemplate(commandsList);
    assert.strictEqual(bulletListMarkdown, "* `one` a\n* `two` b\n* `three` c\n");
  });
  it("call modifyReadme with fs mock", async () => {
    const fsMock = {...fsMockProto};
    modifyReadme(commandsList,fsMock);
    assert.notEqual(fsMock.readMeContent,null,"README file should have some content");
    assert.ok(!fsMock.readMeContent.includes("old content"),"README file should no have 'old content'");
    assert.ok(keywords.every(sub => fsMock.readMeContent.includes(sub)),"README file should have all keywords");
    assert.ok(["* `one` a","* `two` b","* `three` c"].every(sub => fsMock.readMeContent.includes(sub)));
  });
  it("test the whole workflow with fs mock", async () => {
    const fsMock = {...fsMockProto};
    syncCommandsToReadme(fsMock);
    assert.notEqual(fsMock.readMeContent,null,"README file should have some content");
  });
});
