/**
 * 联系人接口
 * 所有被读取和写入的数据要进行内存缓存，以map保存，userId为key,目前先缓存 500 条数据
 * 有数据需要写入，优先转换格式后传递给前端，将 sql 语句以 function 传给队列
 * @author william
 */
import _ from 'lodash';
import { getModel } from '../model/model';
import { transaction } from '../model/database';
import { add as addQueue } from './writeQueue';

function toJSON(data) {
  return {
    remarkName: data.remarkName,
    contactName: data.contactName,
    sourceType: data.sourceType,
    desc: data.desc,
    isHidden: data.isHidden,
    isUndisturb: data.isUndisturb,
    isDel: data.isDel,
    status: data.status,
    userId: data.userBase.userId,
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
    pinyin: data.userBase.pinyin,
    groupIndex: (data.pinyin || data.userBase.pinyin || data.userBase.mid)[0],
    displayName: data.remarkName || data.userBase.nickName || data.userBase.mid,
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
  async getAllFriend() {
    const Contact = await getModel('contact');
    const UserBase = await getModel('userBase');
    const contactInstances =
      (await Contact.findAll({
        include: [
          {
            model: UserBase,
          },
        ],
      })) || [];
    return contactInstances.map((instance) => toJSON(instance.toJSON()));
  },
  async getUserById(userId) {
    const Contact = await getModel('contact');
    const UserBase = await getModel('userBase');
    const instance = await Contact.findByPk(userId, {
      include: [
        {
          model: UserBase,
        },
      ],
    });
    return instance && toJSON(instance.toJSON());
  },
  async saveOrUpdate(users) {
    const userIds = _.map(users, ({ userBase }) => userBase.userId);
    const Contact = await getModel('contact');
    const UserBase = await getModel('userBase');
    const destroy = (t) => {
      return [
        UserBase.destroy({
          where: { userId: userIds },
          transaction: t,
        }),
        Contact.destroy({
          where: { userId: userIds },
          transaction: t,
        }),
      ];
    };
    const save = (t) => {
      const base = [];
      const contact = [];
      _.forEach(users, (user) => {
        base.push(user.userBase);
        contact.push(Object.assign(user.contact, { userId: user.userBase.userId }));
      });
      return [
        UserBase.bulkCreate(base, {
          transaction: t,
        }),
        Contact.bulkCreate(contact, {
          transaction: t,
        }),
      ];
    };
    await transaction((t) => {
      return Promise.all(destroy(t)).then(() => Promise.all(save(t)));
    });
  },
  async update(userId, data) {
    const Contact = await getModel('contact');
    const cache = await Contact.findByPk(userId);
    let res = null;
    if (cache !== null) {
      const base = await cache.getUserBase();
      Object.assign(base, data.userBase || {});
      Object.assign(cache, data.contact || {});
      res = toJSON({ ...cache.toJSON(), userBase: { ...base.toJSON() } });
      await transaction((t) => {
        return Promise.all([
          cache.save({
            transaction: t,
          }),
          base.save({
            transaction: t,
          }),
        ]);
      });
    }

    return res;
  },
  async removeOne(userId) {
    const Contact = await getModel('contact');
    const UserBase = await getModel('userBase');
    const base = await UserBase.findByPk(userId);
    await Contact.destroy({ where: { userId } });
    return base && toJSON({ userBase: base.toJSON() });
  },
};

export default self;
