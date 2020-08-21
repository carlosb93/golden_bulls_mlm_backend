/**
 * @author Isaac Vega Rodriguez
 * @email isaacvega1996@gmail.com
 */

'use strict';

const jwt          = require('jwt-simple');
const moment       = require('moment');
const TOKEN_SECRET = require('../config/config').secret;

const prepareUser = require('../utils/prepareUser');

function createToken(user) {

  var payload = {
    sub: prepareUser(user, user.role),
    iat: moment().unix(),
    exp: moment()
          .add(20, 'm')
          .unix()
  };

  return jwt.encode(payload, TOKEN_SECRET);

}

module.exports = createToken;