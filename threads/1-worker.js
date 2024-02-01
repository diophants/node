'use strict';

const thread = require('node:worker_threads');
const { Worker } = thread;

console.log('New Thread!');

const getInheritance = (instance, parents = []) => {
  const parent = Object.getPrototypeOf(instance);
  if (!parent) return parents;
  parents.push(parent.constructor.name);
  return getInheritance(parent, parents);
};

if (thread.isMainThread) {
  console.dir({ master: thread });
  const workerData = { text: 'Data from master to worker' };
  const worker = new Worker(__filename, { workerData });
  worker.on('message', (...args) => {
    console.log('message: ', ...args);
  });
  worker.on('error', (err) => {
    console.log('error: ', err);
  });
  worker.on('exit', (code) => {
    console.log('exit: ', code);
  });
  console.log('getInheritance: ', getInheritance(worker));
} else {
  console.dir({ worker: thread });
  thread.parentPort.postMessage('Hello There');
  setTimeout(() => {
    const data = { text: 'Data from worker to master' };
    thread.parentPort.postMessage(data);
  }, 1000);
}
