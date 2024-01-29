'use strict';

const fs = require('node:fs');
const vm = require('node:vm');

const RUN_OPTIONS = { timeout: 5000, displayErrors: false };
//создать скрипт
//создать контекст
// запустить скрипт в контексте

module.exports = async (filePath, sendbox) => {
  const src = await fs.promises.readFile(filePath, 'utf8');
  const code = `'use strict';\n${src}`;
  const script = new vm.Script(code);
  const context = vm.createContext({ ...sendbox });
  const exported = script.runInContext(context, RUN_OPTIONS);
  return exported;
};
