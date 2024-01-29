'use strict';

const http = require('node:http');
const db = require('./db.js');

const PORT = 8000;

const router = {
  user: require('./user.js'),
  city: db('city'),
  country: db('country'),
};

const crud = { get: 'read', post: 'create', put: 'update', delete: 'delete' };

const receivedArgs = async (req) => {
  const buffer = [];
  for await (const chunk of req) buffer.push(chunk);
  const result = Buffer.concat(buffer).toString();
  return JSON.parse(result);
};

http
  .createServer(async (req, res) => {
    const { method, url, socket } = req;
    const [name, id] = url.substring(1).split('/');
    const entity = router[name];
    if (!entity) return void res.end(`not found ${name}`);
    const procedure = crud[method.toLowerCase()];
    const handling = entity[procedure];
    if (!handling) return void res.end(`not found ${name}, method: ${method}`);
    const srs = handling.toString();
    const signature = srs.substring(0, srs.indexOf(')'));
    const args = [];
    if (signature.includes('(id')) args.push(id);
    if (signature.includes('{')) args.push(await receivedArgs(req));
    const result = await handling(...args);
    res.end(JSON.stringify(result.rows));
  })
  .listen(PORT, () =>
    console.log(`Server is running. http://localhost:${PORT}`)
  );
