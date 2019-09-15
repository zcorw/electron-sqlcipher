import * as databse from './model/database';
import * as model from './model/model';
import Friend from './middleware/Friend';
import Group from './middleware/Group';
import GroupMember from './middleware/GroupMember';

export default {
  async start() {
    await databse.start();
    await model.start();
  },
  DB: databse,
  Friend,
  Group,
  GroupMember,
};
