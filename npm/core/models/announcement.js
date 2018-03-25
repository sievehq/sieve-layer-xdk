/**
 * The Announcement class represents a type of Message sent by a server.
 *
 * Announcements can not be sent using the WebSDK, only received.
 *
 * You should never need to instantiate an Announcement; they should only be
 * delivered via `messages:add` events when an Announcement is provided via
 * websocket to the client, and `change` events on an Announcements Query.
 *
 * @class  Layer.Core.Announcement
 * @extends Layer.Core.Message.ConversationMessage
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _settings = require('../../settings');

var _namespace = require('../namespace');

var _namespace2 = _interopRequireDefault(_namespace);

var _conversationMessage = require('./conversation-message');

var _conversationMessage2 = _interopRequireDefault(_conversationMessage);

var _syncable = require('./syncable');

var _syncable2 = _interopRequireDefault(_syncable);

var _root = require('../root');

var _root2 = _interopRequireDefault(_root);

var _layerError = require('../layer-error');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }



var Announcement = function (_ConversationMessage) {
  _inherits(Announcement, _ConversationMessage);

  function Announcement() {
    _classCallCheck(this, Announcement);

    return _possibleConstructorReturn(this, (Announcement.__proto__ || Object.getPrototypeOf(Announcement)).apply(this, arguments));
  }

  _createClass(Announcement, [{
    key: 'send',


    /**
     * @method send
     * @hide
     */
    value: function send() {}

    /**
     * @method _send
     * @hide
     */

  }, {
    key: '_send',
    value: function _send() {}

    /**
     * @method getConversation
     * @hide
     */

  }, {
    key: 'getConversation',
    value: function getConversation() {}
  }, {
    key: '_loaded',
    value: function _loaded(data) {
      _settings.client._addMessage(this);
    }

    /**
     * Delete the Announcement from the server.
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
          _syncable2.default.load(id);
        }
      });

      this._deleted();
      this.destroy();
    }

    /**
     * Creates an Announcement from the server's representation of an Announcement.
     *
     * Similar to _populateFromServer, however, this method takes a
     * message description and returns a new message instance using _populateFromServer
     * to setup the values.
     *
     * @method _createFromServer
     * @protected
     * @static
     * @param  {Object} message - Server's representation of the announcement
     * @return {Layer.Core.Announcement}
     */

  }], [{
    key: '_createFromServer',
    value: function _createFromServer(message) {
      var fromWebsocket = message.fromWebsocket;
      return new Announcement({
        fromServer: message,
        _notify: fromWebsocket && message.is_unread
      });
    }
  }]);

  return Announcement;
}(_conversationMessage2.default);

/**
 * @property {String} conversationId
 * @hide
 */

/**
 * @property {Object} deliveryStatus
 * @hide
 */

/**
 * @property {Object} readStatus
 * @hide
 */

/**
 * @property {Object} recipientStatus
 * @hide
 */

/**
 * @method addPart
 * @hide
 */

/**
 * @method send
 * @hide
 */

/**
 * @method isSaved
 * @hide
 */

/**
 * @method isSaving
 * @hide
 */

Announcement.prefixUUID = 'layer:///announcements/';

Announcement._supportedEvents = [].concat(_conversationMessage2.default._supportedEvents);

Announcement.inObjectIgnore = _conversationMessage2.default.inObjectIgnore;
_root2.default.initClass.apply(Announcement, [Announcement, 'Announcement', _namespace2.default]);
_syncable2.default.subclasses.push(Announcement);
module.exports = Announcement;