/**
 * @author Isaac Vega Rodriguez
 * @email isaacvega1996@gmail.com
 */

'use strict';

const path     = require('path');
const rootPath = path.join(__dirname, '/..');
const env      = process.env.NODE_ENV || 'development';

const config = {
  development: {
    root: rootPath,
    app: {
      name: 'golden-bulls-mlm'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://127.0.0.1/golden-bulls-mlm-development',
    apiPrefix: 'v1',
    secret: 'MY_SECRET_TOKEN_KEY'
  },

  test: {
    root: rootPath,
    app: {
      name: 'golden-bulls-mlm'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/golden-bulls-mlm-test',
    apiPrefix: 'v1',
  },

  production: {
    root: rootPath,
    app: {
      name: 'golden-bulls-mlm'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/golden-bulls-mlm-production',
    apiPrefix: 'v1',
  }
};

module.exports = config[env];