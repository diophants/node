'use strict';

const crypto = require('node:crypto');

const hash = (password) =>
  new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('base64');
    crypto.scrypt(password, salt, 64, (err, res) => {
      if (err) reject(err);
      resolve(salt + ':' + res.toString('base64'));
    });
  });

module.exports = hash;
