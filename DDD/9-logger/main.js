'use strict';

const fsp = require('node:fs').promises;
const path = require('node:path');
const server = require('./http.js');
const staticServer = require('./static.js');
const load = require('./load.js');
const db = require('./db.js');
const hash = require('./hash.js');
const logger = require('./logger.js');

const sendbox = {
  console: Object.freeze(logger),
  db: Object.freeze(db),
  common: { hash },
};
const routing = {};
const apiPath = path.join(process.cwd(), '/api');

(async () => {
  const list = await fsp.readdir(apiPath);
  for (const file of list) {
    if (!file.endsWith('.js')) continue;
    const filePath = path.join(apiPath, file);
    const name = path.basename(filePath, '.js');
    routing[name] = await load(filePath, sendbox);
  }
})();

server(routing, 8000);
staticServer('/static', 8001);
