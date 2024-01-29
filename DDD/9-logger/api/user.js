({
  read(id) {
    console.log('log');
    console.dir('dir');
    console.debug('debug');
    console.error('read');
    console.system('system');
    console.access('access');
    return db('users').read(id);
  },

  async create({ login, password }) {
    const passwordHash = await common.hash(password);
    return db('users').create({ login, password: passwordHash });
  },

  async update(id, { login, password }) {
    const passwordHash = await common.hash(password);
    return db('users').update(id, { login, password: passwordHash });
  },

  delete(id) {
    return db('users').delete(id);
  },
});
