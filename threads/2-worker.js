'use strict';

const thread = require('node:worker_threads');

console.log({ worker: thread });

thread.parentPort.postMessage('Hello there');
thread.parentPort.on('message', (...args) => {
  console.log(...args);
});

process.exit(0);
