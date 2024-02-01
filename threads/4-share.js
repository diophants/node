'use strict';

const thread = require('node:worker_threads');
const { Worker } = thread;

const buffer = new SharedArrayBuffer(1024);
const array = new Int8Array(buffer);

const worker = new Worker('./4-access.js', { workerData: buffer });

worker.on('message', (msg) => {
  if (msg.name === 'display') console.log(array[0]);
});

process.on('SIGTERM', () => {
  worker.terminate();
  console.log('Terminate');
});
