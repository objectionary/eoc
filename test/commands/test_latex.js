/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {runSync, parserVersion, homeTag, weAreOnline} = require('../helpers');

describe('latex', () => {
  before(weAreOnline);
  it('generates LaTeX files from a simple .EO program', function (done) {
    this.skip();
    const home = path.resolve('temp/test-latex/simple');
    const target = path.resolve(home, 'target');
    const source = path.resolve(home, 'src');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(source, {recursive: true});
    fs.writeFileSync(path.resolve(source, 'simple.eo'), '# sample\n[] > simple\n');
    runSync([
      'latex',
      '--verbose',
      '--easy',
      `--parser=${parserVersion}`,
      `--home-tag=${homeTag}`,
      '-s', source,
      '-t', target,
    ]);
    assert(fs.existsSync(path.resolve(target, 'latex/simple.tex')));
    const texContent = fs.readFileSync(path.resolve(target, 'latex/simple.tex'), 'utf8');
    assert(texContent.includes('\\documentclass{article}'));
    assert(texContent.includes('\\usepackage{ffcode}'));
    assert(texContent.includes('\\begin{document}'));
    assert(texContent.includes('\\begin{ffcode}'));
    assert(texContent.includes('# sample'));
    assert(texContent.includes('[] > simple'), texContent);
    assert(texContent.includes('\\end{ffcode}'));
    assert(texContent.includes('\\end{document}'));
    done();
  });
});
