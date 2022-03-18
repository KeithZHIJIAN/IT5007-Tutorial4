# IT5007-Tutorial4
This is a repository for NUS IT5007 Tut 4

## Here are the instructions to clear database, compile and run
```
mongo travelerdb scripts/init.mongo.js
npx babel src --presets @babel/react --out-dir public
npm start
```
## If you want to test all CRUD operations, use
```
node scripts/trymongo.js
```
