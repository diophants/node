'use strict';
const fastify = require('fastify')();
const config = require('./config.js');
const console = require(`./${config.library.logger}.js`);

const receivedArgs = async (req) => {
  const buffer = [];
  for await (const chunk of req) buffer.push(chunk);
  const result = Buffer.concat(buffer).toString();
  return JSON.parse(result);
};

const crud = {
  get: 'read',
  post: 'create',
  put: 'update',
  delete: 'delete',
};

module.exports = (routing, port) => {
  fastify.route({
    method: ['GET', 'POST', 'PUT', 'DELETE'],
    url: '/*',
    schema: {
      querystring: {
        name: { type: 'string' },
        excitement: { type: 'integer' },
      },
      response: {
        200: {
          type: 'array',
          properties: {
            hello: { type: 'string' }, // Не получилось динамически изменить схему для ответа клиенту
          },
        },
      },
    },
    handler: async function (req, reply) {
      const { url, method, socket } = req;
      console.log(url);
      const [name, id] = url.substring(1).split('/');
      const entity = routing[name];
      if (!entity) return void reply.send(`API not found ${name}`);
      const approach = crud[method.toLowerCase()];
      const handling = entity[approach];
      if (!handling) return void reply.send(`API not found ${name}, ${method}`);
      const src = handling.toString();
      const signature = src.substring(0, src.indexOf(')'));
      const args = [];
      if (signature.includes('(id')) args.push(id);
      if (signature.includes('{')) args.push(await receivedArgs(req));
      console.log(`${socket.remoteAddress} ${method} ${url}`);
      const result = await handling(...args);
      console.table(result.rows);

      reply.send({ hello: result.rows });
    },
  });

  fastify.listen({ port }, (err) => {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    console.log('Fastify. API on port 8000');
  });
};
