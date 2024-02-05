'use strict';

const config = require('./config.js');
const fsp = require('node:fs').promises;
const path = require('node:path');
const transport = require(`./transport/${config.api.transport}.js`);
const staticServer = require('./static.js');
const load = require('./load.js')(config.sendbox);
const db = require('./db.js')(config.db);
const hash = require('./hash.js')(config.crypto);
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

  transport(routing, config.api.port, logger);
  staticServer('/static', config.static.port, logger);
})();
