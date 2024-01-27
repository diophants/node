'use strict';

const http = require('node:http');
const pg = require('pg');
const receivedArgs = require('./body.js');
const hash = require('./hash.js');

const PORT = 8000;

const pool = new pg.Pool({
  host: '127.0.0.1',
  port: 5432,
  database: 'example',
  user: 'diophant',
  password: 'diophant',
});

const router = {
  user: {
    async get(id) {
      if (!id) return pool.query('SELECT ("login", "password") FROM users');
      const sql = 'SELECT ("login", "password") FROM users WHERE id = $1';
      return await pool.query(sql, [id]);
    },
    async post({ login, password }) {
      const sql = 'INSERT INTO users (login, password) VALUES ($1, $2)';
      const passwordHash = await hash(password);
      return await pool.query(sql, [login, passwordHash]);
    },
    async put(id, { login, password }) {
      const sql = 'UPDATE users SET login = $1, password = $2 WHERE id = $3';
      return await pool.query(sql, [login, password, id]);
    },
    async delete(id) {
      const sql = 'DELETE FROM users WHERE id = $1';
      return await pool.query(sql, [id]);
    },
  },
};

http
  .createServer(async (req, res) => {
    const { method, url, socket } = req;
    const [name, id] = url.substring(1).split('/');
    const entity = router[name];
    if (!entity) return void res.end(`Not found ${name}`);
    const handler = entity[method.toLowerCase()];
    if (!handler) return void res.end(`Not found ${name}, method: ${method}`);
    const srs = handler.toString();
    const signature = srs.substring(0, srs.indexOf(')'));
    const args = [];
    if (signature.includes('(id')) args.push(id);
    if (signature.includes('{')) args.push(await receivedArgs(req));
    console.log(args);
    console.log(`${socket.remoteAddress} ${method} ${url}`);
    const result = await handler(...args);
    res.end(JSON.stringify(result.rows));
  })
  .listen(PORT, () => console.log(`Listen port: ${PORT}`));
