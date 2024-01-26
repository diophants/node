import { defaultMaxListeners } from 'events';

const promise = import('events');

promise.then((event) =>
  console.log({ defaultMaxListeners: event.defaultMaxListeners })
);
const events = import('events');

const res = await events;

console.log({ defaultMaxListeners: res.defaultMaxListeners });
