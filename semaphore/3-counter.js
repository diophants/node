'use strict';

const fs = require('node:fs');
const threads = require('node:worker_threads');
const { Worker, isMainThread } = threads;

class CounterSemaphore {
  constructor(shared, offset = 0, initial) {
    this.counter = new Int32Array(shared);
    if (typeof initial === 'number') {
      this.counter[0] = initial;
    }
  }

  enter() {
    while (this.counter[0] <= 0);
    this.counter[0]--;
  }

  leave() {
    // if (this.counter[0] <= -1) throw new Error();
    this.counter[0]++;
  }
}

if (isMainThread) {
  const buffer = new SharedArrayBuffer(4);
  // Change initial from 10 to 2
  new CounterSemaphore(buffer, 0, 2);
  for (let i = 0; i < 20; i++) {
    new Worker(__filename, { workerData: buffer });
  }
} else {
  const { threadId, workerData } = threads;
  const semaphore = new CounterSemaphore(workerData);
  console.log({ threadId, semaphore: semaphore.counter[0] });
  const REPET = 1000000;
  const file = `data-${threadId}.dat`;
  const data = `Data from ${threadId}`.repeat(REPET);
  semaphore.enter();
  fs.writeFile(file, data, (err, res) => {
    fs.unlink(file, () => {
      semaphore.leave();
    });
  });
}
