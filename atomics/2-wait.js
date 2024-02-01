'use strict';
// Atomics.wait(typedArray, index, value, [timeout])
// Returns: 'ok' | 'not-equal' | 'time-out'

const buffer = new SharedArrayBuffer(40);
const array = new Int32Array(buffer);

const w1 = Atomics.wait(array, 5, 0, 1000);
console.log({ w1 });

const w2 = Atomics.wait(array, 5, 1);
console.log({ w2 });

setTimeout(() => {
  Atomics.store(array, 5, 128);
  Atomics.notify(array, 5, 1); // Объявляем всем процессам о 5-м индексе массива. 3-й аргумент - кол-во объявляемым процессам
}, 2000);

console.log('\n', array);
