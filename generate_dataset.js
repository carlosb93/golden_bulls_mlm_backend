const config = require('./config/config');
const glob = require('glob');
const mongoose = require('mongoose');

mongoose.connect(config.db);
const db = mongoose.connection;

function genRandom(len) {

  let res = [];
  let min = 97;
  let max = 122;

  for (let i = 0; i < len; i += 1) {
    res.push(
      String.fromCharCode(
        Math.round( Math.random() * (max - min) + min )
      )
    );
  }

  return res.join('');

}

function genRandomName() {
  let name = genRandom( ~~( Math.random() * 4 + 4 ) );
  let lastname = genRandom( ~~( Math.random() * 6 + 4 ) );

  name[0] = name[0].toUpperCase();
  lastname[0] = lastname[0].toUpperCase();

  return name + ' ' + lastname;
}

function genRandomCI() {
  let res = [];

  for (let i = 0; i < 11; i += 1) {
    res.push( String.fromCharCode( ~~( Math.random() * 10 + 48 ) ) )
  }

  return res.join('');
}

function generateRandomTree() {
  let tree = [];
  let q = [];

  const MAX_LEVEL = 5;

  q.push( [ tree, 0 ] );

  while( q.length > 0 ) {
    let childs = ~~( Math.random() * 10 - 4 );
    let data = q.shift();
    let node = data[0];
    let level = data[1];
    
    console.log('Creating %d childs for level %d', childs, level);

    if ( childs >= 0 ) {
      for (let i = 1; i <= childs; i += 1) {
        node.push({
          children: []
        });
      }

      if ( level <= MAX_LEVEL ) {
        node.map(e => q.push([e.children, level + 1]));
      }
    }
  }

  return tree;

}

// console.log('Connecting...');

db.on('connected', async function() {
  console.log('Connected to database');

  const models = glob.sync(config.root + '/app/models/*.js');
  models.forEach(function (model) {
    require(model);
  });

  const User = mongoose.model('User');

  let q = [];
  let parents = [];
  let tree = generateRandomTree();

  for (let i = 0, maxi = tree.length; i < maxi; i += 1) {
    q.push( tree[i] );
    parents.push( null );
  }

  while( q.length > 0 ) {
    let node = q.shift();
    let pt = parents.shift();
    
    let realName = genRandomName();
    let username = realName.replace(' ', '').toLowerCase();

    let obj = {
      username,
      CI: genRandomCI(),
      phone: '+' + genRandomCI(),
      realName,
      email: username + '@gmail.com',
      state: 'PENDING',
      password: 'password',
      upliner: null,
      promoter: pt
    };

    let user = new User(obj);
    let result = await user.save();

    console.log('RESULT: ', result);

    for (let i = 0, maxi = node.children.length; i < maxi; i += 1) {
      q.push(node.children[i]);
      parents.push( result._id );
    }

  }

  console.log('SAVED!!');
  process.exit(0);

});

db.on('error', () => {
  throw new Error('unable to connect to database at ' + config.db);
});
