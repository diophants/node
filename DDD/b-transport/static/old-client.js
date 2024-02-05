const socket = new WebSocket('ws://localhost:8000');

const TRANSPORT = 'ws';
const crud = { read: 'GET', create: 'POST', update: 'PUT', delete: 'DELETE' };

const scaffold = (url, structure) => {
  const api = {};
  const services = Object.keys(structure);
  for (const serviceName of services) {
    api[serviceName] = {};
    const methods = Object.keys(structure[serviceName]);
    for (const methodName of methods) {
      api[serviceName][methodName] = (...args) =>
        new Promise((resolve, reject) => {
          if (url === 'http') {
            const isNum = typeof args[0] === 'number';
            const id = isNum ? args[0] : '';
            const urlFetch = `http://localhost:8000/${serviceName}/${id}`;
            const method = crud[methodName];
            const body = {
              method,
              headers: { 'Content-type': 'application/json' },
              body: JSON.stringify(...args),
            };
            const argsReq = [];
            argsReq.push(urlFetch);
            if (method !== 'GET') argsReq.push(body);
            fetch(...argsReq).then((data) => {
              resolve(data.json());
            });
          }
          if (url === 'ws') {
            const packet = { name: serviceName, method: methodName, args };
            socket.send(JSON.stringify(packet), { binary: false });
            socket.onmessage = (event) => {
              const data = JSON.parse(event.data);
              resolve(data);
            };
          }
        });
    }
  }
  return api;
};

const api = scaffold(TRANSPORT, {
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

const run = async (url) => {
  if (url === 'http') {
    const data = await api.user.read();
    console.log(data);
  }
  if (url === 'ws') {
    socket.addEventListener('open', async (event) => {
      const data = await api.country.read();
      console.table(data);
    });
  }
};

run(TRANSPORT);
