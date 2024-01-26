'use strict';

class Entity {}
console.log('load 1-export');
const fn = (x) => x;

const collection = new Map();

module.exports = { Entity, fn, collection };
