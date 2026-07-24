/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const version = require('../src/version');
const {runSync, weAreOnline} = require('./helpers');

describe('eoc', () => {
  it('prints its own version', (done) => {
    const stdout = runSync(['--version']);
    assert.equal(`${version.what  }\n`, stdout);
    done();
  });
  it('prints help screen', (done) => {
    const stdout = runSync(['--help']);
    assert(stdout.includes('Usage: eoc'));
    assert(stdout.includes(version.what));
    assert(stdout.includes(version.when));
    done();
  });
  it('can get commands description from eoc as a module', (done) => {
    const commandsDescriptionList = require('../src/eoc').commandsDescription();
    assert(commandsDescriptionList.length > 0,"commandsDescriptionList should have more then one element");
    assert(commandsDescriptionList[0].length == 2,"commandsDescriptionList element should have 2 values");
    assert(commandsDescriptionList[0][0].length > 0,"First value of commandsDescriptionList element should have non-zero length");
    assert(commandsDescriptionList[0][1].length > 0,"Second value of commandsDescriptionList element should have non-zero length");
    done();
  });
});

describe('eoc', () => {
  before(weAreOnline);
  it('loads latest version', (done) => {
    const stdout = runSync(['--latest', '--version']);
    assert(!stdout.includes('29.0.4'));
    done();
  });
});

describe('eoc', () => {
  const {spawnSync} = require('child_process'),
    path = require('path'),
    eoc = function(...args) {
      return spawnSync('node', [path.resolve('./src/eoc.js'), '--batch', ...args]);
    };
  it('accepts the "js" alias for the --language option', (done) => {
    assert.strictEqual(eoc('--language=js', 'clean').status, 0);
    done();
  });
  it('accepts the full "javascript" name for the --language option', (done) => {
    assert.strictEqual(eoc('--language=javascript', 'clean').status, 0);
    done();
  });
  it('accepts a mixed-case value for the --language option', (done) => {
    assert.strictEqual(eoc('--language=JAVA', 'clean').status, 0);
    done();
  });
  it('rejects an unknown --language value', (done) => {
    const result = eoc('--language=Eiffel', 'clean');
    const stderr = result.stderr.toString();
    assert.notStrictEqual(result.status, 0);
    assert(
      /^error: option '-l, --language <name>' argument 'Eiffel' is invalid\. Unknown platform Eiffel/.test(stderr),
      stderr
    );
    assert(!stderr.includes('at '), stderr);
    assert(!stderr.includes('eoc.js:'), stderr);
    done();
  });
  it('accepts the --lints option', (done) => {
    assert.strictEqual(eoc('--lints=0.0.42', 'clean').status, 0);
    done();
  });
  it('reports a clean error when generate_comments gets an unsupported provider, instead of a raw stack trace', (done) => {
    const result = eoc(
      'generate_comments',
      '--provider=bogus',
      '--source', path.resolve('./src/eoc.js'),
      '--prompt_template', path.resolve('./src/eoc.js')
    );
    const stderr = result.stderr.toString();
    assert.notStrictEqual(result.status, 0);
    assert(!stderr.includes('Node.js v'), stderr);
    assert(!stderr.includes('node:internal/process/promises'), stderr);
    assert(!stderr.includes('at '), stderr);
    assert.strictEqual(
      lastLine(stderr),
      '`bogus` provider is not supported. Currently supported providers are: `openai`, `placeholder`'
    );
    done();
  });
  it('reports a clean error when docs gets a --target that is a file, instead of an unhandled-rejection crash', (done) => {
    const fs = require('fs'),
      os = require('os'),
      home = fs.mkdtempSync(path.join(os.tmpdir(), 'eoc-docs-target-')),
      target = path.join(home, 'notadir');
    fs.writeFileSync(target, '');
    const result = eoc('--target', target, 'docs');
    const stderr = result.stderr.toString();
    assert.notStrictEqual(result.status, 0);
    assert(!stderr.includes('Node.js v'), stderr);
    assert(!stderr.includes('node:internal/process/promises'), stderr);
    assert(/^ENOTDIR: not a directory, mkdir/.test(lastLine(stderr)), stderr);
    done();
  });
});

/**
 * Extract the last non-empty line of a stderr string, stripped of ANSI
 * color codes. This is where the top-level
 * `program.parseAsync(...).catch(...)` block in eoc.js prints a rejected
 * command's clean error message.
 * @param {String} stderr - Raw stderr text
 * @return {String} The last non-empty line
 */
function lastLine(stderr) {
  const esc = String.fromCharCode(27),
    ansi = new RegExp(`${esc}\\[[0-9;]*m`, 'g'),
    lines = stderr.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  return lines[lines.length - 1].replace(ansi, '');
}

