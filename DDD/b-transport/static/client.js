'use strict';

const transport = {};

transport.http = (url) => (structure) => {
  const api = {};
  const crud = {
    read: 'GET',
    create: 'POST',
    update: 'PUT',
    delete: 'DELETE',
  };
  const services = Object.keys(structure);
  for (const name of services) {
    const methods = Object.keys(structure[name]);
    api[name] = {};
    for (const method of methods) {
      api[name][method] = (...args) =>
        new Promise((resolve, reject) => {
          const urlBuild = [url, name];
          const index = structure[name][method].indexOf('id');
          if (index !== -1 && args[index]) urlBuild.push(args.shift(index));
          const urlParse = urlBuild.join('/');
          const params = [urlParse];
          const head = {
            method: crud[method],
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(...args),
          };
          if (crud[method] !== 'GET') params.push(head);
          fetch(...params).then((res) => {
            resolve(res.json());
          });
        });
    }
  }
  return Promise.resolve(api);
};

transport.ws = (url) => (structure) => {
  const socket = new WebSocket(url);
  const api = {};
  const services = Object.keys(structure);
  for (const name of services) {
    const methods = Object.keys(structure[name]);
    api[name] = {};
    for (const method of methods) {
      api[name][method] = (...args) =>
        new Promise((resolve, reject) => {
          const paket = { name, method, args };
          socket.send(JSON.stringify(paket));
          socket.addEventListener('message', (event) => {
            resolve(JSON.parse(event.data));
          });
        });
    }
  }
  return new Promise((resolve, reject) => {
    socket.addEventListener('open', (event) => {
      resolve(api);
    });
  });
};

const scaffold = (url) => {
  const protocol = url.startsWith('ws:') ? 'ws' : 'http';
  return transport[protocol](url);
};

(async () => {
  const api = await scaffold('http://localhost:8000')({
    city: {
      read: ['id'],
      create: ['record'],
      update: ['id', 'record'],
      delete: ['id'],
      query: ['sql', 'args'],
    },
    country: {
      read: ['id'],
      find: ['mask'],
      talk: ['msg'],
      delete: ['id'],
    },
    user: {
      read: ['id'],
      create: ['record'],
      update: ['id', 'record'],
      delete: ['id'],
    },
  });
  await api.user.update(14, {
    login: 'andromed1',
    password: 'pass',
  });
  const result = await api.user.read();
  console.table(result);
})();
