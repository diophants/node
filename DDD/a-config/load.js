'use strict';

const fs = require('node:fs');
const vm = require('node:vm');

module.exports = (options) => async (filePath, sendbox) => {
  const src = await fs.promises.readFile(filePath, 'utf8');
  const code = `'use strict';\n${src}`;
  const script = new vm.Script(code);
  const context = vm.createContext({ ...sendbox });
  const exported = script.runInContext(context, options);
  return exported;
};
