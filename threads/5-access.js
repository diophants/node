'use strict';

const thread = require('node:worker_threads');

const { buffer } = thread.workerData;

const array = new Int8Array(buffer);

setInterval(() => {
  for (let j = 0; j < 1024; j++) {
    array[j] += 1;
  }
}, 100);
