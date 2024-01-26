{
  const exp = require('./1-export.js');
  const expPath = require.resolve('./1-export.js');
  const expModule = require.cache[expPath];
  console.log({ exp, expPath, expModule });
}
{
  const exp = require('node:events');
  const expPath = require.resolve('node:events');
  const expModule = require.cache[expPath];
  console.log({ exp, expPath, expModule });
}
