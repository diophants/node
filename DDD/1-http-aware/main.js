'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const pg = require('pg');
const hash = require('./hash.js');

const PORT = 8000;
const app = express();
const pool = new pg.Pool({
  host: '127.0.0.1',
  port: 5432,
  database: 'example',
  user: 'diophant',
  password: 'diophant',
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/user', (req, res) => {
  console.log(`${req.socket.remoteAddress} GET /user`);
  pool.query('SELECT * FROM users', (err, data) => {
    if (err) throw err;
    res.status(200).json(data.rows);
  });
});

app.post('/user', async (req, res) => {
  const { login, password } = req.body;
  const user = JSON.stringify({ login, password });
  console.log(`${req.socket.remoteAddress} POST /user ${user}`);
  const sql = `INSERT INTO users (login, password) VALUES ($1, $2)`;
  const passwordHash = await hash(password);
  pool.query(sql, [login, passwordHash], (err, data) => {
    if (err) throw err;
    res.status(201).json({ created: data.insertId });
  });
});

app.get('/user/:id', (req, res) => {
  console.log(req.url);
  console.log(typeof req.params.id);
  const id = parseInt(req.params.id, 10);
  console.log(`${req.socket.remoteAddress} GET /user/${id}`);
  const sql = 'SELECT * FROM users WHERE id = $1';
  pool.query(sql, [id], (err, data) => {
    if (err) throw err;
    res.status(200).json(data.rows);
  });
});

app.put('/user/:id', async (req, res) => {
  const { login, password } = req.body;
  const id = parseInt(req.params.id, 10);
  const user = JSON.stringify({ login, password });
  console.log(`${req.socket.remoteAddress} PUT /users/${id} ${user}`);
  const sql = 'UPDATE users SET login = $1, password = $2 WHERE id = $3';
  const passwordHash = await hash(password);
  pool.query(sql, [login, passwordHash, id], (err, data) => {
    if (err) throw err;
    res.status(201).json({ modifier: data.insertId });
  });
});

app.delete('/user/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  console.log(`${req.socket.remoteAddress} DELETE /user/${id}`);
  const sql = 'DELETE FROM users WHERE id = $1';
  pool.query(sql, [id], (err, data) => {
    if (err) throw err;
    res.status(200).json({ deleted: data.insertId });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running. Port ${PORT}`);
});
