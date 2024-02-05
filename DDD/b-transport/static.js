'use strict';

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const toBool = [() => true, () => false];

module.exports = (root, port, console) => {
  const staticPath = path.join(process.cwd(), root);
  http
    .createServer(async (req, res) => {
      const url = req.url === '/' ? '/index.html' : req.url;
      const filePath = path.join(staticPath, url);
      const pathTraversal = !filePath.startsWith(staticPath);
      const exists = await fs.promises.access(filePath).then(...toBool);
      const found = !pathTraversal && exists;
      const streamPath = found ? filePath : staticPath + '/404.html';
      const stream = fs.createReadStream(streamPath);
      stream.pipe(res);
    })
    .listen(port);

  console.log(`Static on port ${port}`);
};
