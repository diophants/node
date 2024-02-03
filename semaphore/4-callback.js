'use strict';

const fs = require('node:fs');
const threads = require('node:worker_threads');
const { Worker, isMainThread } = threads;

class CountingSemaphore {
  constructor(shared, offset = 0, initial) {
    this.counter = new Int32Array(shared, offset, 1);
    if (typeof initial === 'number') {
      this.counter[0] = initial;
    }
    this.queue = [];
  }

  enter(callback) {
    if (this.counter[0] > 0) {
      this.counter[0]--;
      setTimeout(callback, 0);
    } else {
      this.queue.push(callback);
    }
  }

  leave() {
    this.counter[0]++;
    if (this.queue.length > 0) {
      this.counter[0]--;
      const callback = this.queue.shift();
      setTimeout(callback, 0);
    }
  }
}

if (isMainThread) {
  const buffer = new SharedArrayBuffer(4); //!
  const semaphore = new CountingSemaphore(buffer, 0, 2);
  for (let i = 0; i < 20; i++) {
    new Worker(__filename, { workerData: buffer });
  }
  console.log({ semaphore: semaphore.counter[0] });
} else {
  const { threadId, workerData } = threads;
  const semaphore = new CountingSemaphore(workerData);
  console.log({ threadId, semaphore: semaphore.counter[0] });
  const file = `file-${threadId}.dat`;
  const REPET_COUNT = 10000000;
  semaphore.enter(() => {
    const data = `data from ${threadId}`.repeat(REPET_COUNT);
    fs.writeFile(file, data, () => {
      fs.unlink(file, () => {
        semaphore.leave();
      });
    });
  });
}

const bigint = process.hrtime.bigint();

process.on('exit', () => {
  const diff = (process.hrtime.bigint() - bigint) / 1000000n;
  // console.log(diff);
});
