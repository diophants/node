'use strict';

const fsp = require('node:fs').promises;
const path = require('node:path');
const server = require('./ws.js');
const staticServer = require('./static.js');

const routing = {};
const apiPath = path.join(process.cwd(), '/api');

(async () => {
  const list = await fsp.readdir(apiPath);
  for (const file of list) {
    if (!file.endsWith('.js')) continue;
    const filePath = path.join(apiPath, file);
    const name = path.basename(filePath, '.js');
    routing[name] = require(filePath);
  }
})();

server(routing, 8000);
staticServer('/static', 8001);
