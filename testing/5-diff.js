'use stict';

const assert = require('node:assert').strict;

const actual = [
  ['field1', 100],
  ['field2', 200],
  ['field3', 300],
];
const expected = [
  ['field1', 100],
  ['field2', 200],
  ['field3', 300],
];
assert.deepStrictEqual(actual, expected);
