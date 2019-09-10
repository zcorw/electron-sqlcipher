import { Model } from 'sequelize';
import { get as getDatabase, close } from './database';
import * as config from './config';

let models = {};
function createModel(modelName, columns, database, options) {
  if (models[modelName]) {
    return Promise.resolve(models[modelName]);
  }
  class M extends Model {}
  M.init(columns, { sequelize: database, modelName, ...options });
  models[modelName] = M;
  return M.sync().then(() => M);
}

export function reset() {
  models = {};
  close();
}

export async function getContact() {
  if (models.userBase && models.contact) {
    return { UserBase: models.userBase, Contact: models.contact };
  }
  const UserBase = await createModel('userBase', config.userBase, getDatabase());
  const Contact = await createModel('contact', config.contact, getDatabase());
  Contact.UserBase = Contact.belongsTo(UserBase, { foreignKey: 'userId', constraints: false });
  return { UserBase, Contact };
}

export async function getGroup() {
  if (models.groupBase && models.groupSet) {
    return { GroupBase: models.groupBase, GroupSet: models.groupSet };
  }
  const GroupBase = await createModel('groupBase', config.groupBase, getDatabase());
  const GroupSet = await createModel('groupSet', config.groupSet, getDatabase());
  // GroupSet.GroupBase = GroupSet.belongsTo(GroupBase, { as: 'Base', foreignKey: 'groupId', constraints: false });
  return { GroupBase, GroupSet };
}