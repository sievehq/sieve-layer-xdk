/**
 * @inheritdoc Layer.Core.Message
 *
 * @class Layer.Core.Message.ChannelMessage
 * @extends Layer.Core.Message
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _settings = require('../../settings');

var _namespace = require('../namespace');

var _namespace2 = _interopRequireDefault(_namespace);

var _root = require('../root');

var _root2 = _interopRequireDefault(_root);

var _message = require('./message');

var _message2 = _interopRequireDefault(_message);

var _constants = require('../../constants');

var _constants2 = _interopRequireDefault(_constants);

var _utils = require('../../utils');

var _layerError = require('../layer-error');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } 


var ChannelMessage = function (_Message) {
  _inherits(ChannelMessage, _Message);

  function ChannelMessage(options) {
    _classCallCheck(this, ChannelMessage);

    if (options.channel) options.conversationId = options.channel.id;

    var _this = _possibleConstructorReturn(this, (ChannelMessage.__proto__ || Object.getPrototypeOf(ChannelMessage)).call(this, options));

    _this.isInitializing = false;
    if (options && options.fromServer) {
      _settings.client._addMessage(_this);
    } else {
      _this.parts.forEach(function (part) {
        part._message = _this;
      });
    }
    return _this;
  }

  /**
   * Get the Layer.Core.Channel associated with this Layer.Core.Message.ChannelMessage.
   *
   * @method getConversation
   * @param {Boolean} load       Pass in true if the Layer.Core.Channel should be loaded if not found locally
   * @return {Layer.Core.Channel}
   */


  _createClass(ChannelMessage, [{
    key: 'getConversation',
    value: function getConversation(load) {
      if (this.conversationId) {
        return _settings.client.getChannel(this.conversationId, load);
      }
      return null;
    }

    /**
     * Send a Read or Delivery Receipt to the server; not supported yet.
     *
     * @method sendReceipt
     * @param {string} [type=Layer.Constants.RECEIPT_STATE.READ] - One of Layer.Constants.RECEIPT_STATE.READ or Layer.Constants.RECEIPT_STATE.DELIVERY
     * @return {Layer.Core.Message.ChannelMessage} this
     */

  }, {
    key: 'sendReceipt',
    value: function sendReceipt() {
      var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _constants2.default.RECEIPT_STATE.READ;

      _utils.logger.warn('Receipts not supported for Channel Messages yet');
      return this;
    }

    /**
     * Delete the Message from the server.
     *
     * ```
     * message.delete();
     * ```
     *
     * @method delete
     */

  }, {
    key: 'delete',
    value: function _delete() {
      if (this.isDestroyed) throw new Error(_layerError.ErrorDictionary.isDestroyed);

      var id = this.id;
      this._xhr({
        url: '',
        method: 'DELETE'
      }, function (result) {
        if (!result.success && (!result.data || result.data.id !== 'not_found' && result.data.id !== 'authentication_required')) {
          _message2.default.load(id);
        }
      });

      this._deleted();
      this.destroy();
    }

    /**
     * On loading this one item from the server, after _populateFromServer has been called, due final setup.
     *
     * @method _loaded
     * @private
     * @param {Object} data  Data from server
     */

  }, {
    key: '_loaded',
    value: function _loaded(data) {
      this.conversationId = data.channel.id;
      _settings.client._addMessage(this);
    }

    /**
     * Creates a message from the server's representation of a message.
     *
     * Similar to _populateFromServer, however, this method takes a
     * message description and returns a new message instance using _populateFromServer
     * to setup the values.
     *
     * @method _createFromServer
     * @protected
     * @static
     * @param  {Object} message - Server's representation of the message
     * @return {Layer.Core.Message.ChannelMessage}
     */

  }], [{
    key: '_createFromServer',
    value: function _createFromServer(message) {
      var fromWebsocket = message.fromWebsocket;
      var conversationId = void 0;
      if (message.channel) {
        conversationId = message.channel.id;
      } else {
        conversationId = message.conversationId;
      }

      return new ChannelMessage({
        conversationId: conversationId,
        fromServer: message,
        _fromDB: message._fromDB,
        _notify: fromWebsocket && message.is_unread && message.sender.user_id !== _settings.client.user.userId
      });
    }
  }]);

  return ChannelMessage;
}(_message2.default);

/*
 * True if this Message has been read by this user.
 *
 * You can change isRead programatically
 *
 *      m.isRead = true;
 *
 * This will automatically notify the server that the message was read by your user.
 * @property {Boolean}
 */


ChannelMessage.prototype.isRead = false;

ChannelMessage.inObjectIgnore = _message2.default.inObjectIgnore;
ChannelMessage._supportedEvents = [].concat(_message2.default._supportedEvents);
_root2.default.initClass.apply(ChannelMessage, [ChannelMessage, 'ChannelMessage', _namespace2.default.Message]);
module.exports = ChannelMessage;