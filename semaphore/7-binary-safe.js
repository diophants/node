'use strict';

const threads = require('node:worker_threads');
const { Worker, isMainThread } = threads;

const UNLOCKED = 1;
const LOCKED = 0;

class BinarySemaphore {
  constructor(shared, offset = 0, init = false) {
    this.lock = new Int32Array(shared, offset, 1);
    if (init) {
      Atomics.store(this.lock, 0, UNLOCKED);
    }
  }

  enter() {
    let prev = Atomics.exchange(this.lock, 0, LOCKED);
    while (prev === LOCKED) {
      Atomics.wait(this.lock, 0, LOCKED);
      prev = Atomics.exchange(this.lock, 0, LOCKED);
    }
  }

  leave() {
    if (Atomics.load(this.lock, 0) === UNLOCKED) {
      throw new Error('Race condition');
    }
    Atomics.store(this.lock, 0, UNLOCKED);
    Atomics.notify(this.lock, 0, 1);
  }
}

if (isMainThread) {
  const buffer = new SharedArrayBuffer(14);
  new BinarySemaphore(buffer, 0, true);
  new Worker(__filename, { workerData: buffer });
  new Worker(__filename, { workerData: buffer });
} else {
  const { threadId, workerData } = threads;
  const semaphore = new BinarySemaphore(workerData);
  const array = new Int8Array(workerData, 4);
  const value = threadId === 1 ? 1 : -1;
  setInterval(() => {
    semaphore.enter();
    for (let i = 0; i < 10; i++) {
      array[i] += value;
    }
    console.log([threadId, semaphore.lock[0], array]);
    semaphore.leave();
  }, 10);
}
