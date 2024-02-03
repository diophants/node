'use strict';

const threads = require('node:worker_threads');
const { Worker, isMainThread } = threads;

const UNLOCKED = 1;
const LOCKED = 0;

class Mutex {
  constructor(shared, offset = 0, init = false) {
    this.lock = new Int32Array(shared, offset, 1);
    if (init) Atomics.store(this.lock, 0, UNLOCKED);
    this.owner = false;
  }

  enter(callback) {
    Atomics.wait(this.lock, 0, LOCKED);
    Atomics.store(this.lock, 0, LOCKED);
    this.owner = true;
    setTimeout(callback, 0);
  }

  leave() {
    if (!this.owner) return false;
    Atomics.store(this.lock, 0, UNLOCKED);
    Atomics.notify(this.lock, 0, 1);
    this.owner = false;
    return true;
  }
}

if (isMainThread) {
  const buffer = new SharedArrayBuffer(4);
  new Mutex(buffer, 0, true);
  new Worker(__filename, { workerData: buffer });
  new Worker(__filename, { workerData: buffer });
} else {
  const { threadId, workerData } = threads;
  const mutex = new Mutex(workerData);
  console.log(`Create mutex: ${threadId}`);
  if (threadId === 1) {
    mutex.enter(() => {
      setTimeout(() => {
        if (mutex.leave()) {
          console.log('Mutex leave! Id: ', threadId);
        }
      }, 100);
    });
  } else if (!mutex.leave()) {
    console.log('Cannot leave mutex! Id: ', threadId);
  }
}
