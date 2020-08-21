/**
 * @author Isaac Vega Rodriguez
 * @email isaacvega1996@gmail.com
 */

'use strict';

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;


const UserStates = [ 'PENDING', 'ACTIVE', 'INACTIVE' ];
const UserCategories = ['user', 'admin', 'root'];
const UserRoles = ['client', 'distributor']
const DistributorRanges = ['golden', 'golden50', 'golden200', 'golden300', 'golden600'];

const UserSchema = new Schema({
  username: { type: String,   required: true, unique: true, lowercase: true },
  CI      : { type: String,   required: true, unique: true },
  phone   : { type: String,   required: true, unique: true },
  realName: { type: String,   required: true },
  email   : { type: String,   required: true, match: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ },
  telegram: { type: String },
  register: { type: Date },
  state   : { type: String },
  password: { type: String,   required: true },
  category: { type: String,   required: false, enum: UserCategories, default: UserCategories[0] },
  promoter: { type: ObjectId, default: null },
  upliner : { type: ObjectId, default: null },
  role    : { type: String,   required: true, enum: UserRoles, default: UserRoles[0] },
  team    : { type: ObjectId, required: false, default: null },

  // for client
  free    : { type: Boolean, default: false },

  // for distributor
  range   : { type: String, required: false, enum: DistributorRanges, default: DistributorRanges[0] },
  salary  : { type: Number, default: 0 }
});

UserSchema.pre('save', function(next) {
  if ( !this.register ) {
    this.register = new Date();
  }

  next();
});

mongoose.model('User', UserSchema);

module.exports = {
  UserCategories,
  UserRoles,
  DistributorRanges,
};