'use strict';

const threads = require('node:worker_threads');
const { Worker, isMainThread } = threads;

const LOCKED = 0;
const UNLOCKED = 1;

class BinarySemaphore {
  constructor(shared) {
    this.lock = new Int8Array(shared, 0, 1);
    this.lock[0] = UNLOCKED;
  }

  enter() {
    while (this.lock[0] === LOCKED) {
      console.log('lock: ', threads.threadId);
    }
    this.lock[0] = LOCKED;
  }

  leave() {
    if (this.lock[0] === UNLOCKED) {
      throw new Error('Cannot leave unlocked BinarySemaphore');
    }
    this.lock[0] = UNLOCKED;
  }
}

if (isMainThread) {
  const buffer = new SharedArrayBuffer(11);
  new Worker(__filename, { workerData: buffer });
  new Worker(__filename, { workerData: buffer });
} else {
  const { threadId, workerData } = threads;
  const semaphore = new BinarySemaphore(workerData);
  const array = new Int8Array(workerData, 1);
  const value = threadId === 1 ? 1 : -1;
  setInterval(() => {
    semaphore.enter();
    for (let i = 0; i < 10; i++) {
      array[i] += value;
    }
    console.log([threadId, array]);
    semaphore.leave();
  }, 100);
}
