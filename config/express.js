/**
 * @author Isaac Vega Rodriguez
 * @email isaacvega1996@gmail.com
 */

'use strict';

const express        = require('express');
const glob           = require('glob');
const logger         = require('morgan');
const cookieParser   = require('cookie-parser');
const bodyParser     = require('body-parser');
const compress       = require('compression');
const methodOverride = require('method-override');

module.exports = (app, config) => {
  const env = process.env.NODE_ENV || 'development';

  app.locals.ENV = env;
  app.locals.ENV_DEVELOPMENT = env == 'development';

  // app.set('views', config.root + '/app/views');
  // app.set('view engine', 'pug');

  // app.use(favicon(config.root + '/public/img/favicon.ico'));

  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(cookieParser());
  app.use(compress());
  app.use(express.static(config.root + '/public'));
  app.use(methodOverride());

  var controllers = glob.sync(config.root + '/app/controllers/*.js');
  controllers.forEach((controller) => {
    require(controller)(app);
  });

  app.use((req, res) => res.status(404).jsonp({
      message: 'Resource not found'
    }));

  return app;
};