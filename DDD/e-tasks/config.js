module.exports = {
  api: {
    port: 8000,
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
  transport: {
    protocol: 'http',
  },
  framework: {
    // native: 'fastify',
  },
  library: {
    logger: 'pino',
  },
};
