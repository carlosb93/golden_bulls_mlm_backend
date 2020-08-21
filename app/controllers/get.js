/**
 * @author Isaac Vega Rodriguez
 * @email isaacvega1996@gmail.com
 */

'use strict';

const express         = require('express');
const mongoose        = require('mongoose');
const auth            = require('../../auth');
const arrayToTree     = require('performant-array-to-tree').arrayToTree;
const errorMessages   = require('../../utils/errorMessages');
const prepareUser     = require('../../utils/prepareUser');
const getErrorMessage = require('../../utils/errorMessages');

const router = express.Router();

const ensureAuth = auth.ensureAuthenticated;

const prefix = '/api/' + (require('../../config/config').apiPrefix);

const User = mongoose.model('User');
const Team = mongoose.model('Team');

router.get('/users', ensureAuth, function(req, res) {
  User.find({}, function(err, users) {
    if ( err ) {
      return res.status(500).jsonp({
        message: errorMessages(err)
      });
    }
    return res.status(200).json(users);
  });
});

router.get('/user/:id', ensureAuth, function(req, res) {

  const id = req.params.id;
  const conditions = [{ username: id }];

  if ( id.match(/^[0-9a-zA-Z]{24}$/) ) {
    conditions.push({
      _id: id
    });
  }

  User
    .findOne()
    .or(conditions)
    .exec(function(err, user) {
      if ( err ) {
        return res.status(500).jsonp({
          message: errorMessages(err)
        });
      }

      if ( user ) {
        return res.status(200).jsonp( prepareUser(user, user.role ));
      }

      return res.status(404).jsonp({
        message: 'User not found.'
      });

    });
});

router.get('/forest', ensureAuth, function(req, res) {
  User.find({}, function(err, users) {
    if ( err ) {
      return res.status(500).jsonp({
        message: errorMessages(err)
      });
    }

    const jsonData = arrayToTree(users, {
      id: '_id',
      parentId: 'promoter',
    });

    return res.status(200).jsonp(jsonData);
  });
});

router.get('/subtree/:id', ensureAuth, function(req, res) {

  User.find({}, function(err, users) {
    if ( err ) {
      return res.status(500).jsonp({
        message: errorMessages(err)
      });
    }

    const { id } = req.params;
    const newUsers = users.map((e) => prepareUser(e, e.role));

    const jsonData = arrayToTree(newUsers, {
      id: '_id',
      parentId: 'promoter',
    });

    const q = jsonData.map((e) => e);

    while ( q.length > 0 ) {
      const node = q.shift();

      if ( node.data._id == id || node.data.username == id ) {
        return res.status(200).jsonp(node);
      }

      node.children.forEach((e) => q.push(e));

    }

    return res.status(404).jsonp({
      message: 'User not found'
    });

  });

});

/// TODO: Fix this router to get the user information as well
router.get('/teams', ensureAuth, function(req, res) {

  Team.find({}, function(err, teams) {
    if ( err ) {
      return res.status(500).jsonp({
        message: getErrorMessage(err)
      });
    }

    return res.status(200).jsonp(teams);
  });

});

router.get('/team/:id', ensureAuth, function(req, res) {

  const { id } = req.params;

  if ( !id.match(/^[0-9a-zA-Z]{24}$/) ) {
    return res.status(400).jsonp({
      message: 'Invalid id format'
    });
  }

  Team.findOne({ _id: id }, function(err, team) {
    if ( err ) {
      return res.status(500).jsonp({
        message: getErrorMessage(err)
      });
    }

    if ( !team ) {
      return res.status(404).jsonp({
        message: 'Team not found'
      });
    }

    return res.status(200).jsonp(team);
  });

});

module.exports = (app) => {
  app.use(prefix, router);
};