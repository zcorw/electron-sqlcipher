import _ from 'lodash';
import { getGroup as getGroupModel } from '../model/model';
import { transaction } from '../model/database';
import { add as addQueue } from './writeQueue';
import cacheFactary from './cache';

const cacheMax = 500; // 缓存上限
const groupCache = cacheFactary(cacheMax);

class Group {
  constructor(groupBase, groupSet) {
    this.instance = { groupBase, groupSet };
  }

  get id() {
    return this.instance.groupBase.userId;
  }

  toJSON() {
    const { groupBase, groupSet } = this.instance;
    return {
      ...groupBase.toJSON(),
      ...groupSet.toJSON(),
    };
  }

  updateGroupBase(data) {
    const { groupBase } = this.instance;
    _.forEach(data, (v, k) => {
      groupBase[k] = v;
    });
    return groupBase;
  }

  updateGroupSet(data) {
    const { groupSet } = this.instance;
    _.forEach(data, (v, k) => {
      groupSet[k] = v;
    });
    return groupSet;
  }
}

/**
 * 从缓存或数据库获取用户数据
 * @param {*} userId 用户id
 */
async function getGroup(groupId) {
  if (groupCache.has(groupId)) {
    return groupCache.get(groupId);
  }
  const { Contact } = await getGroupModel();
  const contact = await Contact.findByPk(groupId);
  if (contact === null) {
    return null;
  }
  const base = await contact.getUserBase();
  const group = new Group(base, contact);
  setTimeout(() => groupCache.add(groupId, group));
  return group;
}

/**
 * 创建用户数据并写入数据库
 * @param {object} data
 * @field {object} userBase 用户基础信息
 * @field {object} contact 联系人信息
 */
async function createGroup(data) {
  const { GroupBase, GroupSet } = await getGroupModel();
  const { groupBase, groupSet } = data;

  const groupSetInstances = GroupSet.build({
    groupId: groupBase.groupId,
    isUndisturb: groupSet.isUndisturb,
    isHidden: groupSet.isHidden,
    roleId: groupSet.roleId,
  });
  const groupBaseInstances = GroupBase.build({
    groupId: groupBase.groupId,
    masterId: groupBase.masterId,
    name: groupBase.name,
    headImgUrl: groupBase.headImgUrl,
    status: groupBase.status,
    verifyWay: groupBase.verifyWay,
    totalUsers: groupBase.totalUsers,
    type: groupBase.type,
    isIngroup: groupBase.isIngroup,
    version: groupBase.version,
  });

  const group = new Group(groupBaseInstances, groupSetInstances);
  groupCache.add(groupBase.userId, group);
  addQueue(() => {
    return transaction((t) => {
      return Promise.all([groupBaseInstances.save({ transaction: t }), groupSetInstances.save({ transaction: t })]);
    });
  });
  return group;
}