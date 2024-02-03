'use strict';

const {
  parentPort,
  threadId,
  Worker,
  isMainThread,
} = require('node:worker_threads');

const threads = new Set();

const UNLOCKED = 1;
const LOCKED = 0;

const locks = {
  resources: new Map(),
};

class Mutex {
  constructor(resourceName, shared, initial = false) {
    this.resourceName = resourceName;
    this.lock = new Int32Array(shared, 0, 1);
    if (initial) Atomics.store(this.lock, 0, UNLOCKED);
    this.owner = false;
    this.trying = false;
    this.callback = null;
  }

  async enter(callback) {
    this.trying = true;
    this.callback = callback;
    await this.tryEnter();
  }

  async tryEnter() {
    if (!this.callback) return;
    const prev = Atomics.exchange(this.lock, 0, LOCKED);
    if (prev === UNLOCKED) {
      this.owner = true;
      this.trying = false;
      this.callback(this);
      this.callback = null;
      this.leave();
    }
  }

  leave() {
    if (!this.owner) return;
    Atomics.store(this.lock, 0, UNLOCKED);
    this.owner = false;
    locks.sendMessage({ kind: 'leave', resourceName: this.resourceName });
  }
}

locks.request = async (resourceName, callback) => {
  let lock = locks.resources.get(resourceName);
  if (!lock) {
    const buffer = new SharedArrayBuffer(4);
    lock = new Mutex(resourceName, buffer, true);
    locks.resources.set(resourceName, lock);
    locks.sendMessage({ resourceName, kind: 'create', buffer });
  }
  await lock.enter(callback);
};

locks.sendMessage = (message) => {
  if (isMainThread) {
    for (const thread of threads) {
      thread.postMessage(message);
    }
  } else {
    parentPort.postMessage(message);
  }
};

locks.receiveMessage = (message) => {
  const { resourceName, kind, buffer } = message;
  if (kind === 'create') {
    const lock = new Mutex(resourceName, buffer);
    locks.resources.set(resourceName, lock);
  } else if (kind === 'leave') {
    for (const mutex of locks.resources) {
      if (mutex.trying) mutex.tryEnter();
    }
  }
};

if (!isMainThread) {
  parentPort.on('message', locks.receiveMessage);
}

class Thread {
  constructor() {
    const worker = new Worker(__filename);
    this.worker = worker;
    threads.add(this);
    worker.on('message', (message) => {
      for (const thread of threads) {
        if (thread.worker !== worker) {
          thread.worker.postMessage(message);
        }
      }
      locks.receiveMessage(message);
    });
  }
}

//Usage

if (isMainThread) {
  new Thread();
  new Thread();
  setTimeout(() => {
    process.exit(0);
  }, 300);
} else {
  locks.request('A', async () => {
    console.log(`Enter ${locks.resourceName} in ${threadId}`);
  });
  setTimeout(() => {
    locks.request('B', async () => {
      console.log(`Enter ${locks.resourceName} in ${threadId}`);
    });
    console.log(`Leave all in ${threadId}`);
  }, 100);
}
