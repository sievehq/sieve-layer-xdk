/**
 * @class  Layer.Core.Websockets.ChangeManager
 * @private
 *
 * This class listens for `change` events from the websocket server,
 * and processes them.
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); 


var _settings = require('../../settings');

var _namespace = require('../namespace');

var _namespace2 = _interopRequireDefault(_namespace);

var _utils = require('../../utils');

var _utils2 = _interopRequireDefault(_utils);

var _message = require('../models/message');

var _message2 = _interopRequireDefault(_message);

var _container = require('../models/container');

var _container2 = _interopRequireDefault(_container);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WebsocketChangeManager = function () {
  /**
   * Create a new websocket change manager
   *
   *      var websocketChangeManager = new Layer.Core.Websockets.ChangeManager({
   *          socketManager: client.Websockets.SocketManager
   *      });
   *
   * @method
   * @param  {Object} options
   * @param {Layer.Core.Websockets.SocketManager} socketManager
   * @returns {Layer.Core.Websockets.ChangeManager}
   */
  function WebsocketChangeManager(options) {
    _classCallCheck(this, WebsocketChangeManager);

    options.socketManager.on('message', this._handleChange, this);
  }

  /**
   * Handles a Change packet from the server.
   *
   * @method _handleChange
   * @private
   * @param  {Layer.Core.LayerEvent} evt
   */


  _createClass(WebsocketChangeManager, [{
    key: '_handleChange',
    value: function _handleChange(evt) {
      if (evt.data.type === 'change') {
        this._processChange(evt.data.body);
      } else if (evt.data.type === 'operation') {
        _settings.client.trigger('websocket:operation', { data: evt.data.body });
      }
    }

    /**
     * Process changes from a change packet.
     *
     * Called both by _handleChange, and by the requestManager on getting a changes array.
     *
     * @method _processChanage
     * @private
     * @param {Object} msg
     */

  }, {
    key: '_processChange',
    value: function _processChange(msg) {
      switch (msg.operation) {
        case 'create':
          _utils.logger.info('Websocket Change Event: Create ' + msg.object.type + ' ' + msg.object.id);
          _utils.logger.debug(msg.data);
          this._handleCreate(msg);
          break;
        case 'delete':
          _utils.logger.info('Websocket Change Event: Delete ' + msg.object.type + ' ' + msg.object.id);
          _utils.logger.debug(msg.data);
          this._handleDelete(msg);
          break;
        case 'update':
          _utils.logger.info('Websocket Change Event: ' + ('Patch ' + msg.object.type + ' ' + msg.object.id + ': ' + msg.data.map(function (op) {
            return op.property;
          }).join(', ')));
          _utils.logger.debug(msg.data);
          this._handlePatch(msg);
          break;
      }
    }

    /**
     * Process a create object message from the server
     *
     * @method _handleCreate
     * @private
     * @param  {Object} msg
     */

  }, {
    key: '_handleCreate',
    value: function _handleCreate(msg) {
      msg.data.fromWebsocket = true;
      var obj = _settings.client._createObject(msg.data);
      if (obj) obj._loadType = 'websocket';
    }

    /**
     * Handles delete object messages from the server.
     * All objects that can be deleted from the server should
     * provide a _deleted() method to be called prior to destroy().
     *
     * @method _handleDelete
     * @private
     * @param  {Object} msg
     */

  }, {
    key: '_handleDelete',
    value: function _handleDelete(msg) {
      var entity = this.getObject(msg);
      if (entity) {
        entity._handleWebsocketDelete(msg.data);
      }
    }

    /**
     * On receiving an update/patch message from the server
     * run the LayerParser on the data.
     *
     * @method _handlePatch
     * @private
     * @param  {Object} msg
     */

  }, {
    key: '_handlePatch',
    value: function _handlePatch(msg) {
      // Can only patch a cached object
      var entity = this.getObject(msg);
      if (entity) {
        try {
          entity._inLayerParser = true;
          _utils2.default.layerParse({
            object: entity,
            type: msg.object.type,
            operations: msg.data
          });
          entity._inLayerParser = false;
        } catch (err) {
          _utils.logger.error('websocket-manager: Failed to handle event', msg.data);
        }
      } else {
        switch (_utils2.default.typeFromID(msg.object.id)) {
          case 'channels':
          case 'conversations':
            if (_container2.default._loadResourceForPatch(msg.data)) _settings.client.getObject(msg.object.id, true);
            break;

          case 'messages':
            if (_message2.default._loadResourceForPatch(msg.data)) _settings.client.getMessage(msg.object.id, true);
            break;
          case 'announcements':
            break;
        }
      }
    }

    /**
     * Get the object specified by the `object` property of the websocket packet.
     *
     * @method getObject
     * @private
     * @param  {Object} msg
     * @return {Layer.Core.Root}
     */

  }, {
    key: 'getObject',
    value: function getObject(msg) {
      return _settings.client.getObject(msg.object.id);
    }

    /**
     * Not required, but destroy is best practice
     * @method destroy
     */

  }, {
    key: 'destroy',
    value: function destroy() {}
  }]);

  return WebsocketChangeManager;
}();

module.exports = _namespace2.default.Websockets.ChangeManager = WebsocketChangeManager;