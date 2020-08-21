/**
 * @author Isaac Vega Rodriguez
 * @email isaacvega1996@gmail.com
 */

'use strict';

module.exports = function prepareUser(user, _role) {

  const role = _role || user.role;

  const commonKeys = [
    '_id', 'username', 'CI', 'phone', 'realName', 'email',
    'telegram', 'register', 'state', 'password', 'category',
    'promoter', 'upliner', 'role'
];

  const clientKeys = ['free'];

  const distributorKeys = ['range', 'salary'];

  const result = {};

  const copyValues = function(obj1, obj2, keys) {
    for (let i = 0, maxi = keys.length; i < maxi; i += 1) {
      obj1[keys[i]] = obj2[keys[i]];
    }
  };

  copyValues(result, user, commonKeys);

  if ( role === 'client' ) {
    copyValues(result, user, clientKeys);
  } else if ( role === 'distributor' ) {
    copyValues(result, user, distributorKeys);
  }

  return result;

}