/**
 * @author Isaac Vega Rodriguez
 * @email isaacvega1996@gmail.com
 */

'use strict';

const jwt             = require('jwt-simple');
const moment          = require('moment');
const TOKEN_SECRET    = require('../config/config').secret;
const USER_CATEGORIES = require('../app/models/user').UserCategories;

function ensureAuthenticated(req, res, next) {

  if ( !req.headers.authorization ) {
    return res.status(401).jsonp({ message: 'Authorization required' });
  }

  var token = req.headers.authorization.split(' ')[1];

  try {
    var payload = jwt.decode(token, TOKEN_SECRET);

    if ( payload.exp <= moment().unix() ) {
      return res.status(401).jsonp({ message: 'Token expired' });
    }

    req.user = payload.sub;

    return next();
  } catch (e) {
    return res.status(401).jsonp({ message: 'Invalid token' });
  }

}

/// IMPORTANT: Should be used after ensureAuthenticated middleware
function ensureRole(role) {

  return function(req, res, next) {
    // if ( req.user ) {
    if ( req.user.role === role ) {
      return next();
    }
    return res.status(403).jsonp({
      message: 'You need to be at least \'' + role + '\'.'
    });
    // } else {
    //   return res.status(403).jsonp({ message: 'Authorization required' });
    // }
  }
}

function atLeast(a, b, arr) {
  const pos1 = arr.indexOf(a);
  const pos2 = arr.indexOf(b);

  return pos1 >= pos2;
}

/// IMPORTANT: Should be used after ensureAuthenticated middleware
function ensureCategory(category) {

  return function(req, res, next) {
    // if ( req.user ) {
      if ( atLeast(req.user.category, category, USER_CATEGORIES) ) {
        return next();
      }
      return res.status(403).jsonp({
        message: 'You need to be at least \'' + category + '\'.'
      });
    // } else {
    //   return res.status(403).jsonp({ message: 'Authorization required' });
    // }
  }
}

module.exports = {
  ensureAuthenticated,
  ensureRole,
  ensureCategory,
};