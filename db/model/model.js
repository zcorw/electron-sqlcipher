import { Model } from 'sequelize';
import _ from 'lodash';
import { get as getDatabase, close as closeDatabase } from './database';
import * as configs from './config';

let models = {};
function createModel(modelName, columns, database, options) {
  class M extends Model {}
  M.init(columns, { sequelize: database, modelName, ...options });
  models[modelName] = M;
  return M;
}

export function start() {
  _.forEach(configs, (config, key) => {
    if (key !== 'groupRecord') {
      createModel(key, config, getDatabase());
    }
  });
  const { contact, userBase, groupMember, groupBase, groupSet } = models;
  contact.belongsTo(userBase, { foreignKey: 'userId', constraints: false });
  groupMember.belongsTo(userBase, { foreignKey: 'userId', constraints: false });
  groupMember.belongsTo(groupBase, { foreignKey: 'groupId', constraints: false });
  groupBase.hasOne(groupSet, { foreignKey: 'groupId', constraints: false });
}

export function close() {
  models = {};
  closeDatabase();
}

export function getModel(modelName, options) {
  const model =
    modelName !== 'groupRecord'
      ? models[modelName]
      : createModel(`${modelName}_${options.groupId}`, configs[modelName], getDatabase());
  return model.sync();
}
