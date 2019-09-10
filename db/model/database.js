import Sequelize from 'sequelize';
import logger from 'electron-log';

let db = null;
export function start(userId) {
  let res = Promise.resolve();
  if (db === null) {
    db = new Sequelize(userId, null, null, {
      dialect: 'sqlite',
      // dialectModule: '@journeyapps/sqlcipher',
      storage: 'new.db',
      // logging: (sql) => {
      //   logger.info(`${userId}.db execute ${sql}`);
      // },
      logging: false,
    });
    res = db.sync();
  }
  return res;
}

export function close() {
  db.close();
  db = null;
}

export function get() {
  return db;
}

export function transaction(callback) {
  return db.transaction(callback).catch((err) => logger.error('transaction failed', err));
}