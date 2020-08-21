/**
 * @author Isaac Vega Rodriguez
 * @email isaacvega1996@gmail.com
 */

'use strict';

const express         = require('express');
const router          = express.Router();
const mongoose        = require('mongoose');
const contains        = require('../../utils/contains');
const getErrorMessage = require('../../utils/errorMessages');
const auth            = require('../../auth');

const ensureAuth = auth.ensureAuthenticated;
const ensureRole = auth.ensureRole;

const User = mongoose.model('User');
const Team = mongoose.model('Team');

const prefix = '/api/' + (require('../../config/config').apiPrefix);

router.put('/team/:id', ensureAuth, ensureRole('distributor'), function(req, res) {

  const authUser = req.user;
  const { body } = req;
  const { id } = req.params;

  if ( !id.match(/^[0-9a-zA-Z]{24}$/) ) {
    return res.status(400).jsonp({
      message: 'Invalid id format'
    });
  }

  const requiredKeys = [
    [ 'username', 's'],
    [ 'branch', 's'],
  ];

  const err = contains(body, requiredKeys);

  if ( err ) {
    return res.status(400).jsonp({
      message: err
    });
  }

  if ( !body.branch.match(/^branch[1-3]$/) ) {
    return res.status(400).jsonp({
      message: 'Invalid branch name'
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

    // console.log('IDS: ', authUser._id, team.distributor, authUser._id == team.distributor);

    if ( authUser._id != team.distributor ) {
      return res.status(403).jsonp({
        message: 'Only the owner of the team can modify it'
      });
    }

    User.findOne({ username: body.username }, function(err1, user) {
      if ( err1 ) {
        return res.status(500).jsonp({
          message: getErrorMessage(err1)
        });
      }

      if ( !user ) {
        return res.status(404).jsonp({
          message: 'User not found'
        });
      }

      if ( user.team ) {
        return res.status(403).jsonp({
          message: 'The user is already in one team'
        });
      }

      user.team = team._id;
      team[body.branch].push( user._id );

      Promise.all([ user.save(), team.save() ])
        .then(() => {
          // console.log('PROMISE_ALL: ', e);

          res.status(200).jsonp({
            message: 'Saved user to the team'
          });
        })
        .catch((err) => {
          console.log('PROMISE ERROR');
          return res.status(500).jsonp({
            message: getErrorMessage(err)
          });
        });

    });

  });

});

module.exports = (app) => {
  app.use(prefix, router);
};