'use strict';

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const assert = require('node:assert').strict;

const PORT = 8000;
const API_PATH = path.join(process.cwd(), '/api');
const index = fs.readFileSync('./index.html');

const api = new Map();

const cacheFile = (name) => {
  const filePath = path.join(API_PATH, name);
  const key = path.basename(name, '.js');
  try {
    const libPath = require.resolve(filePath);
    delete require.cache[libPath];
  } catch (e) {
    return new Error(`File ${name} no exists`);
  }
  try {
    const value = require(filePath);
    api.set(key, value);
  } catch (e) {
    api.delete(key);
  }
};

const cacheFolder = async () => {
  fs.readdir(API_PATH, (err, files) => {
    if (err) return;
    files.forEach(cacheFile);
  });
};
const watch = async () => {
  fs.watch(API_PATH, (err, file) => {
    if (err) return err;
    cacheFile(file);
  });
};

cacheFolder();
watch();

const prepareArgs = async (req) => {
  if (req.method === 'GET') return;
  const buffer = [];
  for await (const chunk of req) buffer.unshift(chunk);
  const data = Buffer.concat(buffer).toString();
  return JSON.parse(data);
};

const httpError = (res, status, message) => {
  res.writeHead(status);
  res.end(JSON.stringify(message));
};

const server = http
  .createServer(async (req, res) => {
    const url = req.url === '/' ? 'index.html' : req.url;
    const [first, second] = url.substring(1).split('/');
    if (first === 'api') {
      const method = api.get(second);
      const args = await prepareArgs(req);
      try {
        const result = method ? await method(...args) : Array.from(api.keys());
        res.end(JSON.stringify(result));
      } catch (err) {
        httpError(res, err.status || 500, err);
      }
    } else {
      res.writeHead(200);
      res.end(index);
    }
  })
  .listen(PORT, () =>
    console.log(`Server is running! http://localhost:${PORT}`)
  );

// Tests

const testCacheFile = (next) => {
  api.clear();
  cacheFile('generateId.js');
  let error = null;
  try {
    assert.ok(api.has('generateId'));
  } catch (err) {
    error = err;
  }
  next(error);
};

const testCacheFail = (next) => {
  api.clear();
  const err = cacheFile('gen.js');
  let error = null;
  try {
    assert.equal(err.message, 'File gen.js no exists');
  } catch (err) {
    error = err;
  }
  next(error);
};

// Run tests

const tests = [testCacheFile, testCacheFail];
let failed = 0;
const count = tests.length;
const log = [];

const runTest = () => {
  if (tests.length === 0) {
    console.log('\nTests:');
    log.forEach(console.dir);
    console.log(`Total: ${count}; Failed: ${failed}`);
    return;
  }

  const test = tests.shift();
  log.push(`Start test: ${test.name}`);

  try {
    test((err) => {
      if (err) {
        failed++;
        log.push(err);
        log.push(`Failed test: ${test.name}`);
      }
      log.push(`End test ${test.name}`);
    });
  } catch (err) {
    failed++;
    log.push(err);
    log.push(`Failed test: ${test.name}`);
  }
  setTimeout(runTest, 0);
};

runTest();
