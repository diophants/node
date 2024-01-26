'use strict';

const modulePath = require.resolve('./1-export.js');
console.log(require.cache[modulePath]);
delete require.cache[modulePath];
console.log(require.cache[modulePath]);

const ws = require('ws');
console.log(Object.keys(require.cache));
