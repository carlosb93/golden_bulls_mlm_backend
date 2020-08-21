# Golden Bulls MLM

## Installation

This project have the next requirements:
  * NodeJS
  * MongoDB

Run this command to install all the dependencies:

```bash
$ npm install
```

## Setting things up

In the file `/config/config.js` is the basic configuration for three different environments.

In the path where MongoDB where installed, there is a daemon process called `mongod` that should be available from command line in order to get access to the database. There must exist a folder called `database` in the root directory of the project. Then run `mongod --dbpath ./database` to start the daemon in that place, where will be stored the database files.

Once the database service is running, then run `node app` to run the server.

## Testing data

The script `generate_dataset.js` can be used to add some fake data to the database for development purposes only. It shouldn't be used for any other reasons. Just run `node ./generate_dataset.js`.

If the script fails, maybe is because is trying to add an object that's already there. Be careful with `unique` fields. The quick solution for that is to follow the next steps:
  * Run the command `mongo` in the command line
  * Run `show dbs`
  * Run `use $db` where `$db` is the name of the current database
  * Run `db.users.remove({ upliner: null })`

That will clean the users in the database.