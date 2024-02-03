'use strict';

const fs = require('node:fs').promises;
const threads = require('node:worker_threads');
const { Worker, isMainThread } = threads;

class CounterSemaphore {
  constructor(shared, offset = 0, initial) {
    this.counter = new Int32Array(shared);
    if (typeof initial === 'number') {
      Atomics.store(this.counter, 0, initial);
    }
  }

  enter() {
    Atomics.wait(this.counter, 0, 0);
    Atomics.sub(this.counter, 0, 1);
  }

  leave() {
    console.log(this.counter[0]);
    Atomics.add(this.counter, 0, 1);
    Atomics.notify(this.counter, 0, 1);
  }
}

if (isMainThread) {
  const buffer = new SharedArrayBuffer(4);
  new CounterSemaphore(buffer, 0, 2);
  for (let i = 0; i < 20; i++) {
    new Worker(__filename, { workerData: buffer });
  }
} else {
  const { threadId, workerData } = threads;
  const semaphore = new CounterSemaphore(workerData);
  console.log({ threadId, semaphore: semaphore.counter[0] });
  const REPET_COUNT = 1000000;
  const file = `file-${threadId}.dat`;
  semaphore.enter();
  const data = `data from ${threadId}`.repeat(REPET_COUNT);
  fs.writeFile(file, data)
    .then(() => fs.unlink(file))
    .then(() => semaphore.leave());
}
