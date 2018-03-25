/**
 * Allows all components to have a clientId instead of a client pointer.
 * Allows an app to have multiple Clients, each with its own appId.
 * Provides a global utility that can be required by all modules for accessing
 * the client.
 *
 * @class  Layer.Core.ClientRegistry
 * @private
 */
'use strict';

var _utils = require('../utils');

var registry = {}; 

var listeners = [];

/**
 * Register a new Client; will destroy any previous client with the same appId.
 *
 * @method register
 * @param  {Layer.Core.Client} client
 */
function register(client) {
  var appId = client.appId;
  if (registry[appId] && !registry[appId].isDestroyed) {
    registry[appId].destroy();
  }
  registry[appId] = client;

  (0, _utils.defer)(function () {
    return listeners.forEach(function (listener) {
      return listener(client);
    });
  });
}

/**
 * Removes a Client.
 *
 * @method unregister
 * @param  {Layer.Core.Client} client
 */
function unregister(client) {
  if (registry[client.appId]) delete registry[client.appId];
}

/**
 * Get a Client by appId
 *
 * @method get
 * @param  {string} appId
 * @return {Layer.Core.Client}
 */
function get(appId) {
  return registry[appId] || null;
}

function getAll() {
  return Object.keys(registry).map(function (key) {
    return registry[key];
  });
}

/**
 * Register a listener to be called whenever a new client is registered.
 *
 * @method addListener
 * @param {Function} listener
 * @param {Layer.Core.Client} listener.client
 */
function addListener(listener) {
  listeners.push(listener);
}

/**
 * Remove a registered listener or all listeners.
 *
 * If called with no arguments or null arguments, removes all listeners.
 *
 * @method removeListener
 * @param {Function} listener
 */
function removeListener(listener) {
  if (listener) {
    var index = listeners.indexOf(listener);
    if (index >= 0) listeners.splice(index, 1);
  } else {
    listeners.splice(0, listeners.length);
  }
}

module.exports = {
  get: get,
  getAll: getAll,
  register: register,
  unregister: unregister,
  addListener: addListener,
  removeListener: removeListener
};