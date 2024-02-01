'use strict';

const thread = require('node:worker_threads');
const { Worker } = thread;

const workerData = { text: 'Create http server' };

const worker = new Worker('./3-http.js', { workerData });

worker.on('message', (msg) => {
  if (msg.name === 'started') {
    console.log(`Server is running ${msg.port}`);
  }
});

process.on('SIGTERM', () => {
  worker.terminate();
  console.log('Terminate');
});
