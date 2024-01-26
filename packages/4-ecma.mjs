const m1 = await import('module');
import m2 from 'module';
console.log({ m1, m2 });

import { createRequire } from 'module';
const p4 = await import('package4');
console.log(p4);

const require = createRequire(import.meta.url);

const p5 = require('package4');
console.log(p5);
