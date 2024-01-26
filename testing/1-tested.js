'use strict';

const assert = require('node:assert').strict;

const ipToInt = (id) => {
  if (typeof id !== 'string') throw Error('String expected!');
  if (id === '') throw Error('Empty is not allowed!');
  const parts = id.split('.');
  if (parts.length !== 4) throw Error('Wrong IPv4 format');
  const nums = parts.map((n) => parseInt(n, 10));
  if (nums.includes(NaN)) throw Error('Wrong IPv4 format');
  return nums.reduce((res, item) => (res << 8) + item);
};

const testFourZero = () => {
  const n = ipToInt('0.0.0.0');
  assert.equal(n, 0, 'Four zeros');
};

const testPrivateNetwork = () => {
  const n = ipToInt('10.0.0.1');
  assert.equal(n, 167772161, 'Single class A network');
};

const testLocalhost = () => {
  const n = ipToInt('127.0.0.1');
  assert.equal(n, 2130706433, 'localhost IP address');
};

const testNegativeNumber = () => {
  const n = ipToInt('192.168.1.10');
  assert.equal(n, -1062731510, 'Negative number');
};

const testFourEights = () => {
  const n = ipToInt('8.8.8.8');
  assert.equal(n, 0x08080808, 'four eights');
};

const testWrongString = () => {
  try {
    const n = ipToInt('wrong-string');
  } catch (err) {
    assert.equal(err.message, 'Wrong IPv4 format', 'Wrong string');
  }
};

const testEmptyString = () => {
  try {
    const n = ipToInt('');
  } catch (err) {
    assert.equal(err.message, 'Empty is not allowed!', 'empty string');
  }
};

const tests = [
  testFourZero,
  testPrivateNetwork,
  testLocalhost,
  testNegativeNumber,
  testFourEights,
  testWrongString,
  testEmptyString,
];

for (const test of tests) {
  try {
    test();
  } catch (err) {
    console.log(err);
  }
}
