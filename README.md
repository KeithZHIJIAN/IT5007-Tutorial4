# IT5007-Tutorial4
This is a repository for NUS IT5007 Tut 4
## Setup Babel first
```
npm install --save-dev @babel/core@7 @babel/cli@7
node_modules/.bin/babel --version
npx babel --version
npm install --save-dev @babel/preset-react@7
npx babel src --presets @babel/react --out-dir public
```
## Here are instructions to clear database, compile and run
```
mongo travelerdb scripts/init.mongo.js
npx babel src --presets @babel/react --out-dir public
npm start
```
## If it throws error: "Cannot find module 'apollo-server-express'", use
```
npm install graphql@0 apollo-server-express@2
```
## If it throws error: "Cannot find module 'mongodb'", use
```
npm install mongodb@3
```
## If you want to test all CRUD operations, use
```
node scripts/trymongo.js
```
