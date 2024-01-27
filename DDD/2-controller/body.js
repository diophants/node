'use strict';

const receivedArgs = async (req) => {
  const buffer = [];
  for await (let chunk of req) buffer.push(chunk);
  const res = Buffer.concat(buffer).toString();
  return JSON.parse(res);
};

module.exports = receivedArgs;
