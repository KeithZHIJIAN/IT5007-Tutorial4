const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost/travelerdb';

// Atlas URL  - replace UUU with user, PPP with password, XXX with hostname
// const url = 'mongodb+srv://UUU:PPP@cluster0-XXX.mongodb.net/issuetracker?retryWrites=true';

// mLab URL - replace UUU with user, PPP with password, XXX with hostname
// const url = 'mongodb://UUU:PPP@XXX.mlab.com:33533/issuetracker';

function testWithCRUD(callback) {
  console.log('\n--- Testing CRUD ---');
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
  client.connect(function (err, client) {
    if (err) {
      callback(err);
      return;
    }
    console.log('Connected to MongoDB');

    const db = client.db();
    const collection = db.collection('travelers');
    console.log('\n--- Testing Create ---');
    const test_case = { id: -1, name: 'Test', phone: 12345678, date: new Date() };
    collection.insertOne(test_case, function (err, result) {
      if (err) {
        client.close();
        callback(err);
        return;
      }
      const test_case_id = result.insertedId;
      console.log('Result of insertOne:\n', result.insertedId);
      console.log('\n--- Testing Read ---');
      collection.find({ _id: test_case_id })
        .toArray(function (err, docs) {
          if (err) {
            client.close();
            callback(err);
            return;
          }
          console.log('Result of find:\n', docs);
          console.log('\n--- Testing Update ---');
          collection.updateOne({ _id: test_case_id }, { $set: { name: 'Test update' } }, function (err, result) {
            if (err) {
              client.close();
              callback(err);
              return;
            }
            console.log('Result of updateOne:\n', result.result);
            console.log('\n--- Testing Delete ---');
            collection.deleteOne({ _id: test_case_id }, function (err, result) {
              if (err) {
                client.close();
                callback(err);
                return;
              }
              console.log('Result of deleteOne:\n', result.result);
              client.close();
              callback(err);
            });
          });
        });
    });
  });
}

testWithCRUD(function (err) {
  if (err) {
    console.log(err);
  }
});