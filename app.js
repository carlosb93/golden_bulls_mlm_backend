/**
 * @author Isaac Vega Rodriguez
 * @email isaacvega1996@gmail.com
 * @description Multi-Level Marketing API (Golden Bulls Team)
 */

const express  = require('express');
const config   = require('./config/config');
const glob     = require('glob');
const mongoose = require('mongoose');

mongoose.connect(config.db);
const db = mongoose.connection;

db.on('connected', function() {
  console.log('Connected to database');

  const models = glob.sync(config.root + '/app/models/*.js');

  /// Load all the MongoDB models
  models.forEach(function (model) {
    require(model);
  });

  const app = express();

  /// Load the routing middlewares
  module.exports = require('./config/express')(app, config);

  app.listen(config.port, () => {
    console.log('Express server listening on port ' + config.port);
  });

});

db.on('error', () => {
  throw new Error('unable to connect to database at ' + config.db);
});

process.on('uncaughtException', (e) => {
  console.log('EXCEPTION: ', e);
});