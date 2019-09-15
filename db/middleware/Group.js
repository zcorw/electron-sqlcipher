import logger from 'electron-log';
import _ from 'lodash';
import { getModel } from '../model/model';
import { transaction } from '../model/database';
import { add as addQueue } from './writeQueue';

function toJSON(data) {
  return {
    groupId: data.groupId,
    masterId: data.masterId,
    name: data.name,
    headImgUrl: data.headImgUrl,
    status: data.status,
    verifyWay: data.verifyWay,
    totalUsers: data.totalUsers,
    type: data.type,
    isIngroup: data.isIngroup,
    version: data.version,
    pinyin: data.pinyin,
    isUndisturb: data.groupSet.isUndisturb,
    isHidden: data.groupSet.isHidden,
    roleId: data.groupSet.roleId,
  };
}

/**
 * 好友API
 * @exports
 * @field {Function} getAllFriend 获取所有联系人
 * @field {Function} getUserById 根据用户ID获取联系人
 * @param {string} userId 用户id
 * @field {Function} saveOrUpdate 保存或更新多个联系人
 * @param {Array} users 联系人信息
 * @field {Function} update 修改联系人信息
 * @param {string} userId 联系人ID
 * @param {object} data 联系人信息 {userBase, contact}
 * @field {Function} removeOne 删除一条联系人信息
 * @param {string} userId 联系人ID
 */
const self = {
  /**
   * 添加一组群组
   *
   * @param {*} list
   * list = [
   *  {
   *    group_id,
   *    head_img_url,
   *    status,
   *    name,
   *    verify_name,
   *    total_users,
   *    type,
   *    is_ingroup,
   *    to_user: {
   *      is_undisturb,
   *      is_hidden,
   *      role_id,
   *    }
   *  }
   * ]
   */
  async saveOrUpdate(list) {
    const GroupSet = await getModel('groupSet');
    const GroupBase = await getModel('groupBase');
    const groupIds = list.map(({ groupBase }) => groupBase.groupId);
    console.log('TCL: saveOrUpdate -> groupIds', groupIds);
    const destroy = (t) => {
      return [
        GroupSet.destroy({
          where: { groupId: groupIds },
          transaction: t,
        }),
        GroupBase.destroy({
          where: { groupId: groupIds },
          transaction: t,
        }),
      ];
    };
    const save = (t) => {
      const base = [];
      const set = [];
      _.forEach(list, (group) => {
        base.push(group.groupBase);
        set.push(group.groupSet);
      });
      return [
        GroupBase.bulkCreate(base, {
          transaction: t,
        }),
        GroupSet.bulkCreate(set, {
          transaction: t,
        }),
      ];
    };
    try {
      transaction((t) => {
        return Promise.all(destroy())
          .then(() => Promise.all(save()))
          .catch((e) => console.log(e));
      });
    } catch (e) {
      logger.error('Model Groups action saveOrUpdate error:', e);
      throw e;
    }
  },
  async getAllGroup() {
    const GroupBase = await getModel('groupBase');
    const GroupSet = await getModel('groupSet');
    let result;
    try {
      result = await GroupBase.findAll({ include: [{ model: GroupSet }] });
    } catch (e) {
      logger.error('Model Groups action getAllGroup error:', e);
      throw e;
    }
    return result && result.map((group) => toJSON(group.toJSON()));
  },
  async getGroupById(groupId) {
    const GroupBase = await getModel('groupBase');
    const GroupSet = await getModel('groupSet');
    let result;
    try {
      result = await GroupBase.findByPk(groupId, { include: [{ model: GroupSet }] });
    } catch (e) {
      logger.error('Model Groups action getGroupById error:', e);
      throw e;
    }
    return toJSON(result.toJSON());
  },
  async getGroupsById(groupIds) {
    const GroupBase = await getModel('groupBase');
    const GroupSet = await getModel('groupSet');
    let result;
    try {
      result = await GroupBase.findAll({ where: { groupId: groupIds }, include: [{ model: GroupSet }] });
    } catch (e) {
      logger.error('Model Groups action getGroupsById error:', e);
      throw e;
    }
    return result && result.map((group) => toJSON(group.toJSON()));
  },
  /**
   * 修改群组资料
   *
   * @param {*} data
   * data = {
   *    groupId,
   *    headImgUrl,
   *    status,
   *    name,
   *    verifyName,
   *    totalUsers,
   *    type,
   *    isIngroup,
   *    isUndisturb,
   *    isHidden,
   *    roleId,
   *  }
   */
  async updateGroup(data, groupId) {
    const GroupBase = await getModel('groupBase');
    const GroupSet = await getModel('groupSet');
    let groupBase = await GroupBase.findByPk(groupId, { include: [{ model: GroupSet }] });
    let result = null;
    if (groupBase) {
      const groupSet = await groupBase.getGroupSet();
      Object.assign(groupBase, data.groupBase);
      Object.assign(groupSet, data.groupSet);
      result = toJSON(groupBase.toJSON());
      try {
        transaction((t) => {
          return Promise.all([
            groupBase.save({
              transaction: t,
            }),
            groupSet.save({
              transaction: t,
            }),
          ]);
        });
      } catch (e) {
        logger.error('Model Groups action updateGroup error:', e);
        throw e;
      }
    }
    return result;
  },
  // 删除群组
  async removeGroup(groupId) {
    const GroupBase = await getModel('groupBase');
    const GroupSet = await getModel('groupSet');
    try {
      transaction((t) => {
        return Promise.all([
          GroupBase.destroy({
            where: { groupId },
            transaction: t,
          }),
          GroupSet.destroy({
            where: { groupId },
            transaction: t,
          }),
        ]);
      });
    } catch (e) {
      logger.error('Model Groups action removeGroup error:', e);
      throw e;
    }
  },
  // 被踢出群
  async kitoutGroup(groupId) {
    const GroupBase = await getModel('groupBase');
    try {
      await GroupBase.update({ isIngroup: 0 }, { where: { groupId } });
    } catch (e) {
      logger.error('Model Groups action kitoutGroup error:', e);
      throw e;
    }
  },
  async getMaster(groupId) {
    const GroupSet = await getModel('groupSet');
    let result;
    try {
      const group = await GroupSet.findByPk(groupId);
      result = group ? group.roleId === 10 : false;
    } catch (e) {
      logger.error('Model Groups action kitoutGroup error:', e);
      throw e;
    }
    return result;
  },
};

export default self;
