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

function start(){
  running = true;
  var check = function(){
    if(running){
       print();
       setTimeout(check, 60);
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
    process.stdout.write("[REGISTRATION] Number of files " + count('/Users/lombrozo/Workspace/EOlang/Projects/sum/.eoc', 0));
}

function count(dir, curr){
    var res = curr;
    if(!fs.existsSync(dir)) {
        return 0;
    }
    for (const f of fs.readdirSync(dir)) {
        next = path.join(dir, f);
        if(fs.statSync(next).isDirectory()){
            res = count(next, res);
        } else {
           res++;
        }
    }
    return res;
}