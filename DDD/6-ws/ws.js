'use strict';

// сокет роутит запрос и возвращает ответ

const { Server } = require('ws');

module.exports = (routing, port) => {
  const ws = new Server({ port });

  ws.on('connection', (connected, res) => {
    const id = res.socket.remoteAddress;
    connected.on('message', async (data) => {
      const { name, method, args } = JSON.parse(data);
      const entity = routing[name];
      if (!entity)
        return void connected.send(JSON.stringify(`Not fount ${name}`), {
          binary: false,
        });
      const handling = entity[method];
      if (!handling)
        return void connected.send(
          JSON.stringify(`Not fount ${name}. Method: ${method}`),
          { binary: false }
        );
      const result = await handling(...args);
      connected.send(JSON.stringify(result), { binary: false });
    });
  });
  console.log(`API is listen. Port ${port}`);
};
