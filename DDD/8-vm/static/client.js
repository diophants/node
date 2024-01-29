const socket = new WebSocket('ws://localhost:8000');

const scaffold = (structure) => {
  const api = {};
  const services = Object.keys(structure);
  for (const serviceName of services) {
    api[serviceName] = {};
    const methods = Object.keys(structure[serviceName]);
    for (const methodName of methods) {
      api[serviceName][methodName] = (...args) =>
        new Promise((resolve, reject) => {
          const packet = { name: serviceName, method: methodName, args };
          socket.send(JSON.stringify(packet), { binary: false });
          socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            resolve(data);
          };
        });
    }
  }
  return api;
};

const api = scaffold({
  user: {
    read: ['id'],
    create: ['record'],
    update: ['id', 'record'],
    delete: ['id'],
    find: ['mask'],
  },
  country: {
    read: ['id'],
    delete: ['id'],
    find: ['mask'],
  },
});

socket.addEventListener('open', async (event) => {
  await api.country.delete(4);
  const data = await api.country.read();
  console.table(data);
});
