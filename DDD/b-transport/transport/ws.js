'use strict';

const { Server } = require('ws');

module.exports = (routing, port, console) => {
  const ws = new Server({ port });

  ws.on('connection', (connected, req) => {
    const ip = req.socket.remoteAddress;
    console.log(`Connected: ${ip}`);

    connected.on('message', async (event) => {
      const { name, method, args = [] } = JSON.parse(event);
      const entity = routing[name];
      if (!entity)
        connected.send(JSON.stringify(`Not found ${name}`, { binary: false }));
      const handling = entity[method];
      if (!handling)
        connected.send(
          JSON.stringify(`Not found ${name}, ${method}`, { binary: false })
        );
      const json = JSON.stringify(args);
      const parameters = json.substring(1, json.length - 1);
      console.log(`${ip} ${name}.${method}(${parameters})`);
      try {
        const result = await handling(...args);
        connected.send(JSON.stringify(result.rows), { binary: false });
      } catch (err) {
        connected.send(JSON.stringify('Server error'), { binary: false });
      }
    });
  });

  console.log(`API on port ${port}`);
};
