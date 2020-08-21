/**
 * @author Isaac Vega Rodriguez
 * @email isaacvega1996@gmail.com
 */

'use strict';

const typeMap = {
  "s": "String",
  "y": "Symbol",
  "n": "Number",
  "b": "Boolean",
  "i": "BigInt",
  "f": "Function",
  "o": "Object",
  "u": "Undefined",
  "a": "Array",
};

function isType(elem, tp) {
  switch (tp) {
    case 's': {
      return typeof (elem) === 'string';
    }
    case 'y': {
      return typeof (elem) === 'symbol';
    }
    case 'n': {
      return typeof (elem) === 'number';
    }
    case 'b': {
      return typeof (elem) === 'boolean';
    }
    case 'i': {
      return typeof (elem) === 'bigint';
    }
    case 'f': {
      return typeof (elem) === 'function';
    }
    case 'o': {
      return typeof (elem) === 'object';
    }
    case 'u': {
      return typeof (elem) === 'undefined';
    }
    case 'a': {
      return Array.isArray(elem);
    }
    default: {
      return true;
    }
  }
}

module.exports = {
  typeMap,
  isType
};