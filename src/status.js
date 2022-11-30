/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2022 Yegor Bugayenko
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const path = require('path');
const fs = require('fs');
const readline = require('readline');

module.exports = {
    start: start,
    stop: stop,
};

var running = false;
var phase = "unknown";
var beginning;
var target;

function start(stage, dir){
  running = true;
  phase = stage;
  target = dir;
  beginning = Date.now();
  var check = function(){
    if(running){
       print();
       setTimeout(check, 200);
    }
  }
  check();
}

function stop(){
  running = false;
  process.stdout.write("\n");
}

function print(){
    readline.clearLine(process.stdout);
    readline.cursorTo(process.stdout, 0);
    process.stdout.write("[" +phase + "] Total number of compiled files " + count(target, 0) + ". Stage duration " + (Date.now() - beginning) + " ms");
}

function count(dir, curr){
    if(fs.existsSync(dir)) {
        for (const f of fs.readdirSync(dir)) {
            next = path.join(dir, f);
            if(fs.statSync(next).isDirectory()){
               curr = count(next, curr);
            } else {
               curr++;
            }
        }
    }
    return curr;
}