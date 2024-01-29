'use strict';

// экспортировать функцию, которая создаёт сервер и возращает статику

const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');

const STATIC_PATH = path.join(process.cwd());

module.exports = (root, port) => {
  http
    .createServer(async (req, res) => {
      const url = req.url === '/' ? '/index.html' : req.url;
      const filePath = path.join(STATIC_PATH, root, url);
      const pathTraversal = !filePath.startsWith(STATIC_PATH);
      const exists = await fs.promises.access(filePath).then(
        () => true,
        () => false
      );
      const found = !pathTraversal && exists;
      const streamPath = found ? filePath : STATIC_PATH + '/static/404.html';
      const stream = fs.createReadStream(streamPath);
      stream.pipe(res);
    })
    .listen(port, () => {
      console.log(`API is listen. Port ${port}`);
    });
};
