import db from '../db';
import contact from './model/contact.json';
import userBase from './model/userBase.json';

setTimeout(() => console.log('success'), 5000);

db.DB.start(10034)
  .then(async () => {
    const res = contact.map((data, id) => {
      return {
        userBase: userBase[id],
        contact: data,
      };
    });
    await db.Friend.saveOrUpdate(res);

    return db.Friend.getAllFriend('3');
  })
  .then((res) => {
    // console.log(res);
    return db.Friend.update('3', { contact: { remarkName: '一只小绵羊' } });
  })
  .then((res) => {
    // console.log(res);
    return db.Friend.removeOne('2');
  })
  .then(() => {
    return db.Friend.getUserById('3');
  })
  .then((res) => console.log(res));