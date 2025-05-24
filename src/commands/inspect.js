/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const readline = require('readline');
const fetch = require('node-fetch');

module.exports = function(opts) {
  return new Promise((resolve, reject) => {
    const mvnDir = path.join(process.cwd(), 'mvnw');
    console.info('Building EO inspect server with Maven...');

    const mvn = spawn(os.platform() === 'win32' ? 'mvn.cmd' : 'mvn', [
      'clean', 'package', 'dependency:copy-dependencies',
      '-Deo.targetDir=target', '-DoutputDirectory=target/lib'
    ], { cwd: mvnDir, stdio: 'inherit' });

    mvn.on('close', (code) => {
      if (code !== 0) {return reject(new Error('Maven build failed'));}

      const server = spawn('java', [
        '-cp',
        [
          path.join(mvnDir, 'target', 'classes'),
          path.join(mvnDir, 'target', 'lib', '*')
        ].join(os.platform() === 'win32' ? ';' : ':'),
        'org.eolang.Inspect'
      ], { cwd: mvnDir, stdio: ['pipe', 'pipe', 'pipe'] });

      server.stdout.setEncoding('utf8').on('data', d => console.log(`[SERVER] ${d}`));
      server.stderr.setEncoding('utf8').on('data', d => console.error(`[SERVER ERROR] ${d}`));

      setTimeout(() => {
        console.info('EO inspect server started.');
        const rl = readline.createInterface({
          input: (opts && opts.stdin) || process.stdin,
          output: (opts && opts.stdout) || process.stdout,
          terminal: true
        });

        const ask = (q) => new Promise(res => rl.question(q, res));

        const processInput = async () => {
          const input = await ask('Enter text (or type "exit" to quit): ');
          if (input.trim().toLowerCase() === 'exit') {
            rl.close();
            server.kill();
            return resolve();
          }

          console.log('Sending request with body:', input);
          try {
            const response = await fetch('http://localhost:8080/echo', {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain; charset=utf-8' },
              body: input
            });
            console.log('Server responded:', await response.text());
          } catch (err) {
            console.error('Request failed:', err.message);
          }
          processInput();
        };

        processInput();
      }, 2000);

      server.on('close', code => console.info(`Server stopped with code ${code}`));
    });

    mvn.on('error', reject);
  });
};