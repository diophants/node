'use strict';

const config = require('./config.js');
const fsp = require('node:fs').promises;
const path = require('node:path');
const server = require(`./${
  config.framework.native || config.transport.protocol
}.js`);
const staticServer = require('./static.js');
const load = require('./load.js')(config.sendbox);
const context = {
  db: require('./db.js')(config.db),
  hash: require('./hash.js')(config.crypto),
  logger: require(`./${config.library.logger}.js`),
};

const sendbox = {
  require: (module) => {
    return Object.freeze(context[module]);
  },
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

server(routing, config.api.port);
staticServer('/static', config.static.port);
