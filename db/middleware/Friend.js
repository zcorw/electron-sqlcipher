/**
 * 联系人接口
 * 所有被读取和写入的数据要进行内存缓存，以map保存，userId为key,目前先缓存 500 条数据
 * 有数据需要写入，优先转换格式后传递给前端，将 sql 语句以 function 传给队列
 * @author william
 */
import { getContact as getUserModel } from '../model/model';
import { factery as cacheFactery, control as controlFactery } from './cache';
import Friend from '../cache/Friend';

const cacheMax = 500; // 缓存上限
const userCache = cacheFactery(cacheMax);
const createModel = async () => {
  const { Contact: Info, UserBase: Base } = await getUserModel();
  return { Info, Base };
};
const { get: getUser, create: createUser, update: updateUser } = controlFactery(createModel, userCache, Friend);

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
    const { Contact } = await getUserModel();
    const contactInstances = (await Contact.findAll()) || [];
    const userBaseInstances = await Promise.all(contactInstances.map((instance) => instance.getUserBase()));
    const users = contactInstances.map((instance, i) => new Friend(instance.userId, userBaseInstances[i], instance));
    return users.map((user) => {
      setTimeout(() => userCache.add(user.userId, user));
      return user.toJSON();
    });
  },
  async getUserById(userId) {
    const user = await getUser(userId);
    return user && user.toJSON();
  },
  async saveOrUpdate(users) {
    await Promise.all(
      users.map(async (user) => {
        const { userBase, contact } = user;
        let cache = await getUser(userBase.userId);
        const contactOption = {
          userId: userBase.userId,
          remarkName: contact.remarkName,
          contactName: contact.contactName,
          sourceType: contact.sourceType,
          desc: contact.desc,
          isHidden: contact.isHidden,
          isUndisturb: contact.isUndisturb,
          isDel: contact.isDel,
          status: contact.status,
        };
        const userBaseOption = {
          userId: userBase.userId,
          mid: userBase.mid,
          headImgUrl: userBase.headImgUrl,
          nickName: userBase.nickName,
          publicKey: userBase.publicKey,
          countryCode: userBase.countryCode,
          mobile: userBase.mobile,
          email: userBase.email,
          registerType: userBase.registerType,
          version: userBase.version,
          gender: userBase.gender,
          job: userBase.job,
          birthday: userBase.birthday,
          signature: userBase.signature,
          name: userBase.name,
        };
        if (cache === null) {
          cache = await createUser(userBase.userId, userBaseOption, contactOption);
        } else {
          cache = await updateUser(cache, userBaseOption, contactOption);
        }
        return cache;
      }),
    );
  },
  async update(userId, data) {
    console.log('TCL: update -> userId, data', userId, data);
    let cache = await getUser(userId);
    cache = await updateUser(cache, data.userBase, data.contact);
    return cache.toJSON();
  },
  async removeOne(userId) {
    const { Contact } = await getUserModel();
    await Contact.destroy({ where: { userId } });
    userCache.remove(userId);
  },
};

export default self;