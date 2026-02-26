/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const parse = require('./parse');
const print = require('./print');

module.exports = async function normalize(opts) {
  const target = path.resolve(opts.target || '.');
  const eocDir = path.join(target, '.eoc');
  const normalizedDir = path.join(eocDir, 'normalized');

  if (!fs.existsSync(eocDir)) {
    throw new Error(`No .eoc/ directory found at ${eocDir}. Run "eoc parse" first.`);
  }

  // Step 1: parse EO files to XMIR
  await parse({ target });

  // Step 2: make sure .eoc/normalized exists
  if (!fs.existsSync(normalizedDir)) {
    fs.mkdirSync(normalizedDir, { recursive: true });
  }

  // Step 3: process all .xmir files
  const files = fs.readdirSync(eocDir).filter(f => f.endsWith('.xmir'));
  for (const file of files) {
    const base = path.basename(file, '.xmir');
    const inputXmir = path.join(eocDir, file);
    const phi = path.join(eocDir, `${base}.phi`);
    const normalizedPhi = path.join(eocDir, `${base}.norm.phi`);
    const normalizedXmir = path.join(normalizedDir, `${base}.xmir`);

    // xmir -> phi
    runPhino(['translate', inputXmir], phi);

    // phi -> normalized.phi
    runPhino(['rewrite', '--normalize', phi], normalizedPhi);

    // normalized.phi -> xmir
    runPhino(['translate', '--reverse', normalizedPhi], normalizedXmir);
  }

  // Step 4: print .xmir -> .eo
  await print({
    target,
    printInput: '.eoc/normalized',
    printOutput: '.eoc/normalized'
  });

  console.info(`Normalized EO sources saved to ${path.relative(process.cwd(), normalizedDir)}`);
};

function runPhino(args, outputFilePath) {
  const phinoJar = path.resolve(__dirname, '../../phino.jar'); // ← путь до JAR-файла Phino
  const javaArgs = ['-jar', phinoJar].concat(args);
  const result = spawnSync('java', javaArgs, { encoding: 'utf-8' });

  if (result.status !== 0) {
    throw new Error(`Phino failed:\n${result.stderr}`);
  }

  fs.writeFileSync(outputFilePath, result.stdout);
}
