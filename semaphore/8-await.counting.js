'use strict';

class CountingSemaphore {
  constructor(count) {
    this.counter = count;
    this.queue = [];
  }

  enter() {
    return new Promise((resolve) => {
      if (this.counter > 0) {
        this.counter--;
        resolve();
        return;
      }
      this.queue.push(resolve);
    });
  }

  leave() {
    this.counter++;
    if (this.queue.length !== 0) {
      this.counter--;
      const resolve = this.queue.shift();
      resolve();
    }
  }
}

const semaphore = new CountingSemaphore(3);

const job = async (task) => {
  await semaphore.enter();
  console.log('Enter: ', task);
  setTimeout(() => {
    semaphore.leave();
    console.log('Leave: ', task);
  }, 1000);
};

for (let i = 0; i < 100; i++) job(i);
