/**
 * @author Isaac Vega Rodriguez
 * @email isaacvega1996@gmail.com
 */

'use strict';

let chai         = require('chai');
let chaiHttp     = require('chai-http');
let express      = require('express');
let bcrypt       = require('bcrypt');
let mongoose     = require('mongoose');
let glob         = require('glob');

let config       = require('../config/config');
let tokenService = require('../auth/tokenService');

const expect = chai.expect;

async function test() {
  // mongoose.connect(config.db);
  // const db = mongoose.connection;

  const db = await mongoose.connect(config.db);

  if ( !db ) {
    console.log('Error when connecting to database.');
    process.exit(1);
  }

  // db.on('connected', function() {

  /// Loading database models
  const models = glob.sync(config.root + '/app/models/*.js');
  models.forEach(function (model) {
    require(model);
  });

  /// Server instance
  const app = express();

  /// Load global middlewares except for the logger
  require('../config/express')(app, config);

  /// Plugin chai request
  chai.use(chaiHttp);

  let prefix = '/api/' + config.apiPrefix;
  let User = mongoose.model('User');
  let Team = mongoose.model('Team');

  let tempClient = new User({
    username: '__tempclient__',
    CI: '__tempclient__',
    phone: '__tempclient__',
    realName: '__TEMPORALCLIENT__',
    email: 'temporalclientuser@gmail.com',
    password: bcrypt.hashSync('temporalclient', 10),
    role: 'client',
    team: '5e8cd5865f384d21081b9764'
  });

  let tempDistributor = new User({
    username: '__tempdistributor__',
    CI: '__tempdistributor__',
    phone: '__tempdistributor__',
    realName: '__TEMPORALDISTRIBUTOR__',
    email: 'temporaldistributoruser@gmail.com',
    password: bcrypt.hashSync('temporaldistributor', 10),
    role: 'distributor',
  });

  let tempDistributor1 = new User({
    username: '__tempdistributor1__',
    CI: '__tempdistributor1__',
    phone: '__tempdistributor1__',
    realName: '__TEMPORALDISTRIBUTOR1__',
    email: 'temporaldistributor1user@gmail.com',
    password: bcrypt.hashSync('temporaldistributor1', 10),
    role: 'distributor',
  });

  let tempAdmin = new User({
    username: '__tempadmin__',
    CI: '__tempadmin__',
    phone: '__tempadmin__',
    realName: '__TEMPORALADMIN__',
    email: 'temporaladminuser@gmail.com',
    password: bcrypt.hashSync('temporaladmin', 10),
    role: 'distributor',
    category: 'admin'
  });

  let tempTeam = null;

  let tempClientToken = null;
  let tempDistributorToken = null;
  let tempDistributor1Token = null;
  let tempAdminToken = null;

  /// Set up needed stuff before the tests
  before(function(done) {
    Promise
      .all([
        tempClient.save(),
        tempDistributor.save(),
        tempDistributor1.save(),
        tempAdmin.save()
      ])
      .then(() => {
        tempClientToken = tokenService(tempClient);
        tempDistributorToken = tokenService(tempDistributor);
        tempDistributor1Token = tokenService(tempDistributor1);
        tempAdminToken = tokenService(tempAdmin);
        tempTeam = new Team({
          name: 'My Awesome Team',
          distributor: tempDistributor._id
        });

        return tempTeam.save().then(() => {
          done();
        });
      })
      .catch(() => {
        console.error('Could not create temporal users.');
        process.exit(1);
      });
  });

  /// Clean up environment and exit
  after(function(done) {
    Promise
      .all([
        tempClient.remove(),
        tempDistributor.remove(),
        tempDistributor1.remove(),
        tempAdmin.remove(),
        tempTeam.remove()
      ])
      .then(() => {
        done();
        process.exit(0);
      })
      .catch(() => {
        console.error('Could not remove temporal data.');
        process.exit(1);
      });
  })

  /// GET
  /// /users
  describe(`GET ${prefix}/users`, function() {
    this.timeout(0);
    
    let route = `${prefix}/users`;

    it('Should return unauthorized code without token', function(done) {
      chai
        .request(app)
        .get(route)
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(401);
          done();
        });
    });

    it('Should return unauthorized code with an invalid token', function(done) {
      chai
        .request(app)
        .get(route)
        .set({
          'Authorization': `Token thisIsMyFakeTokenBaby`
        })
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(401);
          done();
        });
    });

    it('Should return the list of users', function(done) {
      chai
        .request(app)
        .get(route)
        .set({
          'Authorization': `Token ${tempClientToken}`
        })
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          done();
        });
    });

  });

  /// ------------------------------------------------------------------
  /// /user/:id
  describe(`GET ${prefix}/user/:id`, function() {
    this.timeout(0);
    
    let route = `${prefix}/user/`;
    
    it('Should return unauthorized code without token', function(done) {
      chai
        .request(app)
        .get(route + tempClient._id)
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(401);
          done();
        });
      });
      
      it('Should return unauthorized code with an invalid token', function(done) {
        chai
        .request(app)
        .get(route + tempClient._id)
        .set({
          'Authorization': `Token thisIsMyFakeTokenBaby`
        })
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(401);
          done();
        });
      });
      
      it('Should return not found for a null user', function(done) {
        chai
        .request(app)
        .get(route + '0'.repeat(24))
        .set({
          'Authorization': `Token ${tempClientToken}`
        })
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(404);
          done();
        });
      });
      
      it('Should return the temporal client taken by id', function(done) {
      chai
      .request(app)
      .get(route + tempClient._id)
      .set({
        'Authorization': `Token ${tempClientToken}`
      })
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          done();
        });
      });
      
      it('Should return the temporal client taken by username', function(done) {
        chai
        .request(app)
        .get(route + tempClient.username)
        .set({
          'Authorization': `Token ${tempClientToken}`
        })
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          done();
        });
      });
      
    });
    
  /// ------------------------------------------------------------------
  /// /forest
  describe(`GET ${prefix}/forest`, function() {
    this.timeout(0);
    
    let route = `${prefix}/forest`;
    
    it('Should return unauthorized code without token', function(done) {
      chai
      .request(app)
      .get(route)
      .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(401);
          done();
        });
      });
      
      it('Should return unauthorized code with an invalid token', function(done) {
        chai
        .request(app)
        .get(route)
        .set({
          'Authorization': `Token thisIsMyFakeTokenBaby`
        })
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(401);
          done();
        });
      });
      
      it('Should return a list with all users in a tree', function(done) {
        chai
        .request(app)
        .get(route)
        .set({
          'Authorization': `Token ${tempClientToken}`
        })
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          done();
        });
      });
      
    });

  /// ------------------------------------------------------------------
  /// /subtree/:id
  describe(`GET ${prefix}/subtree/:id`, function() {
    this.timeout(0);
    
    let route = `${prefix}/subtree/`;
    
    it('Should return unauthorized code without token', function(done) {
      chai
      .request(app)
      .get(route + tempClient._id)
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(401);
        done();
        });
      });
      
      it('Should return unauthorized code with an invalid token', function(done) {
        chai
        .request(app)
        .get(route + tempClient._id)
        .set({
          'Authorization': `Token thisIsMyFakeTokenBaby`
        })
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(401);
          done();
        });
    });
    
    it('Should return not found error for a null user', function(done) {
      chai
      .request(app)
        .get(route + '0'.repeat(24))
        .set({
          'Authorization': `Token ${tempClientToken}`
        })
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(404);
          done();
        });
      });
      
      it('Should return a subtree of the current user', function(done) {
        chai
        .request(app)
        .get(route + tempClient._id)
        .set({
          'Authorization': `Token ${tempClientToken}`
        })
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          done();
        });
      });
      
  });
  
  /// ------------------------------------------------------------------
  /// /teams
  describe(`GET ${prefix}/teams`, function() {
    this.timeout(0);
    
    let route = `${prefix}/teams`;
    
    it('Should return unauthorized code without token', function(done) {
      chai
      .request(app)
      .get(route)
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(401);
        done();
      });
    });
    
    it('Should return unauthorized code with an invalid token', function(done) {
      chai
      .request(app)
      .get(route)
      .set({
        'Authorization': `Token thisIsMyFakeTokenBaby`
      })
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(401);
        done();
      });
    });
    
    it('Should return all teams', function(done) {
      chai
      .request(app)
      .get(route)
      .set({
        'Authorization': `Token ${tempClientToken}`
      })
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        done();
      });
    });
    
  });

  /// ------------------------------------------------------------------
  /// /teams
  describe(`GET ${prefix}/team/:id`, function() {
    this.timeout(0);
    
    let route = `${prefix}/team/`;
    
    it('Should return unauthorized code without token', function(done) {
      chai
      .request(app)
      .get(route + tempTeam._id)
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(401);
        done();
      });
    });
    
    it('Should return unauthorized code with an invalid token', function(done) {
      chai
      .request(app)
      .get(route + tempTeam._id)
      .set({
        'Authorization': `Token thisIsMyFakeTokenBaby`
      })
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(401);
        done();
      });
    });
    
    it('Should return the temporal team', function(done) {
      chai
      .request(app)
      .get(route + tempTeam._id)
      .set({
        'Authorization': `Token ${tempClientToken}`
      })
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res).to.have.property('body');
        expect(res.body).to.have.property('_id');
        expect(res.body._id).to.be.eq( tempTeam._id.toString() );
        done();
      });
    });
    
  });

  /// ------------------------------------------------------------------
  /// /invalidroute
  describe(`GET Invalid route`, function() {
    this.timeout(0);

    it('Should return not found error for an in valid route', function(done) {
      chai
      .request(app)
      .get('/thisismyinvalidroute')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(404);
        done();
      })
    });
  });

  //*/

  /// ------------------------------------------------------------------
  /// ------------------------------------------------------------------
  /// POST
  /// /client
  describe(`POST ${prefix}/client`, function() {
    this.timeout(0);
    
    let route = `${prefix}/client`;
    
    it('Should return unauthorized code without token', function(done) {
      chai
      .request(app)
      .post(route)
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(401);
        done();
      });
    });
    
    it('Should return unauthorized code with an invalid token', function(done) {
      chai
      .request(app)
      .post(route)
      .set({
        'Authorization': `Token thisIsMyFakeTokenBaby`
      })
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(401);
        done();
      });
    });
    
    it('Should return unauthorized for a non-admin user', function(done) {
      chai
      .request(app)
      .post(route)
      .set({
        'Authorization': `Token ${tempClientToken}`
      })
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(403);
        expect(res).to.be.json;
        done();
      });
    });

    it('Should return user error for not enough data', function(done) {
      chai
      .request(app)
      .post(route)
      .set({
        'Authorization': `Token ${tempAdminToken}`
      })
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        done();
      });
    });

    it('Should return error for an existing username', function(done) {
      chai
      .request(app)
      .post(route)
      .type('form')
      .set({
        'Authorization': `Token ${tempAdminToken}`
      })
      .send({
        username: '__tempclient__',
        CI: '__tempclient__',
        phone: '__tempclient__',
        realName: '__TEMPCLIENT__',
        email: 'temporalclientuser@gmail.com',
        password: 'password',
      })
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(500);
        expect(res).to.be.json;
        done();
      });
    });

    it('Should create a client', function(done) {
      chai
      .request(app)
      .post(route)
      .type('form')
      .set({
        'Authorization': `Token ${tempAdminToken}`
      })
      .send({
        username: '__tempclient1__',
        CI: '__tempclient1__',
        phone: '__tempclient1__',
        realName: '__TEMPCLIENT1__',
        email: 'temporalclient1user@gmail.com',
        password: 'password',
      })
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res).to.have.property('body');
        expect(res.body).to.have.property('role');
        expect(res.body.role).to.be.eq('client');
        User.findOneAndRemove({ username: '__tempclient1__' }, () => {
          done();
        });
      });
    });
    
  });

  /// ------------------------------------------------------------------
  /// /distributor
  describe(`POST ${prefix}/distributor`, function() {
    this.timeout(0);
    
    let route = `${prefix}/distributor`;
    
    it('Should return unauthorized code without token', function(done) {
      chai
      .request(app)
      .post(route)
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(401);
        done();
      });
    });
    
    it('Should return unauthorized code with an invalid token', function(done) {
      chai
      .request(app)
      .post(route)
      .set({
        'Authorization': `Token thisIsMyFakeTokenBaby`
      })
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(401);
        done();
      });
    });
    
    it('Should return unauthorized for a non-admin user', function(done) {
      chai
      .request(app)
      .post(route)
      .set({
        'Authorization': `Token ${tempClientToken}`
      })
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(403);
        expect(res).to.be.json;
        done();
      });
    });

    it('Should return user error for not enough data', function(done) {
      chai
      .request(app)
      .post(route)
      .set({
        'Authorization': `Token ${tempAdminToken}`
      })
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        done();
      });
    });

    it('Should create a distributor', function(done) {
      chai
      .request(app)
      .post(route)
      .type('form')
      .set({
        'Authorization': `Token ${tempAdminToken}`
      })
      .send({
        username: '__tempdistributor2__',
        CI: '__tempdistributor2__',
        phone: '__tempdistributor2__',
        realName: '__TEMPDISTRIBUTOR2__',
        email: 'temporaldistributor2user@gmail.com',
        password: 'password',
      })
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res).to.have.property('body');
        expect(res.body).to.have.property('role');
        expect(res.body.role).to.be.eq('distributor');
        User.findOneAndRemove({ username: '__tempdistributor2__' }, () => {
          done();
        });
      });
    });
    
  });

  /// ------------------------------------------------------------------
  /// /login
  describe(`POST ${prefix}/login`, function() {
    this.timeout(0);
    
    let route = `${prefix}/login`;
    
    it('Should return format error with an empty form', function(done) {
      chai
      .request(app)
      .post(route)
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        done();
      });
    });

    it('Should return not found error', function(done) {
      chai
      .request(app)
      .post(route)
      .type('form')
      .send({
        username: '!@#$%^&*()',
        password: 'password'
      })
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(404);
        done();
      });
    });

    it('Should login correctly', function(done) {
      chai
      .request(app)
      .post(route)
      .type('form')
      .send({
        username: '__tempadmin__',
        password: 'temporaladmin',
      })
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.have.property('body');
        expect(res.body).to.have.property('token');
        expect(res.body.token).to.be.a('string');
        done();
      });
    });
    
  });

  /// ------------------------------------------------------------------
  /// /team
  describe(`POST ${prefix}/team`, function() {
    this.timeout(0);
    
    let route = `${prefix}/team`;
    
    it('Should return unauthorized code without token', function(done) {
      chai
      .request(app)
      .post(route)
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(401);
        done();
      });
    });
    
    it('Should return unauthorized code with an invalid token', function(done) {
      chai
      .request(app)
      .post(route)
      .set({
        'Authorization': `Token thisIsMyFakeTokenBaby`
      })
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(401);
        done();
      });
    });
    
    it('Should return unauthorized for a non-distributor user', function(done) {
      chai
      .request(app)
      .post(route)
      .set({
        'Authorization': `Token ${tempClientToken}`
      })
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(403);
        expect(res).to.be.json;
        done();
      });
    });

    it('Should create a team', function(done) {
      chai
      .request(app)
      .post(route)
      .type('form')
      .set({
        'Authorization': `Token ${tempDistributorToken}`
      })
      .send({
        name: 'my awesome team'
      })
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res).to.have.property('body');
        expect(res.body).to.have.property('name');
        expect(res.body.name).to.be.eq('my awesome team');
        expect(res.body).to.have.property('distributor');
        expect(res.body.distributor).to.be.eq(tempDistributor._id.toString());

        Team.findOneAndRemove({ name: 'my awesome team' }, () => {
          done();
        });
      });
    });
    
  });

  /// ------------------------------------------------------------------
  /// /invalidroute
  describe(`POST Invalid route`, function() {
    this.timeout(0);

    it('Should return not found error for an in valid route', function(done) {
      chai
      .request(app)
      .post('/thisismyinvalidroute')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(404);
        done();
      })
    });
  });

  /// ------------------------------------------------------------------
  /// ------------------------------------------------------------------
  /// PUT
  /// /team/:id
  describe(`PUT ${prefix}/team/:id`, function() {
    this.timeout(0);
    
    let route = `${prefix}/team/`;
    
    it('Should return unauthorized code without token', function(done) {
      chai
      .request(app)
      .put(route + tempTeam._id)
      .type('form')
      .send({
        username: 'someuser',
        branch: 'branch1'
      })
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(401);
        done();
      });
    });
    
    it('Should return unauthorized code with an invalid token', function(done) {
      chai
      .request(app)
      .put(route + tempTeam._id)
      .set({
        'Authorization': `Token thisIsMyFakeTokenBaby`
      })
      .type('form')
      .send({
        username: 'someuser',
        branch: 'branch1'
      })
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(401);
        done();
      });
    });
    
    it('Should return unauthorized for a non-distributor user', function(done) {
      chai
      .request(app)
      .put(route + tempTeam._id)
      .set({
        'Authorization': `Token ${tempClientToken}`
      })
      .type('form')
      .send({
        username: 'someuser',
        branch: 'branch1'
      })
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(403);
        expect(res).to.be.json;
        done();
      });
    });

    it('Should return bad request error (invalid id)', function(done) {
      chai
      .request(app)
      .put(route + 'this_is_an_invalid_id')
      .set({
        'Authorization': `Token ${tempDistributorToken}`
      })
      .type('form')
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        done();
      });
    });

    it('Should return bad request error (not enough data)', function(done) {
      chai
      .request(app)
      .put(route + tempTeam._id)
      .set({
        'Authorization': `Token ${tempDistributorToken}`
      })
      .type('form')
      .send({
        username: 'someuser'
      })
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        done();
      });
    });

    it('Should return bad request error (invalid branch)', function(done) {
      chai
      .request(app)
      .put(route + tempTeam._id)
      .set({
        'Authorization': `Token ${tempDistributorToken}`
      })
      .type('form')
      .send({
        username: 'someuser',
        branch: 'invalidBranch'
      })
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        done();
      });
    });

    it('Should return not found (null team id)', function(done) {
      chai
      .request(app)
      .put(route + '0000000000000000')
      .set({
        'Authorization': `Token ${tempDistributorToken}`
      })
      .type('form')
      .send({
        username: 'someuser',
        branch: 'branch1'
      })
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        done();
      });
    });

    it('Should return unauthorized for an external distributor', function(done) {
      chai
      .request(app)
      .put(route + tempTeam._id)
      .set({
        'Authorization': `Token ${tempDistributor1Token}`
      })
      .type('form')
      .send({
        username: 'someuser',
        branch: 'branch1'
      })
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(403);
        expect(res).to.be.json;
        done();
      });
    });

    it('Should return user not found', function(done) {
      chai
      .request(app)
      .put(route + tempTeam._id)
      .set({
        'Authorization': `Token ${tempDistributorToken}`
      })
      .type('form')
      .send({
        username: '__(invalidUser)__',
        branch: 'branch1'
      })
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(404);
        expect(res).to.be.json;
        done();
      });
    });

    it('Should return unauthorized error (user already in a team)', function(done) {
      chai
      .request(app)
      .put(route + tempTeam._id)
      .set({
        'Authorization': `Token ${tempDistributorToken}`
      })
      .type('form')
      .send({
        username: tempClient.username,
        branch: 'branch1'
      })
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(403);
        expect(res).to.be.json;
        done();
      });
    });

    it('Should add user to team', function(done) {
      chai
      .request(app)
      .put(route + tempTeam._id)
      .set({
        'Authorization': `Token ${tempDistributorToken}`
      })
      .type('form')
      .send({
        username: tempAdmin.username,
        branch: 'branch1'
      })
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        done();
      });
    });
    
  });

  /// ------------------------------------------------------------------
  /// /invalidroute
  describe(`PUT Invalid route`, function() {
    this.timeout(0);

    it('Should return not found error for an in valid route', function(done) {
      chai
      .request(app)
      .put('/thisismyinvalidroute')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(404);
        done();
      })
    });
  });

  run();
  
}

test();
