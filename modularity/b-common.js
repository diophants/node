'use strict';

// const example8 = require('./8-export.mjs');
const promise = import('events');

console.log(promise);

promise.then((event) =>
  console.log({ defaultMaxListener: event.defaultMaxListener })
);
