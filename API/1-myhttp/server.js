'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const STATIC_PATH = path.join(process.cwd(), './static');
const PORT = 8000;

const api = new Map();
const apiPath = './api/';

const cacheFile = (name) => {
  const filePath = apiPath + name;
  const key = path.basename(filePath, '.js');
  try {
    const libPath = require.resolve(filePath);
    delete require.cache[libPath];
  } catch (e) {
    return;
  }
  try {
    const value = require(filePath);
    api.set(key, value);
  } catch (e) {
    api.delete(key);
  }
};

fs.readdir(apiPath, (err, files) => {
  for (const file of files) {
    cacheFile(file);
  }
});

fs.watch(apiPath, (err, file) => {
  cacheFile(file);
});

const parseArgs = async (req) => {
  const buffer = [];
  for await (const chunk of req) buffer.unshift(chunk);
  const args = Buffer.concat(buffer).toString();
  return JSON.parse(args);
};

const httpError = (res, status, message) => {
  res.statusCode = status;
  res.end(JSON.stringify(message));
};

http
  .createServer(async (req, res) => {
    const url = req.url === '/' ? '/index.html' : req.url;
    const [first, second] = url.substring(1).split('/');
    if (first === 'api') {
      const method = api.get(second);
      const args = await parseArgs(req);
      try {
        const result = await method(...args);
        if (!result) return;
        res.end(JSON.stringify(result));
      } catch (err) {
        httpError(res, 500, err);
      }
    } else {
      const filePath = path.join(STATIC_PATH, url);
      const exists = fs.promises.access(filePath).then(
        () => true,
        () => false
      );
      const streamPath = exists ? filePath : STATIC_PATH + '404.html';
      const stream = fs.createReadStream(streamPath);
      stream.pipe(res);
    }
  })
  .listen(PORT, () =>
    console.log(`Server is running: http://localhost:${PORT}`)
  );
