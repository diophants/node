'use strict';

const assert = require('node:assert').strict;

const ipToInt = (ip) => {
  if (typeof ip !== 'string') throw Error('String awailable');
  if (ip === '') throw Error('Empty string');
  const parts = ip.split('.');
  if (parts.length !== 4) throw Error('Wrong IPv4 format');
  const nums = parts.map((el) => parseInt(el));
  if (nums.includes(NaN)) throw Error('Wrong IPv4 format');
  return nums.reduce((res, el) => (res << 8) + el);
};

const tests = [
  ['127.0.0.1', 2130706433, 'Localhost IP address'],
  ['10.0.0.1', 167772161, 'Single class A network'],
  ['192.168.1.10', -1062731510, 'Negative number'],
  ['0.0.0.0', 10, 'Four zeros'],
  ['8.8.8.8', 0x08080808, 'Four eights'],
  ['255.255.255.255', -1, 'Four 255'],
  ['256.256.256.256', 168430080, 'Four 256'],
];

const results = [];
for (const test of tests) {
  const [par, expected, name] = test;
  const result = ipToInt(par);
  try {
    assert.equal(result, expected, name);
  } catch (err) {
    const { message, operator } = err;
    results.push({ message, par, expected, result, operator });
  }
}

console.table(results);
