'use strict';

const server = require('./http.js');
const db = require('./db.js');

const PORT = 8000;

const routing = {
  user: require('./user.js'),
  city: db('city'),
  country: db('country'),
};

server(routing, PORT);
