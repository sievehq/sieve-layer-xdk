/**
 * @class Layer.utils
 */
'use strict';

var _layerPatch = require('layer-patch');

var _layerPatch2 = _interopRequireDefault(_layerPatch);

var _settings = require('../settings');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


/**
 * Run the Layer Parser on the request.
 *
 * Parameters here
 * are the parameters specied in [Layer-Patch](https://github.com/layerhq/node-layer-patch)
 *
 *      layerParse({
 *          object: conversation,
 *          type: 'Conversation',
 *          operations: layerPatchOperations,
 *      });
 *
 * @method layerParse
 * @param {Object} request - layer-patch parameters
 * @param {Object} request.object - Object being updated  by the operations
 * @param {string} request.type - Type of object being updated
 * @param {Object[]} request.operations - Array of change operations to perform upon the object
 */
var parser = void 0;

function createParser(request) {
  _settings.client.once('destroy', function () {
    return parser = null;
  });

  parser = new _layerPatch2.default({
    camelCase: true,
    getObjectCallback: function getObjectCallback(id) {
      return _settings.client.getObject(id);
    },
    createObjectCallback: function createObjectCallback(id, obj) {
      return _settings.client._createObject(obj);
    },
    propertyNameMap: {
      Conversation: {
        unreadMessageCount: 'unreadCount'
      },
      Identity: {
        presence: '_presence'
      }
    },
    changeCallbacks: {
      MessagePart: {
        all: function all(updateObject, newValue, oldValue, paths) {
          updateObject._handlePatchEvent(newValue, oldValue, paths);
        }
      },
      Message: {
        all: function all(updateObject, newValue, oldValue, paths) {
          updateObject._handlePatchEvent(newValue, oldValue, paths);
        }
      },
      Conversation: {
        all: function all(updateObject, newValue, oldValue, paths) {
          updateObject._handlePatchEvent(newValue, oldValue, paths);
        }
      },
      Channel: {
        all: function all(updateObject, newValue, oldValue, paths) {
          updateObject._handlePatchEvent(newValue, oldValue, paths);
        }
      },
      Identity: {
        all: function all(updateObject, newValue, oldValue, paths) {
          updateObject._handlePatchEvent(newValue, oldValue, paths);
        }
      }
    }
  });
}

// Docs in client-utils.js
module.exports = function (request) {
  if (!parser) createParser(request);
  parser.parse(request);
};