/**
 * @author Isaac Vega Rodriguez
 * @email isaacvega1996@gmail.com
 */

'use strict';

module.exports = function getErrorMessage(err) {
  // console.log('ERROR: ', err);
  const msg = err.message;

  if ( err.name === 'CastError' ) {
    return `Invalid value '${err.value}' for type ${err.kind}`;
  } else if ( err.code === 11000 ) {
    const keyError = msg
      .split(/[.\s]/g)
      .filter((e) => e.match(/^\$.*_[0-9]*$/))
      .map((e) => e.replace(/\$/g, '').split('_')[0])[0]

    return `Duplicated field '${keyError}'`;
  }

  return 'Database Error. Please check for valid fields';

};