describe('canonicalLanguage', () => {
  const {canonicalLanguage} = require('../src/eoc');
  it('canonicalizes the "js" alias', (done) => {
    assert.strictEqual(canonicalLanguage('js'), 'JavaScript');
    done();
  });
  it('canonicalizes the full "javascript" name case-insensitively', (done) => {
    assert.strictEqual(canonicalLanguage('JavaScript'), 'JavaScript');
    done();
  });
  it('canonicalizes a mixed-case "JAVA" value', (done) => {
    assert.strictEqual(canonicalLanguage('JAVA'), 'Java');
    done();
  });
  it('throws InvalidArgumentError for an unknown platform', (done) => {
    assert.throws(
      () => canonicalLanguage('Eiffel'),
      /Unknown platform Eiffel/
    );
    done();
  });
});

describe('select', () => {
  const {select} = require('../src/eoc');
  it('resolves an alias to the canonical registry entry', (done) => {
    assert.strictEqual(select({Java: 'jvm', JavaScript: 'node'}, 'js'), 'node');
    done();
  });
  it('throws for a platform that is not registered', (done) => {
    assert.throws(
      () => select({Java: 'jvm', JavaScript: 'node'}, 'Cobol'),
      /Unknown platform Cobol/
    );
    done();
  });
});

describe('eoc', () => {
  const {spawnSync} = require('child_process');
  const path = require('path');
  const eoc = function(...args) {
    return spawnSync('node', [path.resolve('./src/eoc.js'), '--batch', ...args]);
  };
  it('reports a failing async command cleanly without leaking a stack trace', (done) => {
    const result = eoc(
      'generate_comments', '--provider=no-such-llm',
      '--source=absent.eo', '--prompt_template=absent.txt'
    );
    const stderr = result.stderr.toString();
    assert.notStrictEqual(result.status, 0);
    assert(stderr.includes('`no-such-llm` provider is not supported'), stderr);
    assert(!/\.js:\d+/.test(stderr), stderr);
    done();
  });
  it('reports a filesystem error from an async command without a stack trace', (done) => {
    const result = eoc(
      'generate_comments', '--provider=placeholder',
      '--source=absent.eo', '--prompt_template=absent.txt'
    );
    const stderr = result.stderr.toString();
    assert.notStrictEqual(result.status, 0);
    assert(stderr.includes('no such file or directory'), stderr);
    assert(!/\.js:\d+/.test(stderr), stderr);
    done();
  });
});

describe('eoc', () => {
  const fs = require('fs');
  const os = require('os');
  const path = require('path');
  it('does the work in the directory set by --dir', (done) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'eoc-dir-'));
    fs.mkdirSync(path.join(dir, '.eoc'));
    const stdout = runSync(['--dir', dir, 'clean']);
    assert(
      !fs.existsSync(path.join(dir, '.eoc')),
      `The .eoc directory under --dir was not deleted\n${stdout}`
    );
    done();
  });
});

describe('eoc', () => {
  it('fails when the --dir directory does not exist', (done) => {
    assert.throws(
      () => runSync(['--dir', 'absent-directory-xyz', 'clean']),
      /Cannot switch to the working directory/
    );
    done();
  });
});

describe('eoc', () => {
  before(weAreOnline);
  it('fails due version mismatch if different --pin provided', (done) => {
    assert.throws(
      () => {    runSync(['--pin=29.9.4', 'clean']); },
      /Version mismatch: you are running eoc [0-9]+\.[0-9]+\.[0-9]+, but --pin option requires 29.9.4/
    );
    done();
  });
});

describe('eoc', () => {
  before(weAreOnline);
  it('cleans successfully when versions match with --pin', (done) => {
    const stdout = runSync([`--pin=${version.what}`, 'clean']);
    assert(stdout.includes("The directory .eoc does not exist, no need to delete it"));
    done();
  });
});

describe('eoc', () => {
  before(weAreOnline);
  it('cleans successfully when if --pin not provided', (done) => {
    const stdout = runSync(['clean']);
    assert(stdout.includes("The directory .eoc does not exist, no need to delete it"));
    done();
  });
});

describe('eoc', () => {
  before(weAreOnline);
  it('fails link due to version mismatch if different --pin provided', (done) => {
    assert.throws(
      () => { runSync(['--pin=29.9.4', '--alone', 'link']); },
      /Version mismatch: you are running eoc [0-9]+\.[0-9]+\.[0-9]+, but --pin option requires 29.9.4/
    );
    done();
  });
  it('fails jeo:assemble due to version mismatch if different --pin provided', (done) => {
    assert.throws(
      () => { runSync(['--pin=29.9.4', 'jeo:assemble']); },
      /Version mismatch: you are running eoc [0-9]+\.[0-9]+\.[0-9]+, but --pin option requires 29.9.4/
    );
    done();
  });
});
