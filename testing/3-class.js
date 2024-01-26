'use strict';

const assert = require('node:assert').strict;
const { EventEmitter } = require('node:events');

// класс Task
// при создании задачи, выполняется конструктор родительского класса.
// Устанавливаем name, set, clear, exec, running, count, timer, time
// getter active возвращает bool, истёк ли таймер

class Task extends EventEmitter {
  constructor(name, time, exec) {
    super();
    this.name = name;
    this.set = setTimeout;
    this.clear = clearTimeout;
    this.exec = exec;
    this.running = false;
    this.count = 0;
    this.timer = null;
    if (typeof time === 'number') {
      this.time = Date.now() + time;
      return;
    }

    this.time = new Date(time).getTime();
  }

  get active() {
    return !!this.timer;
  }
  // start.
  // стопаем
  // если задача запущена, выходим
  // если время истекло, выходим
  // ранаем задачу в set, устанавливаем time, присваиваем переменной timer
  // выходим
  start() {
    this.stop();
    if (this.running) return false;
    const time = this.time - Date.now();
    if (time < 0) return false;
    this.timer = this.set(() => {
      this.run();
    }, time);
    return true;
  }

  // stop
  // если экземпляр не активен или он запущен, выходим
  // стираем таймер
  // забываем переменную timer
  // выходим
  stop() {
    if (!this.active || this.running) return false;
    this.clear(this.timer);
    this.timer = null;
    return true;
  }

  // run
  // если не активен или запущен, выходим
  // определяем экземпляр запущенным
  // выполняем exec с callback(err, res) если ошибка, то эмитаем его (название события, ошибка, this)
  // увеличиваем count
  // забываем running
  // выходим
  run() {
    if (!this.active || this.running) return false;
    this.running = true;
    this.exec((err, res) => {
      if (err) this.emit('error', err, this);
      this.count++;
      this.running = false;
    });
    return true;
  }
}

class Scheduler extends EventEmitter {
  //создаём структура задач
  constructor() {
    super();
    this.tasks = new Map();
  }

  // task.
  // возвращаем новую запущенную задачу

  // стопаем
  // экземпляр
  // структура
  // слушатель/эмит
  // старт
  //
  task(name, time, exec) {
    this.stop(name);
    const task = new Task(name, time, exec);
    this.tasks.set(name, task);
    task.on('error', (err) => {
      this.emit('error', err, task);
    });
    task.start();
    return task;
  }

  // stop
  // вытаскиваем, стопаем, удаляем
  stop(name) {
    const task = this.tasks.get(name);
    if (task) {
      task.stop();
      this.tasks.delete(name);
    }
  }
  // stopAll
  stopAll() {
    for (const name of this.tasks.keys()) this.stop(name);
  }

  taskList() {
    return this.tasks.keys();
  }
}

//Tests

// Создаём задачу
// таймер утверждает ошибку через 200 ms
// утверждаем ошибку и вызываем следующую функцию
// создаём и моментально выполняем задачу '2019-04-16T18:30Z'
// объявляем переменную error
// ожидаем размер структуры задач = 1
// при отлове ошибки присваиваем инстанс ошибки к переменной
// в финале очищаем timeout переходим к следующей функции
const testCreateTask = (next) => {
  const timer = setTimeout(() => {
    const err = new Error('Can not create task');
    assert.equal(err.message, 'Can not execute task');
    next(err);
  }, 200);

  const scheduler = new Scheduler();

  scheduler.task('name1', '2019-04-16T18:30Z', (done) => {
    done(null, 'task successed');
  });

  let error = null;

  try {
    assert.equal(scheduler.tasks.size, 1);
  } catch (err) {
    next(err);
  }
  clearTimeout(timer);
  next();
};

const testExecuteTask = (next) => {
  const timer = setTimeout(() => {
    const err = new Error('Can not execute task');
    next(err);
  }, 200);

  const scheduler = new Scheduler();

  scheduler.task('name1', 100, (done) => {
    let error = null;
    try {
      assert.ok(scheduler.tasks.get('name1').running);
    } catch (err) {
      error = err;
    }
    clearTimeout(timer);
    done(null, 'task successed');
    scheduler.stopAll();
    next(error);
  });
};

const testFailedTask = (next) => {
  const timer = setTimeout(() => {
    const err = new Error('Task expected to fail');
    assert.equal(err.message, 'Can not execute task');
    next(err);
  }, 200);

  const scheduler = new Scheduler();

  scheduler.task('name1', 100, (done) => {
    done(new Error('Task failed'));
  });

  scheduler.on('error', (err, task) => {
    let error = null;
    try {
      assert.ok(task.running);
      assert.strictEqual(err.message, 'Task failed');
    } catch (err) {
      error = err;
    }
    clearTimeout(timer);
    scheduler.stopAll();
    next(error);
  });
};

// Execute tests

// формируем список задач
// failed
// count
const tests = [testCreateTask, testExecuteTask, testFailedTask];

let failed = 0;
const count = tests.length;

// runNext
// если счётчик пустой, выводим в консоль Total и Failed
// выходим из процесса (1 of 2)
const runNext = () => {
  if (tests.length === 0) {
    console.log(`Total: ${count}; Failed: ${failed}`);
    process.exit(failed > 0 ? 1 : 0);
  }

  // вытаскиваем верхний тест из списка
  // log started test
  // пробуем выполнить тест с колбэком err, если ошибка присутствует то увеличиваем failed, выводим в консоль
  // log finish test, вызываем nextTest на следующем eventLoop
  // отлавливае ошибку повторяем log ошибки
  const test = tests.shift();
  console.log(`Started test: ${test.name}`);
  try {
    test((err) => {
      if (err) {
        failed++;
        console.log(`Failed test: ${test.name}`);
        console.log(err);
      }
      console.log(`Finished test: ${test.name}`);
      setTimeout(runNext, 0);
    });
  } catch (err) {
    failed++;
    console.log(`Failed test: ${test.name}`);
    console.log(err);
    setTimeout(runNext, 0);
  }
};

runNext();
