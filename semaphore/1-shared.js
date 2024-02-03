'use strict';

const thread = require('node:worker_threads');
const { Worker } = thread;

if (thread.isMainThread) {
  const buffer = new SharedArrayBuffer(10);
  new Worker(__filename, { workerData: buffer });
  new Worker(__filename, { workerData: buffer });
} else {
  const { threadId, workerData } = thread;
  const array = new Int8Array(workerData);
  const value = threadId === 1 ? 1 : -1;
  setInterval(() => {
    for (let i = 0; i < 10; i++) {
      array[i] += value;
    }
    console.dir([threadId, array]);
  }, 100);
}
