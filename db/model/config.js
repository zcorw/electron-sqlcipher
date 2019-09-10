/**
 * 数据库表字段设计
 * @author william
 */
import Sequelize from 'sequelize';
import pinyin4js from 'pinyin4js';

export function getPinyin(str) {
  if (!str) {
    return '';
  }
  const py = pinyin4js.convertToPinyinString(str, '', pinyin4js.WITHOUT_TONE);
  return py;
}
/**
 * 用户信息表
 * @field {string} userId 用户ID primaryKey
 * @field {string} mid Morse号
 * @field {text} headImgUrl 用户头像
 * @field {string} nickName 昵称
 * @field {text} publicKey 公钥
 * @field {string} countryCode 国家码
 * @field {string} mobile 手机号
 * @field {string} email 邮箱
 * @field {int} registerType 注册方式
 * @field {string} version 数据版本号
 * @field {string} pinyin 昵称全拼
 * @field {int} gender 性别 0:未知，1:男，2:女
 * @field {string} job 工作
 * @field {string} birthday 生日 例如：1992-06-05
 * @field {string} signature 签名
 * @field {string} name 真实姓名
 */
export const userBase = {
  userId: {
    primaryKey: true,
    type: Sequelize.STRING,
  },
  mid: {
    type: Sequelize.STRING,
    unique: true,
  },
  headImgUrl: Sequelize.TEXT,
  nickName: {
    type: Sequelize.STRING,
    set(val) {
      const mid = () => this.getDataValue('mid');
      this.setDataValue('pinyin', getPinyin(val || mid()));
      this.setDataValue('nickName', val || '');
    },
  },
  publicKey: Sequelize.TEXT,
  countryCode: Sequelize.STRING,
  mobile: Sequelize.STRING,
  email: Sequelize.STRING,
  registerType: Sequelize.INTEGER,
  version: {
    type: Sequelize.STRING,
    defaultValue: '0',
  },
  pinyin: Sequelize.STRING,
  gender: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  job: Sequelize.STRING,
  birthday: Sequelize.STRING,
  signature: Sequelize.STRING,
  name: Sequelize.STRING,
};
/**
 * 联系人信息表
 * contact.belongsTo(userBase)
 * @field {string} userId 用户ID primaryKey
 * @field {string} remarkName 备注
 * @field {string} contactName 通讯录名
 * @field {integer} sourceType 添加方式 1:自动建立，2:搜索添加
 * @field {string} desc 简介
 * @field {string} pinyin 备注全拼
 * @field {integer} isHidden 是否隐藏
 * @field {integer} isUndisturb 是否免打扰
 * @field {integer} isDel 是否已经删除
 * @field {integer} status 好友状态 1:正常，2:黑名单
 */
export const contact = {
  userId: {
    primaryKey: true,
    type: Sequelize.STRING,
  },
  remarkName: {
    type: Sequelize.STRING,
    set(val) {
      this.setDataValue('pinyin', getPinyin(val));
      this.setDataValue('remarkName', val || '');
    },
  },
  contactName: Sequelize.STRING,
  sourceType: {
    type: Sequelize.INTEGER,
    defaultValue: 1,
  },
  desc: Sequelize.STRING,
  pinyin: Sequelize.STRING,
  isHidden: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  isUndisturb: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  isDel: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  status: {
    type: Sequelize.INTEGER,
    defaultValue: 1,
  },
};
/**
 * 群组信息表
 * @field {string} groupId 群组ID primaryKey
 * @field {string} masterId 群主ID
 * @field {string} name 群组名称
 * @field {string} headImgUrl 头像远程地址
 * @field {integer} status 群组状态 1：未激活，2：正常，3：解散
 * @field {integer} verifyWay 验证方式
 * @field {integer} totalUsers 群组成员数
 * @field {integer} type 群组类型 1：普通建群，2：面对面建群
 * @field {integer} isIngroup 是否在群里
 * @field {string} version 版本号
 * @field {string} pinyin 群组名称拼音
 */
export const groupBase = {
  groupId: {
    primaryKey: true,
    type: Sequelize.STRING,
  },
  masterId: Sequelize.STRING,
  name: {
    type: Sequelize.STRING,
    set(val) {
      this.setDataValue('pinyin', getPinyin(val));
      this.setDataValue('name', val);
    },
  },
  headImgUrl: Sequelize.STRING,
  status: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  verifyWay: Sequelize.INTEGER,
  totalUsers: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  type: Sequelize.INTEGER,
  isIngroup: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  version: Sequelize.STRING,
  pinyin: Sequelize.STRING,
};
/**
 * 群组设置表
 * groupSet.belongsTo(groupBase)
 * @field {string} groupId 群组ID primaryKey
 * @field {integer} isUndisturb 是否免打扰
 * @field {integer} isHidden 是否隐藏
 * @field {integer} roleId 角色 1：普通成员，0：群主
 */
export const groupSet = {
  groupId: {
    primaryKey: true,
    type: Sequelize.STRING,
    references: {
      model: 'groupBase',
      key: 'groupId',
    },
  },
  isUndisturb: Sequelize.INTEGER,
  isHidden: Sequelize.INTEGER,
  roleId: Sequelize.INTEGER,
};
/**
 * 群组成员信息表
 * groupMember.belongsToMany(userBase)
 * @field {string} groupId 群组ID
 * @field {string} userId 用户ID
 * @field {string} nickName 群内昵称
 * @field {integer} joinType 加入方式
 * @field {string} version 版本
 */
