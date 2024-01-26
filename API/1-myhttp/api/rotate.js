'use strict';

const memory = require('../memory');

const rotate = (point, angle) => {
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  const { x, y } = point;
  point.x = x * cos - y * sin;
  point.y = x * sin + y * cos;
};

module.exports = (name, angle) => {
  const shape = memory.get(name);
  if (!shape) return 'Shape not found';
  for (const key in shape) {
    const point = shape[key];
    rotate(point, angle);
  }
  return 'Shape rotate!';
};
