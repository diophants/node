'use strict';

const thread = require('node:worker_threads');

const buffer = thread.workerData;

const array = new Int8Array(buffer);

array[0] = 123;

thread.parentPort.postMessage({ name: 'display' });
