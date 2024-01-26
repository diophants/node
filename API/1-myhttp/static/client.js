'use strict';

//создаём структуру методов
// каждый метод промис с результатом api
const buildAPI = (methods) => {
  const api = {};
  for (const method of methods) {
    api[method] = (...args) =>
      new Promise((resolve, reject) => {
        const url = `/api/${method}`;
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(args),
        })
          .then((res) => {
            if (res.status !== 200)
              reject(new Error(`Status code ${res.status}`));
            resolve(res.json());
          })
          .catch((res) => {
            reject(res);
          });
      });
  }
  return api;
};

const api = buildAPI(['move', 'read', 'rect', 'render', 'resize', 'rotate']);

const show = async (name) => {
  const svg = await api.render(name);
  const output = document.getElementById('output');
  output.innerHTML = svg;
};

const scenario = async () => {
  await api.rect('Rect1', -10, 10, 10, -10);
  await api.move('Rect1', 5, 5);
  await api.rotate('Rect1', 5);
  await api.resize('Rect1', 1.2);
  const data = await api.read('Rect1');
  console.dir({ data });
  show('Rect1');
};

scenario();
