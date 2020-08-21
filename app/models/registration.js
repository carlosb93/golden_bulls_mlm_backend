/**
 * @author Isaac Vega Rodriguez
 * @email isaacvega1996@gmail.com
 */

'use strict';

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const RegistrationSchema = new Schema({
  user: ObjectId,
  hash: { type: String, match: /^[0-9a-f]{64}$/ }
});

mongoose.model('Registration', RegistrationSchema);