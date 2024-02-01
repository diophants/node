'use strict';

const thread = require('node:worker_threads');
const { Worker } = thread;

const buffer = new SharedArrayBuffer(1024);

new Worker('./5-access.js', { workerData: { buffer } });

setInterval(() => {
  console.log(buffer);
}, 100);