export const groupMember = {
  groupId: Sequelize.STRING,
  userId: {
    type: Sequelize.STRING,
    references: {
      model: 'userBases',
      key: 'userId',
    },
  },
  nickName: Sequelize.STRING,
  joinType: Sequelize.INTEGER,
  version: {
    type: Sequelize.STRING,
    defaultValue: '0',
  },
};
/**
 * 用户设置表
 * @field key 参数名 primaryKey
 * @field value 参数值
 */
export const userInfo = {
  key: {
    primaryKey: true,
    type: Sequelize.STRING,
  },
  value: Sequelize.STRING,
};
/**
 * 联系人消息表
 * @field {string} msgId 消息id primaryKey
 * @field {string} userId 对话联系人userId
 * @field {string} msgFrom 消息发送者id
 * @field {string} msgTo 消息接收者id
 * @field {integer} msgFlag 消息发送状态，1：发送成功，2：发送失败，0：发送中
 * @field {integer} msgTime 消息发送时间戳（毫秒）
 * @field {integer} contentType 消息类型，具体详情见下方说明
 * @field {text} content 消息内容，具体详情见通用规范文档中消息协议补充协议
 * @field {integer} readState 消息阅读状态，0：未读，1：已读
 * @field {integer} recall 消息撤回状态，0：未撤回，1：已撤回
 * @field {integer} status 扩展状态，根据不同类型消息赋予特定意义，具体详情见下方说明
 * @field {string} extends 扩展字段，部分消息类型特有字段，内容见下方说明
 * @field {string} search 搜索字段，提供搜索用字段
 * 消息类型
 * 1:文本 2:图片 3:视频 4:语音 5:位置 6:文件 7:表情 8:名片
 * 100:未知
 * 201 创建群组 202 加入群组 203 退出群组 204 修改群组名 205 群主转让 206 邀请加入群组 207 群组消息被拒
 * 301 添加好友 302 好友消息被拒
 * 扩展状态
 * contentType:4，0 未播放，1 已播放
 * contentType:2、3、6， 0 下载中，1 下载完成，2 下载失败
 * 扩展字段
 * contentType:1，at消息 {atAll: boolean, notifyUsers: array}
 */
export const userRecord = {
  msgId: {
    primaryKey: true,
    type: Sequelize.STRING,
  },
  userId: Sequelize.STRING,
  msgFrom: Sequelize.STRING,
  msgTo: Sequelize.STRING,
  msgTime: Sequelize.INTEGER,
  content: Sequelize.TEXT,
  readState: Sequelize.INTEGER,
  recall: Sequelize.INTEGER,
  status: Sequelize.INTEGER,
  extends: Sequelize.STRING,
  search: Sequelize.STRING,
};
/**
 * 群组消息表
 * @field {string} msgId 消息id primaryKey
 * @field {string} msgFrom 消息发送者id
 * @field {string} msgTo 消息接收者id
 * @field {integer} msgFlag 消息发送状态，1：发送成功，2：发送失败，0：发送中
 * @field {integer} msgTime 消息发送时间戳（毫秒）
 * @field {integer} contentType 消息类型，具体详情见下方说明
 * @field {text} content 消息内容，具体详情见通用规范文档中消息协议补充协议
 * @field {integer} readState 消息阅读状态，0：未读，1：已读
 * @field {integer} recall 消息撤回状态，0：未撤回，1：已撤回
 * @field {integer} status 扩展状态，根据不同类型消息赋予特定意义，具体详情见下方说明
 * @field {string} extends 扩展字段，部分消息类型特有字段，内容见下方说明
 * @field {string} search 搜索字段，提供搜索用字段
 * 消息类型
 * 1:文本 2:图片 3:视频 4:语音 5:位置 6:文件 7:表情 8:名片
 * 100:未知
 * 201 创建群组 202 加入群组 203 退出群组 204 修改群组名 205 群主转让 206 邀请加入群组 207 群组消息被拒
 * 301 添加好友 302 好友消息被拒
 * 扩展状态
 * contentType:4，0 未播放，1 已播放
 * contentType:2、3、6， 0 下载中，1 下载完成，2 下载失败
 * 扩展字段
 * contentType:1，at消息 {atAll: boolean, notifyUsers: array}
 */
export const groupRecord = {
  msgId: {
    primaryKey: true,
    type: Sequelize.STRING,
  },
  msgFrom: Sequelize.STRING,
  msgTo: Sequelize.STRING,
  msgTime: Sequelize.INTEGER,
  content: Sequelize.STRING,
  readState: Sequelize.INTEGER,
  recall: Sequelize.INTEGER,
  status: Sequelize.INTEGER,
  extends: Sequelize.STRING,
  search: Sequelize.STRING,
};
/**
 * 会话表
 * @field {string} historyId 会话ID primaryKey
 * @field {integer} historyType 会话类型
 * @field {integer} updateTime 最后更新时间
 * @field {integer} msgNum 未读消息数
 * @field {integer} topIndex 置顶排序
 * @field {integer} sortIndex 排序
 */
export const history = {
  historyId: {
    primaryKey: true,
    type: Sequelize.STRING,
  },
  historyType: Sequelize.INTEGER,
  updateTime: Sequelize.INTEGER,
  msgNum: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  topIndex: Sequelize.INTEGER,
  sortIndex: Sequelize.INTEGER,
};
/**
 * 文件表
 * @field {string} msgId 消息ID primaryKey
 * @field {string} path 文件本地保存地址
 */
export const file = {
  msgId: {
    primaryKey: true,
    type: Sequelize.STRING,
  },
  path: Sequelize.STRING,
};
/**
 * 缩略图
 * @field {string} msgId 消息ID primaryKey
 * @field {string} path 文件本地保存地址
 */
export const thumb = {
  msgId: {
    primaryKey: true,
    type: Sequelize.STRING,
  },
  thumbPath: Sequelize.STRING,
};