'use strict';

const memory = require('../memory.js');

const resize = (point, k) => {
  let { x, y } = point;
  x = x * k;
  y = y * k;
  point.x = x;
  point.y = y;
};

module.exports = (name, k) => {
  const shape = memory.get(name);
  if (!shape) return 'Shape not found';
  for (const key in shape) {
    const point = shape[key];
    resize(point, k);
  }
  return 'Shape is resize!';
};
