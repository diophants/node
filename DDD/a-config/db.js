'use strict';

const pg = require('pg');

const crud = (pool) => (table) => ({
  query(sql, args) {
    return pool.query(sql, args);
  },
  read(id, fields = ['*']) {
    const names = fields.join(', ');
    const sql = `SELECT ${names} FROM ${table}`;
    if (!id) return pool.query(sql);
    return pool.query(sql + ' WHERE id = $1', [id]);
  },
  create({ ...record }) {
    const keys = Object.keys(record);
    const params = new Array(keys.length);
    const args = new Array(keys.length);
    let i = 0;
    for (const column of keys) {
      args[i] = record[column];
      params[i] = `$${++i}`;
    }
    const columns = keys.join(', ');
    const values = params.join(', ');
    const sql = `INSERT INTO ${table} (${columns}) VALUES (${values})`;
    return pool.query(sql, args);
  },
  update(id, { ...record }) {
    const keys = Object.keys(record);
    const params = new Array(keys.length);
    const args = new Array(keys.length);
    let i = 0;
    for (const column of keys) {
      args[i] = record[column];
      params[i] = `${column} = $${++i}`;
    }
    const updates = params.join(', ');
    const sql = `UPDATE ${table} SET ${updates} WHERE id = $${++i}`;
    args.push(id);
    return pool.query(sql, args);
  },
  delete(id) {
    const sql = `DELETE FROM ${table} WHERE id = $1`;
    return pool.query(sql, [id]);
  },
});

module.exports = (options) => crud(new pg.Pool(options));
