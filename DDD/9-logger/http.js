'use strict';

const http = require('node:http');

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
  http
    .createServer(async (req, res) => {
      const { url, method, socket } = req;
      const [name, id] = url.substring(1).split('/');
      const entity = routing[name];
      if (!entity) return void res.end(`API not found ${name}`);
      const approach = crud[method.toLowerCase()];
      const handling = entity[approach];
      if (!handling) return void res.end(`API not found ${name}, ${method}`);
      const src = handling.toString();
      const signature = src.substring(0, src.indexOf(')'));
      const args = [];
      if (signature.includes('(id')) args.push(id);
      if (signature.includes('{')) args.push(await receivedArgs(req));
      console.log(`${socket.remoteAddress} ${method} ${url}`);
      const result = await handling(...args);
      res.end(JSON.stringify(result.rows));
    })
    .listen(port);

  console.log(`API on port ${port}`);
};
