const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const readline = require('readline');
const fetch = require('node-fetch');

module.exports = function(opts) {
  return new Promise((resolve, reject) => {
    const mvnDir = path.join(process.cwd(), 'mvnw');

    console.info('Building EO inspect server with Maven...');

    const mvnCmd = os.platform() === 'win32' ? 'mvn.cmd' : 'mvn';

    const mvn = spawn(mvnCmd, [
      'clean',
      'package',
      'dependency:copy-dependencies',
      '-Deo.targetDir=target',
      '-DoutputDirectory=target/lib',
    ], {
      cwd: mvnDir,
      stdio: 'inherit',
    });

    mvn.on('close', (code) => {
      if (code !== 0) {
        reject(new Error('Maven build failed'));
        return;
      }

      const isWindows = os.platform() === 'win32';
      const sep = isWindows ? ';' : ':';
      const classpath = [
        path.join(mvnDir, 'target', 'classes'),
        path.join(mvnDir, 'target', 'lib', '*'),
      ].join(sep);

      console.info('Starting EO inspect server...');
      const server = spawn('java', ['-cp', classpath, 'org.eolang.Inspect'], {
        cwd: mvnDir,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      server.stdout.setEncoding('utf8');
      server.stderr.setEncoding('utf8');

      server.stdout.on('data', (data) => {
        console.log(`[SERVER] ${data}`);
      });

      server.stderr.on('data', (data) => {
        console.error(`[SERVER ERROR] ${data}`);
      });

      setTimeout(() => {
        console.info('EO inspect server started.');

        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
          terminal: true
        });

        const ask = (query) => new Promise(res => rl.question(query, res));

        (async () => {
          try {
            while (true) {
              const input = await ask('Enter text (or type "exit" to quit): ');
              if (input.trim().toLowerCase() === 'exit') {
                console.info('Exiting...');
                server.kill();
                rl.close();
                resolve();
                break;
              }

              console.log('Sending request with body:', input);

              try {
                const response = await fetch('http://localhost:8080/echo', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'text/plain; charset=utf-8'
                  },
                  body: input,
                });

                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }

                const reply = await response.text();
                console.log('Server responded:', reply);
              } catch (err) {
                console.error('Request failed:', err.message);
              }
            }
          } catch (e) {
            rl.close();
            server.kill();
            reject(e);
          }
        })();

      }, 2000);

      server.on('close', (code) => {
        console.info(`Server stopped with code ${code}`);
      });
    });

    mvn.on('error', (err) => reject(err));
  });
};