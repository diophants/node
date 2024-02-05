module.exports = {
  api: {
    port: 8000,
    transport: 'http',
  },
  static: {
    port: 8001,
  },
  db: {
    host: '127.0.0.1',
    port: 5432,
    database: 'example',
    user: 'diophant',
    password: 'diophant',
  },
  sendbox: { timeout: 5000, displayErrors: false },
  crypto: {
    passLength: 64,
  },
};
