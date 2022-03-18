/*
 * Run using the mongo shell. For remote databases, ensure that the
 * connection string is supplied in the command line. For example:
 * localhost:
 *   mongo issuetracker scripts/init.mongo.js
 * Atlas:
 *   mongo mongodb+srv://user:pwd@xxx.mongodb.net/issuetracker scripts/init.mongo.js
 * MLab:
 *   mongo mongodb://user:pwd@xxx.mlab.com:33533/issuetracker scripts/init.mongo.js
 */

db.travelers.remove({});

const travelersDB = [
  // {
  //   id: 1, name: 'Zhijian', phone: 99998888, created: new Date()
  // }
];

db.travelers.insertMany(travelersDB);
const count = db.travelers.count();
print('Inserted', count, 'travelers');

db.counters.remove({ _id: 'travelers' });
db.counters.insert({ _id: 'travelers', current: count });

db.travelers.createIndex({ id: 1 }, { unique: true });

db.blacklist.remove({});