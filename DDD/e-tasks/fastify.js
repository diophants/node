'use strict';
const fastify = require('fastify')();
const config = require('./config.js');
const console = require(`./${config.library.logger}.js`);

const TIMEOUT = 5000;

const crud = {
  read: 'get',
  create: 'post',
  update: 'put',
  delete: 'delete',
};

const waitRout = async (routing) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!Object.keys(routing).length) waitRout(routing);
      else resolve(routing);
    }, 10);
    setTimeout(() => {
      reject('Routing timeout!');
    }, TIMEOUT);
  });

const parseRout = async (structure) => {
  const services = Object.keys(structure);
  for (const serviceName of services) {
    const methods = Object.keys(structure[serviceName]);
    for (const methodName of methods) {
      const approach = crud[methodName];
      if (!approach) continue;
      const handling = structure[serviceName][methodName];
      console.log(`fastify.${approach}('/${serviceName}/:id')`);
      fastify[approach](`/${serviceName}/:id`, async (req, res) => {
        const { url } = req;
        console.log(approach, url);
        const [...items] = url.substring(1).split('/');
        const id = parseInt(items.pop());
        const src = handling.toString();
        const signature = src.substring(0, src.indexOf(')'));
        const args = [];
        if (signature.includes('id') && id) args.push(id);
        if (signature.includes('}')) args.push(req.body);
        const result = await handling(...args);
        res.send(result.rows);
      });
    }
  }
};

module.exports = async (routing, port) => {
  const structure = await waitRout(routing);
  await parseRout(structure);

  fastify.listen({ port }, (err) => {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    console.log('Fastify. API on port 8000');
  });
};
