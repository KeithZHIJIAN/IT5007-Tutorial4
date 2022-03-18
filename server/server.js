const fs = require('fs');
const express = require('express');
const { ApolloServer, UserInputError } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost/travelerdb';
const maxPassenger = 25;

// Atlas URL  - replace UUU with user, PPP with password, XXX with hostname
// const url = 'mongodb+srv://UUU:PPP@cluster0-XXX.mongodb.net/issuetracker?retryWrites=true';

// mLab URL - replace UUU with user, PPP with password, XXX with hostname
// const url = 'mongodb://UUU:PPP@XXX.mlab.com:33533/issuetracker';

let db;

const GraphQLDate = new GraphQLScalarType({
  name: 'GraphQLDate',
  description: 'A Date() type in GraphQL as a scalar',
  serialize(value) {
    return value.toISOString();
  },
  parseValue(value) {
    const dateValue = new Date(value);
    return isNaN(dateValue) ? undefined : dateValue;
  },
  parseLiteral(ast) {
    if (ast.kind == Kind.STRING) {
      const value = new Date(ast.value);
      return isNaN(value) ? undefined : value;
    }
  },
});

const resolvers = {
  Query: {
    travelerList,
  },
  Mutation: {
    travelerAdd,
    travelerDelete,
    createBlackList
  },
  GraphQLDate,
};

async function createBlackList(_, { name }) {
  result = await db.collection('blacklist').insertOne({ name: name });
  return true;
}

async function travelerList() {
  const travelers = await db.collection('travelers').find({}).toArray();
  return travelers;
}

async function getNextSequence(name) {
  const result = await db.collection('counters').findOneAndUpdate(
    { _id: name },
    { $inc: { current: 1 } },
    { returnOriginal: false },
  );
  return result.value.current;
}

function travelerValidate(traveler) {
  const errors = [];
  if (/\d/.test(traveler.name)) {
    errors.push("Name can not contain numbers.");
  }
  if (traveler.phone.length != 8) {
    errors.push('Phone number must be 8-digit-long.');
  }
  if (errors.length > 0) {
    throw new UserInputError('Invalid input(s)', { errors });
  }
}

async function travelerAdd(_, { traveler }) {
  const cnt = await db.collection('travelers').count();
  if (cnt >= maxPassenger) {
    throw new UserInputError('Invalid input(s)', { errors: ['No seats available.'] });
  }
  travelerValidate(traveler);
  const hit = await db.collection('blacklist').find({ name: traveler.name }).count();
  if (hit > 0) {
    throw new UserInputError('Invalid input(s)', {
      errors: [`${traveler.name} is on the Blacklist`],
    });
  }
  traveler.created = new Date();
  traveler.id = await getNextSequence('travelers');
  const result = await db.collection('travelers').insertOne(traveler);
  const savedTraveler = await db.collection('travelers')
    .findOne({ _id: result.insertedId });
  return savedTraveler;
}

async function travelerDelete(_, { id }) {
  const savedTraveler = await db.collection('travelers')
    .findOne({ id: id });
  const result = await db.collection('travelers').deleteOne({ id: id });
  if (result.deletedCount === 0) {
    throw new UserInputError('Invalid input(s)', { errors: [`Could not find traveler with id ${id}.`] });
  }
  return savedTraveler;
}

async function connectToDb() {
  const client = new MongoClient(url, { useNewUrlParser: true });
  await client.connect();
  console.log('Connected to MongoDB at', url);
  db = client.db();
}

const server = new ApolloServer({
  typeDefs: fs.readFileSync('./server/schema.graphql', 'utf-8'),
  resolvers,
  formatError: error => {
    console.log(error);
    return error;
  },
});

const app = express();

app.use(express.static('public'));

server.applyMiddleware({ app, path: '/graphql' });

(async function () {
  try {
    await connectToDb();
    app.listen(3000, function () {
      console.log('App started on port 3000');
    });
  } catch (err) {
    console.log('ERROR:', err);
  }
})();