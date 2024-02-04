const db = require('db');
const hash = require('hash');

({
  read(id) {
    return db('users').read(id);
  },

  async create({ login, password }) {
    const passwordHash = await hash(password);
    return db('users').create({ login, password: passwordHash });
  },

  async update(id, { login, password }) {
    const passwordHash = await hash(password);
    return db('users').update(id, { login, password: passwordHash });
  },

  delete(id) {
    return db('users').delete(id);
  },
});
