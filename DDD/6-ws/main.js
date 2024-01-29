'use strict';

const server = require('./http.js');
const staticServer = require('./static.js');
const db = require('./db.js');

const PORT = 8000;

const routing = {
  user: require('./user.js'),
  city: db('city'),
  country: db('country'),
};

const modulePath = require.resolve('./ws.js');
const cache = require.cache[modulePath];

if (cache) staticServer('./static', 8001);

server(routing, PORT);
