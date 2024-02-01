'use strict';

const http = require('node:http');
const thread = require('node:worker_threads');

const PORT = 8000;

thread.parentPort.postMessage({ name: 'started', port: PORT });

const routing = {
  '/': async (req, res) => {
    return await { status: res.statusCode };
  },
  '/api/method': (req, res) => {
    return { name: 'Vasiliy', age: 235 };
  },
};

const types = {
  object: JSON.stringify,
  string: (s) => s,
  number: (n) => n.toString(),
  undefined: () => 'not found',
};

http
  .createServer(async (req, res) => {
    const handler = routing[req.url];
    if (!handler) return void res.end('Not found routing');
    const data = await handler(req, res);
    const type = typeof data;
    const serialize = types[type];
    const result = serialize(data);
    res.end(result);
  })
  .listen(PORT);
