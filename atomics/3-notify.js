'use strict';

const thread = require('node:worker_threads');
const { Worker } = thread;

if (thread.isMainThread) {
  const buffer = new SharedArrayBuffer(40);
  new Worker(__filename, { workerData: buffer });
  new Worker(__filename, { workerData: buffer });
  new Worker(__filename, { workerData: buffer });
} else {
  const { threadId, workerData } = thread;
  const array = new Int32Array(workerData);
  if (threadId === 1) {
    Atomics.store(array, 3, 128);
    Atomics.notify(array, 3, 2);
  } else {
    const res = Atomics.wait(array, 3, 0);
    console.log({ res });
  }
}
