'use strict';

const fs = require('node:fs');
const threads = require('node:worker_threads');
const { Worker, isMainThread } = threads;

class CounterSemaphore {
  constructor(shared, offset = 0, inited) {
    this.counter = new Int32Array(shared);
    if (typeof inited === 'number') {
      Atomics.store(this.counter, 0, inited);
    }
  }

  enter() {
    while (true) {
      Atomics.wait(this.counter, 0, 0);
      const n = Atomics.load(this.counter, 0);
      if (n > 0) {
        const prev = Atomics.compareExchange(this.counter, 0, n, n - 1);
        if (prev === n) return;
        else throw new Error('Race condition');
      }
    }
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
  const file = `file-${threadId}.dat`;
  const REPET_COUNT = 1000000;
  semaphore.enter();
  const data = `data form ${threadId}`.repeat(REPET_COUNT);
  fs.writeFile(file, data, () => {
    fs.unlink(file, () => {
      semaphore.leave();
    });
  });
}
