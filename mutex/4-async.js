'use strict';

const { off } = require('node:process');
const threads = require('node:worker_threads');
const { Worker, isMainThread } = threads;

const UNLOCKED = 1;
const LOCKED = 0;

class Mutex {
  constructor(messagePort, shared, offset = 0, init) {
    this.port = messagePort;
    this.lock = new Int32Array(shared, offset, 1);
    if (init) Atomics.store(this.lock, 0, UNLOCKED);
    this.owner = false;
    this.resolve = null;
    this.trying = false;
    if (messagePort) {
      messagePort.on('message', (kind) => {
        if (kind === 'leave' && this.trying) this.tryEnter();
      });
    }
  }

  enter() {
    return new Promise((resolve) => {
      this.resolve = resolve;
      this.trying = true;
      this.tryEnter();
    });
  }

  tryEnter() {
    if (!this.resolve) return;
    const prev = Atomics.exchange(this.lock, 0, LOCKED);
    if (prev === UNLOCKED) {
      this.owner = true;
      this.trying = false;
      this.resolve();
      this.resolve = null;
    }
  }

  leave() {
    if (!this.owner) return;
    Atomics.store(this.lock, 0, UNLOCKED);
    this.port.postMessage('leave');
    this.owner = false;
  }
}

class Thread {
  constructor(data) {
    const worker = new Worker(__filename, { workerData: data });
    Thread.workers.add(worker);
    worker.on('message', (kind) => {
      for (const next of Thread.workers) {
        if (next !== worker) next.postMessage(kind);
      }
    });
  }
}

Thread.workers = new Set();

if (isMainThread) {
  const buffer = new SharedArrayBuffer(4);
  new Mutex(null, buffer, 0, true);
  new Thread(buffer);
  new Thread(buffer);
} else {
  const { threadId, workerData, parentPort } = threads;

  const mutex = new Mutex(parentPort, workerData);

  setInterval(() => {
    console.log(`Interval ${threadId}`);
  }, 1000);

  const loop = async () => {
    console.log(`Enter ${threadId}`);
    await mutex.enter();
    setTimeout(() => {
      console.log(`Leave ${threadId}`);
      mutex.leave();
      setTimeout(loop, 0);
    }, 3000);
  };
  loop();
}
