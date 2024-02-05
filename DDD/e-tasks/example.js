const fastify = require('fastify')();

fastify.get('/user/:id', async (req, res) => {
  const args = req.body;
  console.log(args);
  res.send({
    method: 'get',
    url: '/user/:id',
    args,
  });
});

const method = 'post';
const path = 'city';

fastify[method](`/${path}/:id`, async (req, res) => {
  const args = req.body;
  console.log(args);
  res.send({
    method: 'post',
    url: '/user/:id',
    args,
  });
});

fastify.listen({ port: 8000 }, () => {
  console.log('Server run');
});
