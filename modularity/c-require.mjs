import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const export1 = require('./1-export.js');

const modulePath = require.resolve('./1-export.js');
const moduleCache = require.cache[modulePath];

console.log(moduleCache);
