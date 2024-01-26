'use strict';

const memory = require('../memory.js');

module.exports = (name) => {
  const shape = memory.get(name);
  if (!shape) return 'Shape not found';
  return shape;
};
