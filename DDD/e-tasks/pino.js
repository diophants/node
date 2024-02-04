'use strict';

const fs = require('node:fs');
const util = require('node:util');
const path = require('node:path');
const pino = require('pino');

class Logger {
  constructor(logPath) {
    this.path = logPath;
    const date = new Date().toISOString().substring(0, 10);
    const filePath = path.join(logPath, `${date}.log`);
    this.stream = fs.createWriteStream(filePath, { flags: 'a' });
    this.logger = pino(this.stream);
    this.regexp = new RegExp(path.basename(this.path), 'g');
  }

  close() {
    return new Promise((resolve) => this.stream.end(resolve));
  }

  log(...args) {
    this.logger.info(...args);
  }

  dir(...args) {
    this.logger.info(...args);
  }

  debug(...args) {
    this.logger.info(...args);
  }

  error(...args) {
    this.logger.error(...args);
  }

  system(...args) {
    this.logger.info(...args);
  }

  access(...args) {
    this.logger.info(...args);
  }
}

module.exports = new Logger('./log');
