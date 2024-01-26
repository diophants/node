'use stict';

const assert = require('node:assert').strict;
const { EventEmitter } = require('node:events');

class Task extends EventEmitter {
  constructor(name, time, exec) {
    super();
    this.name = name;
    this.set = setTimeout;
    this.clear = clearTimeout;
    this.exec = exec;
    this.running = false;
    this.count = 0;
    this.timer = null;
    if (typeof time === 'number') {
      this.time = Date.now() + time;
      return;
    }
    this.time = new Date(time).getTime();
  }

  get active() {
    return !!this.timer;
  }

  start() {
    this.stop();
    if (this.running) return false;
    const time = this.time - Date.now();
    if (time < 0) return false;
    this.timer = this.set(() => {
      this.run();
    }, time);
    return true;
  }

  stop() {
    if (!this.active || this.running) return false;
    this.clear(this.timer);
    this.timer = null;
    return true;
  }

  run() {
    if (!this.active || this.running) return false;
    this.running = true;
    this.exec((err, res) => {
      if (err) this.emit('error', err, this);
      this.count++;
      this.running = false;
    });
    return true;
  }
}

class Scheduler extends EventEmitter {
  constructor() {
    super();
    this.tasks = new Map();
  }

  task(name, time, exec) {
    this.stop(name);
    const task = new Task(name, time, exec);
    this.tasks.set(name, task);
    task.on('error', (err) => {
      this.emit('error', err, task);
    });
    task.start();
    return task;
  }

  stop(name) {
    const task = this.tasks.get(name);
    if (task) {
      task.stop();
      this.tasks.delete(name);
    }
  }
  stopAll() {
    for (const name of this.tasks.keys()) this.stop(name);
  }
}

// Test 1

const testClearTask = (next) => {
  const timer = setTimeout(() => {
    const err = new Error('Can not execute task');
    next(err);
  }, 200);

  const scheduler = new Scheduler();

  scheduler.task('name1', '2019-04-16T18:30Z', (done) => {
    done(null, 'task successed');
  });

  try {
    assert.equal(scheduler.tasks.size, 1);
  } catch (err) {
    next(err);
  }
  clearTimeout(timer);
  next();
};

// Test 2
const testExecuteTask = (next) => {
  const timer = setTimeout(() => {
    const err = new Error('Can not task executed');
    next(err);
  }, 200);

  const scheduler = new Scheduler();

  scheduler.task('name1', 100, (done) => {
    let error = null;
    try {
      assert.ok(scheduler.tasks.get('name1').running);
    } catch (err) {
      error = err;
    }
    clearTimeout(timer);
    done(null, 'task successful! ExecuteTask');
    scheduler.stopAll();
    next(error);
  });
};

// Test 3
const testFailedTask = (next) => {
  const timer = setTimeout(() => {
    const err = new Error('Can not execute task');
    next(err);
  }, 200);

  const scheduler = new Scheduler();

  scheduler.task('name1', 100, (done) => {
    done(new Error('task failed'));
  });

  scheduler.on('error', (err, task) => {
    let error = null;
    try {
      assert.ok(task.running);
      assert.equal(err.message, 'task failed');
    } catch (err) {
      error = err;
    }
    clearTimeout(timer);
    scheduler.stopAll();
    next(error);
  });
};

const tests = [testClearTask, testExecuteTask, testFailedTask];
let failed = 0;
const count = tests.length;

const runTest = () => {
  if (tests.length === 0) {
    console.log(`Total: ${count}; Failed: ${failed}`);
    process.exit(failed ? 1 : 0);
  }

  const test = tests.shift();
  console.log(`Started test ${test.name}`);
  try {
    test((err) => {
      if (err) {
        failed++;
        console.log(err);
        console.log(`async Failed test ${test.name}`);
      }
      console.log(`Finished test ${test.name}`);
      setTimeout(runTest, 0);
    });
  } catch (err) {
    failed++;
    console.log(`sync Failed test ${test.name}`);
    setTimeout(runTest, 0);
  }
};

runTest();
