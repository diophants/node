const m1 = import('package1');
const m2 = import('package1/utils.mjs');

Promise.all([m1, m2]).then((res) => console.log(res));
