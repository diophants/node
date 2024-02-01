'use strict';

const thread = require('node:worker_threads');
const { Worker } = thread;

const workerData = { text: 'Data from Master to Worker' };
const worker = new Worker('./2-worker.js', { workerData });

worker.postMessage('Message from Master to Worker');

worker.on('message', (...args) => {
  console.log(...args);
});
worker.on('error', (err) => {
  console.log({ err });
});
worker.on('exit', (code) => {
  console.log({ code });
});

setTimeout(async () => {
  await worker.terminate();
  console.log('terminate');
}, 1000);
