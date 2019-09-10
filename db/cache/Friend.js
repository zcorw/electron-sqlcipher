import _ from 'lodash';
import Base from './Base';

/**
 * 用户缓存数据类
 * @class
 * @field displayName {string} 要显示的名称（有备注显示备注，无备注显示昵称）
 * @field isFriend {boolean} 是否是好友
 * @field id {string} 用户id
 * @field toJSON {Function} 数据JSON格式化
 * @field updateBase {Function} 更新用户基础信息（参数格式详情见UserBase字段说明）
 * @field updateInfo {Function} 更新联系人信息（参数格式详情见Contact字段说明）
 */
export default class Friend extends Base {
  constructor(id, base, info) {
    super(id, base, 'friend');
    this.instance = info;
  }

  get dispalyName() {
    return this.instance.remarkName || this.base.nickName || this.base.mid;
  }

  get isFriend() {
    return 1;
  }

  get pinyin() {
    return this.instance.remarkName ? this.instance.pinyin : this.base.pinyin;
  }

  toJSON() {
    return {
      ...this.base.toJSON(),
      ...this.instance.toJSON(),
      isFriend: this.isFriend,
      dispalyName: this.dispalyName,
      pinyin: this.pinyin,
    };
  }

  updateBase(data) {
    const { base } = this;
    _.forEach(data, (v, k) => {
      base[k] = v;
    });
    return base;
  }

  updateInfo(data) {
    const info = this.instance;
    _.forEach(data, (v, k) => {
      info[k] = v;
    });
    return info;
  }
}