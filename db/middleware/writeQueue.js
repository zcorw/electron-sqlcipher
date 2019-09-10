/**
 * 数据库写入队列
 * 为防止短时间大量写入操作，对写入操作执行一个节流
 * 控制指定时间段内执行只执行指定数量的 sql 语句
 * 时间长度 20ms 执行语句数 50
 * @author william
 */
import logger from 'electron-log';

let queue = []; // 语句队列
let timer = null; // 计时器

const duration = 20; // 队列执行时间间隔
const oneExeLen = 50; // 单次执行语句数量

/**
 * 执行 sql 语句
 */
async function execute() {
  if (queue.length === 0) {
    timer = null;
    return null;
  }
  const _queue = queue.splice(0, oneExeLen);
  try {
    await Promise.all(_queue.map((sql) => sql()));
  } catch (e) {
    logger.error('database write failed', e);
  }
  timer = setTimeout(execute, duration);
  return true;
}

export async function startTimer() {
  if (timer) {
    return null;
  }
  execute();
}
/**
 * 将 sql 语句加入队列
 *
 * @export
 * @param {Function} sql
 */
export function add(sql) {
  if (typeof sql !== 'function') {
    throw Error('The argument must be a function');
  }
  queue.push(sql);
  startTimer();
}
/**
 * 停止队列并清空队列，用于数据库被关闭
 *
 * @export
 */
export function stop() {
  clearTimeout(timer);
  timer = null;
  queue = [];
}