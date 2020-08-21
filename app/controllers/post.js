/**
 * @author Isaac Vega Rodriguez
 * @email isaacvega1996@gmail.com
 */

'use strict';

const express         = require('express');
const mongoose        = require('mongoose');
const bcrypt          = require('bcrypt');
const crypto          = require('crypto');
const contains        = require('../../utils/contains');
const getErrorMessage = require('../../utils/errorMessages');
const prepareUser     = require('../../utils/prepareUser');
const createToken     = require('../../auth/tokenService');
const auth            = require('../../auth');

const router          = express.Router();

const ensureAuth     = auth.ensureAuthenticated;
const ensureRole     = auth.ensureRole;
const ensureCategory = auth.ensureCategory;

const User = mongoose.model('User');
const Team = mongoose.model('Team');
const Registration = mongoose.model('Registration');

const SECRET = require('../../config/config').secret;

const prefix = '/api/' + (require('../../config/config').apiPrefix);

router.post(/^\/(client|distributor)$/, ensureAuth, ensureCategory('admin'), function(req, res) {

  let { path } = req._parsedUrl;
  path = path.split('/')[1];

  const { body } = req;

  const requiredKeys = [
    [ 'username', 's'],
    [ 'CI', 's'],
    [ 'phone', 's'],
    [ 'realName', 's'],
    [ 'email', 's'],
    [ 'password', 's'],
  ];

  const err = contains(body, requiredKeys);

  if ( err ) {
    return res.status(400).jsonp({
      message: err
    });
  }

  const obj = {
    username: body.username,
    CI: body.CI,
    phone: body.phone,
    realName: body.realName,
    email: body.email,
    telegram: body.telegram || null,
    register: new Date(),
    state: 'ACTIVE',
    password: bcrypt.hashSync(body.password, 10),
    category: body.category || 'user',
    promoter: body.promoter || null,
    upliner: body.upliner || null,
    role: path,
    salary: 0,
    range: 'golden'
  };

  const user = new User( obj );

  user.save(function(err1, savedUser) {
    if ( err1 ) {
      return res.status(500).jsonp({
        message: getErrorMessage(err1)
      });
    }

    return res.status(200).jsonp( prepareUser(savedUser) );

  });

});

router.post('/login', function(req, res) {

  const { body } = req;

  const requiredKeys = [
    [ 'username', 's'],
    [ 'password', 's'],
  ];

  const err = contains(body, requiredKeys);

  if ( err ) {
    return res.status(400).jsonp({
      message: err
    });
  }

  User.find({ username: body.username }, function(err, users) {

    if ( err ) {
      return res.status(500).jsonp({
        message: getErrorMessage(err)
      });
    }

    let nonActive = false;

    for (let i = 0, maxi = users.length; i < maxi; i += 1) {
      if ( bcrypt.compareSync(body.password, users[i].password) ) {
        if ( users[i].state === 'ACTIVE' ) {
          return res.status(200).jsonp({
            token: createToken(users[i])
          });
        } else {
          nonActive = true;
        }
      }
    }

    if ( nonActive ) {
      return res.status(403).jsonp({
        message: 'User not active.'
      });
    }

    return res.status(404).jsonp({
      message: 'Invalid user or password'
    });

  });

});

router.post('/register', function(req, res) {
  const { body } = req;

  const requiredKeys = [
    [ 'username', 's'],
    [ 'CI', 's'],
    [ 'phone', 's'],
    [ 'realName', 's'],
    [ 'email', 's'],
    [ 'password', 's'],
    [ 'role', 's'],
  ];

  const err = contains(body, requiredKeys);

  if ( err ) {
    return res.status(400).jsonp({
      message: err
    });
  }

  for (let i = 0, maxi = requiredKeys.length; i < maxi; i += 1) {
    body[ requiredKeys[i][0] ] = body[ requiredKeys[i][0] ].trim();
  }

  if ( !body.role.match(/^(client|distributor)$/) ) {
    return res.status(400).jsonp({
      message: 'Unknown user role [' + body.role + ']. Expected [client, distributor].'
    });
  }

  const obj = {
    username: body.username,
    CI: body.CI,
    phone: body.phone,
    realName: body.realName,
    email: body.email,
    telegram: body.telegram || null,
    register: new Date(),
    state: 'PENDING',
    password: bcrypt.hashSync(body.password, 10),
    category: body.category || 'user',
    promoter: body.promoter || null,
    upliner: body.upliner || null,
    role: body.role,
    salary: 0,
    range: 'golden'
  };

  const user = new User( obj );

  user.save(function(err1, savedUser) {
    if ( err1 ) {
      return res.status(500).jsonp({
        message: getErrorMessage(err1)
      });
    }

    let hash = crypto
      .createHmac('sha256', SECRET)
      .update( JSON.stringify(savedUser) )
      .digest('hex');

    let record = new Registration({
      user: savedUser._id,
      hash
    });

    record.save(function(err2) {
      if ( err2 ) {
        return res.status(500).jsonp({
          message: getErrorMessage(err2)
        });
      }

      return res.status(200).jsonp( Object.assign({
        hash
      }, prepareUser(savedUser)) );
    });

  });
});

router.post('/team', ensureAuth, ensureRole('distributor'), function(req, res) {

  const { body } = req;
  const team = new Team({
    distributor: req.user._id,
    name: body.name || ''
  });

  team.save(function(err, savedTeam) {
    if ( err ) {
      return res.status(500).jsonp({
        message: getErrorMessage(err)
      });
    }

    return res.status(200).jsonp(savedTeam);
  });

});

router.all('/activate/:hash', function(req, res) {

  let { hash } = req.params;

  Registration.findOne({ hash }, function(err, register) {
    if ( err ) {
      return res.status(500).jsonp({
        message: getErrorMessage(err)
      });
    }

    if ( !register ) {
      return res.status(400).jsonp({
        message: 'Invalid code.'
      });
    }

    User.findOne({ _id: register.user }, function(err1, user) {
      if ( err1 ) {
        return res.status(500).jsonp({
          message: getErrorMessage(err1)
        });
      }

      if ( !user ) {
        register.remove();
        return res.status(500).jsonp({
          message: 'Invalid code.'
        });
      }

      if ( user.state != 'ACTIVE' ) {
        user.state = 'ACTIVE';
        user.save()
          .then(() => register.remove())
          .then(() => res.status(200).jsonp(user))
          .catch(e => res.status(500).jsonp({
            message: 'Error when trying to activate user. Please try later.'
          }));
      } else {
        return res.status(200).jsonp(user);
      }

    });
  });

});

module.exports = (app) => {
  app.use(prefix, router);
};