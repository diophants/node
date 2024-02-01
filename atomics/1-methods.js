'use strict';

const buffer = new SharedArrayBuffer(40);
const array = new Int32Array(buffer);

console.log('Store: ', Atomics.store(array, 5, 128));
console.log('Load: ', Atomics.load(array, 5));
console.log(`Add: (prev ${Atomics.add(array, 5, 128)}), (next ${array[5]})`);
console.log(`Sub: (prev ${Atomics.sub(array, 5, 128)}), (next ${array[5]})`);

Atomics.xor(array, 4, 0b11110000);
console.log('Xor: ', array[4].toString(2));

Atomics.or(array, 4, 0b1111);
console.log('Or: ', array[4].toString(2));

Atomics.and(array, 4, 0b10101010);
console.log('And: ', array[4].toString(2));

Atomics.exchange(array, 3, 111);
console.log('Exchange: ', array[3]);

Atomics.compareExchange(array, 3, 111, 222);
Atomics.compareExchange(array, 3, 223, 333);
console.log('compareExchange: ', array[3]);
