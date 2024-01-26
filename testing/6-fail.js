'use strict';

const assert = require('node:assert').strict;

const fn = (willFail, callback) => {
  setTimeout(() => {
    if (willFail) callback(new Error('no data available'));
    else callback(null, 'Data available');
  }, 0);
};

fn(true, (err) => {
  assert.ifError(err);
});
