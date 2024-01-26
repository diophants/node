'use strict';

const memory = require('../memory.js');

module.exports = async () => {
  let name = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 8; i++) {
    const index = Math.floor(Math.random() * characters.length);
    name += characters[index];
  }
  if (memory.has(name)) return generateUsername();
  return name;
};
