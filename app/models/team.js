/**
 * @author Isaac Vega Rodriguez
 * @email isaacvega1996@gmail.com
 */

'use strict';

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const TeamSchema = new Schema({
  distributor: { type: ObjectId,     required: true },
  name       : { type: String,       required: false },
  branch1    : { type: [ ObjectId ], required: false, default: [] },
  branch2    : { type: [ ObjectId ], required: false, default: [] },
  branch3    : { type: [ ObjectId ], required: false, default: [] },
});

mongoose.model('Team', TeamSchema);