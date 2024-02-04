'use strict';

const crypto = require('node:crypto');

module.exports =
  ({ passLength }) =>
  (password) => {
    const salt = crypto.randomBytes(16).toString('base64');
    return new Promise((resolve, reject) => {
      crypto.scrypt(password, salt, passLength, (err, result) => {
        if (err) console.log(err);
        resolve(salt + ':' + result.toString('base64'));
      });
    });
  };
