'use strict';

const http = require('node:http');
const fs = require('node:fs');
const WebSocket = require('ws');

const PORT = 8000;
const index = fs.readFileSync('./index.html', 'utf8');

const server = http
  .createServer((req, res) => {
    res.writeHead(200);
    res.end(index);
  })
  .listen(PORT, () =>
    console.log(`Server is runing: http://localhost:${PORT}`)
  );

const ws = new WebSocket.Server({ server });

ws.on('connection', (connect) => {
  console.log('connect');
  connect.on('message', (data) => {
    for (const socket of ws.clients) {
      console.log(connect.id);
      // if (socket === connect) continue;
      if (socket.readyState !== WebSocket.OPEN) continue;
      socket.send(data, { binary: false });
    }
  });
  connect.on('close', (reasonCode, description) => {
    console.log({ reasonCode }, description.toString());
  });
});
