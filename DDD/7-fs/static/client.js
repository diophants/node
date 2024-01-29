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
  },
});

socket.addEventListener('open', async (event) => {
  await api.user.delete(6);
  await api.user.delete(7);
  await api.user.create({ login: 'massa', password: 'box' });
  await api.user.update(3, { login: 'clawles', password: '5rp' });
  const data = await api.user.read();
  console.table(data);
});
