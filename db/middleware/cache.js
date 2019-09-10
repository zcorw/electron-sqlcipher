/* eslint-disable no-underscore-dangle */
import _ from 'lodash';
import { transaction } from '../model/database';
import { add as addQueue } from './writeQueue';

export const factery = (cacheMax) => {
  /**
   * 缓存队列
   * @field cache {object} 缓存数据
   * @field queue {Array} 数据加入队列，按加入顺序保存id
   * @field length {number} 数据长度
   * @field add {Function} 添加数据
   * @param id {string} 对应ID
   * @param user {object} User类实例
   * @field remove {Function} 移除数据
   * @param id {string} 对应ID
   * @field has {Function} 数据是否存在
   * @param id {string} 对应ID
   * @field get {Function} 获取数据
   * @param id {string} 对应ID
   * @field organize {Function} 队列整理，如果队列长度超过cacheMax，清除旧数据
   */
  const cache = {
    cache: {},
    queue: [],
    length: 0,
    add(id, user) {
      if (this.has(id)) {
        this.cache[id] = user;
      } else {
        this.cache[id] = user;
        this.queue.push(id);
        this.length += 1;
        this.organize();
      }
    },
    remove(id) {
      const { queue } = this;
      if (queue[id]) {
        _.remove(queue, id);
        this.cache[id].remove();
        delete queue[id];
        this.length -= 1;
      }
    },
    has(id) {
      return !!this.cache[id];
    },
    get(id) {
      return this.cache[id];
    },
    organize() {
      if (this.length > cacheMax) {
        const clearUserId = this.queue.splice(0, this.length - cacheMax);
        clearUserId.forEach((id) => {
          this.cache[id].remove();
          delete this.cache[id];
        });
        this.length = this.queue.length;
      }
    },
  };
  return cache;
};

export const control = (createModel, cacheQueue, CacheClase) => {
  /**
   * 从缓存或数据库获取用户数据
   * @param {string} id 对应id
   */
  async function get(id) {
    if (cacheQueue.has(id)) {
      return cacheQueue.get(id);
    }
    const { Info } = await createModel();
    const info = await Info.findByPk(id);
    if (info === null) {
      return null;
    }
    const base = await info.getUserBase();
    const user = new CacheClase(id, base, info);
    setTimeout(() => cacheQueue.add(id, user));
    return user;
  }
  /**
   * 创建用户数据并写入数据库
   * @param {object} base 基础信息
   * @param {object} info 详细信息
   */
  async function create(id, base, info) {
    const { Info, Base } = await createModel();
    const infoInstances = Info.build(info);
    const baseInstances = Base.build(base);

    const cache = new CacheClase(id, infoInstances, baseInstances);
    cacheQueue.add(id, cache);
    addQueue(() => {
      return transaction((t) => {
        return Promise.all([infoInstances.save({ transaction: t }), baseInstances.save({ transaction: t })]);
      });
    });
    return cache;
  }
  /**
   * 修改用户数据并更新数据库
   * @param {object} cache User类实例
   * @param {object} data 要更新的数据
   * @field {object} base 用户基础信息
   * @field {object} info 联系人信息
   */
  async function update(cache, base, info) {
    let infoInstances;
    let baseInstances;
    const instances = [];
    if (base) {
      baseInstances = cache.updateBase(base);
      instances.push(baseInstances);
    }
    if (info) {
      infoInstances = cache.updateInfo(info);
      instances.push(infoInstances);
    }

    addQueue(() => {
      return transaction((t) => {
        return Promise.all(instances.map((instance) => instance.save({ transaction: t })));
      });
    });
    return cache;
  }
  return { get, create, update };
};