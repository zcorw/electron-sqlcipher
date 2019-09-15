import _ from 'lodash';
import { getModel } from '../model/model';
import { transaction } from '../model/database';
import { add as addQueue } from './writeQueue';

function toJSON(data) {
  return {
    groupId: data.groupId,
    userId: data.userId,
    joinType: data.joinType,
    // nickName: data.nickName,
    mid: data.userBase.mid,
    headImgUrl: data.userBase.headImgUrl,
    nickName: data.userBase.nickName,
    publicKey: data.userBase.publicKey,
    countryCode: data.userBase.countryCode,
    mobile: data.userBase.mobile,
    email: data.userBase.email,
    registerType: data.userBase.registerType,
    version: data.userBase.version,
    gender: data.userBase.gender,
    job: data.userBase.job,
    birthday: data.userBase.birthday,
    signature: data.userBase.signature,
    name: data.userBase.name,
  };
}

const self = {
  async saveOrUpdate(groupId, groupMembers) {
    const userIds = groupMembers.map(({ userBase }) => userBase.userId);
    const GroupMember = await getModel('groupMember');
    const UserBase = await getModel('userBase');
    const destroy = (t) => {
      return [
        UserBase.destroy({
          where: { userId: userIds },
          transaction: t,
        }),
        GroupMember.destroy({
          where: { groupId: groupId },
          transaction: t,
        }),
      ];
    };
    const save = (t) => {
      const base = [];
      const member = [];
      _.forEach(groupMembers, (user) => {
        base.push(user.userBase);
        member.push(user.groupMember);
      });
      return [
        UserBase.bulkCreate(base, {
          transaction: t,
        }),
        GroupMember.bulkCreate(member, {
          transaction: t,
        }),
      ];
    };
    await transaction((t) => {
      return Promise.all(destroy(t)).then(() => Promise.all(save(t)));
    });
  },
  /**
   * 设置群成员
   *
   * @param {*} userId
   * @param {*} groupId
   * @returns promise
   */
  async set(userId, groupId, userBase, member) {
    const GroupMember = await getModel('groupMember');
    const UserBase = await getModel('userBase');
    const user = await GroupMember.findOne({ where: { userId, groupId }, include: [{ model: UserBase }] });
    let res;
    if (user) {
      const baseModel = await user.getUserBase();
      const base = baseModel ? baseModel.toJSON() : {};
      res = toJSON({
        ...user.toJSON(),
        userId,
        groupId,
        ...member,
        userBase: { ...base, ...(userBase || {}) },
      });
    } else {
      res = toJSON({ userId, groupId, ...member, userBase: userBase || {} });
    }
    try {
      await transaction((t) => {
        return Promise.all([
          GroupMember.update(member, { where: { userId, groupId }, transaction: t }),
          UserBase.update(userBase, { where: { userId }, transaction: t }),
        ]);
      });
    } catch (e) {
      logger.error('Model FriendGroupLink action set error:', e);
    }
    return res;
  },
  /**
   * 通过群组 id 获取群组成员 id
   *
   * @param {*} groupId
   * @returns promise
   */
  async getByGroupId(groupId, limit) {
    const GroupMember = await getModel('groupMember');
    const UserBase = await getModel('userBase');
    let res = [];
    try {
      res = await GroupMember.findAll({ where: { groupId }, limit, include: [{ model: UserBase }] });
    } catch (e) {
      logger.error('Model FriendGroupLink action getByGroupId error:', e);
    }
    return res && _.map(res, (user) => toJSON(user));
  },
  /**
   * 通过用户 id 获取用户所在所有群组 id
   *
   * @param {*} groupId
   * @returns promise
   */
  async getByUserId(userId) {
    const GroupMember = await getModel('groupMember');
    const GroupBase = await getModel('groupBase');
    let res = [];
    try {
      res = await GroupMember.findAll({ where: { userId }, include: [{ model: GroupBase }] });
    } catch (e) {
      logger.error('Model FriendGroupLink action getByUserId error:', e);
    }
    return _.map(res, ({ groupBase }) => groupBase && groupBase.toJSON());
  },
  /**
   * 用户被踢下线
   *
   * @param {*} userId
   * @param {*} groupId
   */
  async kitoutUser(userId, groupId) {
    const GroupMember = await getModel('groupMember');
    try {
      await GroupMember.destroy({ where: { userId, groupId } });
    } catch (e) {
      logger.error('Model FriendGroupLink action kitoutUser error:', e);
    }
  },
  /**
   * 退出群组
   *
   * @param {*} groupId
   */
  async kitoutGroup(groupId) {
    const GroupMember = await getModel('groupMember');
    try {
      await GroupMember.destroy({ where: { groupId } });
    } catch (e) {
      logger.error('Model FriendGroupLink action kitoutGroup error:', e);
    }
  },
};
export default self;
