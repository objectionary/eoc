const {spawn} = require('child_process');
const assert = require('assert');

describe('inspect', function() {
  it('should handle the "exit" command', function(done) {
    const process = spawn('node', ['src/eoc.js', 'inspect']);

    let stdout = '';
    process.stdout.on('data', (data) => {
      stdout += data.toString();

      if (stdout.includes('inspect>')) {
        process.stdin.write('exit\n');
      }

      if (stdout.includes('Exiting inspect mode...')) {
        assert(
          stdout.includes('Exiting inspect mode...'),
          `Expected "Exiting inspect mode..." but got: ${stdout}`
        );
        process.kill();
        done();
      }
    });

    process.on('error', (err) => {
      done(err);
    });
  });

  it('should handle unknown commands', function(done) {
    const process = spawn('node', ['src/eoc.js', 'inspect']);

    let stdout = '';
    process.stdout.on('data', (data) => {
      stdout += data.toString();

      if (stdout.includes('inspect>')) {
        process.stdin.write('unknown\n');
      }

      if (stdout.includes('Sorry, this command is under development 🚧')) {
        assert(
          stdout.includes('Sorry, this command is under development 🚧'),
          `Expected "Sorry, this command is under development 🚧" but got: ${stdout}`
        );
        process.kill();
        done();
      }
    });

    process.on('error', (err) => {
      done(err);
    });
  });
});
