"use strict";

const http = require("node:http");
const path = require("node:path");
const fs = require("node:fs");

const api = new Map();

const apiPath = "./api/";

console.log(path.basename(`${apiPath}index.js`, ".js"));

// поместить все методы api в структуру map
const cacheFile = (name) => {
  const filePath = apiPath + name;
  const key = path.basename(filePath, ".js");
  try {
    const libPath = require.resolve(filePath);
    delete require.cache[libPath];
  } catch (e) {
    return;
  }
  try {
    const method = require(filePath);
    api.set(key, method);
  } catch (e) {
    api.delete(key);
  }
};

// Помещяем все файлы папки в структуру
fs.readdir(apiPath, (err, files) => {
  if (err) return;
  files.forEach(cacheFile);
});

// Отслеживаем изменения в файлах и помещаем в структуру
fs.watch(apiPath, (event, file) => {
  console.log("update", file);
  cacheFile(file);
});

// setTimeout(() => {
//   console.dir({ api });
// }, 1000);

// Парсим буфер по чанкам, формируем аргументы из запроса
const receiveArgs = async (req) => {
  const buffers = [];
  for await (const chunk of req) {
    buffers.unshift(chunk);
  }
  const data = Buffer.concat(buffers).toString();
  return JSON.parse(data);
};

// обработка ошибки
const httpError = (res, status, message) => {
  res.statusCode = status;
  res.end(`"${message}"`);
};

// вытаскиваем метод из структуры
// выполняем метод с аргументами
// обработка ошибки, возврат ответа
http
  .createServer(async (req, res) => {
    const url = req.url === "/" ? "/index.html" : req.url;
    const [first, second] = url.substring(1).split("/");
    if (first === "api") {
      const method = api.get(second);
      const args = await receiveArgs(req);
      try {
        const result = await method(...args);
        if (!result) {
          httpError(res, 500, "Server error");
          return;
        }
        res.end(JSON.stringify(result));
      } catch (err) {
        console.dir({ err });
        httpError(res, 500, "Server error");
      }
    } else {
      const path = `./static${url}`;
      console.log(path);
      try {
        const data = await fs.promises.readFile(path);
        res.end(data);
      } catch (err) {
        httpError(res, 404, "File is not found");
      }
    }
  })
  .listen(8000);
