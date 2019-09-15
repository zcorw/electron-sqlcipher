import db from '../db';

import contact from './model/contact.json';
import userBase from './model/userBase.json';
import group from './model/group.json';
import groupMember from './model/groupMember.json';
import groupSet from './model/groupSet.json';

setTimeout(() => console.log('success'), 5000);
/**
 * 好友
 */
// db.start(10034)
//   .then(async () => {
//     const res = contact.map((data, id) => {
//       return {
//         userBase: userBase[id],
//         contact: data,
//       };
//     });
//     await db.Friend.saveOrUpdate(res);
//     return db.Friend.getAllFriend('3');
//   })
//   .then((res) => {
//     console.log('all', res);
//     return db.Friend.update('3', { contact: { remarkName: '一只小绵羊' } });
//   })
//   .then((res) => {
//     console.log('update', res);
//     return db.Friend.removeOne('2');
//   })
//   .then((res) => {
//     console.log('remove', res);
//     return db.Friend.getUserById('4');
//   })
//   .then((res) => console.log('get', res));
/**
 * 群组和群组成员
 */
db.start()
  .then(async () => {
    const res = group.map((data, id) => {
      return {
        groupBase: data,
        groupSet: groupSet[id],
      };
    });
    await db.Group.saveOrUpdate(res);
    return db.Group.getAllGroup();
  })
  .then(async (res) => {
    const groupRes = await db.Group.getGroupById('69C982B961BD4CFB8A8A42B32B580E06');
    console.log(groupRes);
    const groupsRes = await db.Group.getGroupsById([
      '10032b440821f0da7b0bbc9047f1a834720',
      '4c28ccb14fbd470cad2c9e92c998d08b',
    ]);
    console.log(groupsRes);
    return db.Group.updateGroup(
      {
        groupBase: { name: '测试小号' },
      },
      '69C982B961BD4CFB8A8A42B32B580E06',
    );
  })
  .then(async () => {
    await db.Group.removeGroup('69C982B961BD4CFB8A8A42B32B580E06');
    await db.Group.kitoutGroup('10032b440821f0da7b0bbc9047f1a834720');
    const res = await db.Group.getAllGroup();
    console.log(res);
  });
