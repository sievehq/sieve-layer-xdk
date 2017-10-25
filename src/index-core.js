import Constants from './constants';
import Core from './core';
import Util from './util';

const version = '1.0.0-pre1.10';

function init(options) {
  const client = new Core.Client(options);
  return client;
}

module.exports = { Core, Util, Constants, init, version };
if (typeof global !== 'undefined') global.Layer = global.layer = module.exports;