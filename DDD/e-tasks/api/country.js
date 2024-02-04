const db = require('db');
const console = require('logger');
const country = db('country');

({
  read(id) {
    console.log('API country: ', id || '');
    return country.read(id);
  },

  find(mask) {
    const sql = 'SELECT * FROM country WHERE name = $1';
    return country.query(sql, [mask]);
  },
  delete(id) {
    return country.delete(id);
  },
});
