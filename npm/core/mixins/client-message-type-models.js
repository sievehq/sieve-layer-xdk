/**
 * Adds MessageTypeModel handling to the Layer.Core.Client.
 *
 * TODO:
 * 1. If the Message is destroyed, find and destroy any linked Models
 * 2. If the Message is in use, insure that the Message isn't garbage collected.
 *    Potential definition of in-use: its in the DOM
 *
 * @class Layer.Core.mixins.ClientMessageTypeModels
 */
'use strict';

var _layerError = require('../layer-error');

var _messageTypeModel = require('../models/message-type-model');

var _messageTypeModel2 = _interopRequireDefault(_messageTypeModel);

var _namespace = require('../namespace');

var _namespace2 = _interopRequireDefault(_namespace);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MessageTypeModelClasses = []; 

var MessageTypeModelHash = {};
var MessageTypeModelNameHash = {};

module.exports = {
  events: ['message-type-model:change', 'message-type-model:customization',

  /**
   * Any event used to customize the notification sent when sending a Message
   * using {@link Layer.Core.MessageTypeModel#send}.
   *
   * ```
   * client.on('message-type-model:notification', function(evt) {
   *    if (evt.modelName === 'TextModel') {
   *      if (evt.notification.title.length > 50) evt.notification.title = 'Frodo is a Dodo';
   *      if (evt.notification.text.length < 10) evt.notification.text += ' and furthermore, Frodo is a Dodo';
   *    }
   * });
   * ```
   *
   * > *Note*
   * >
   * > Calling {@link Layer.Core.Message#send} bypasses this event.
   *
   * @event
   * @param {Layer.Core.LayerEvent} evt
   */
  'message-type-model:notification'],
  lifecycle: {
    constructor: function constructor(options) {
      this._models.messageTypes = {};
    },
    cleanup: function cleanup() {
      var _this = this;

      Object.keys(this._models.messageTypes || {}).forEach(function (id) {
        var messageTypeModel = _this._models.messageTypes[id];
        if (messageTypeModel && !messageTypeModel.isDestroyed) {
          messageTypeModel.destroy();
        }
      });
      this._models.messageTypes = null;
    },
    reset: function reset() {
      this._models.messageTypes = {};
    }
  },
  methods: {
    /**
     * Retrieve an existing Message Type Model by Model id or Message Part id.
     *
     * @method getMessageTypeModel
     * @param  {string} id              - layer:///messages/uuid/parts/uuid
     * @return {Layer.Core.MessageTypeModel}
     */
    getMessageTypeModel: function getMessageTypeModel(id) {
      if (typeof id !== 'string') throw new Error(_layerError.ErrorDictionary.idParamRequired);
      id = id.replace(/layer:\/\/\/messages\//, _messageTypeModel2.default.prefixUUID);

      return this._models.messageTypes[id] || null;
    },


    /**
     * Register the Layer.Core.MessageTypeModel.
     *
     * @method _addMessageTypeModel
     * @private
     * @param  {Layer.Core.MessageTypeModel} messageTypeModel
     */
    _addMessageTypeModel: function _addMessageTypeModel(messageTypeModel) {
      this._models.messageTypes[messageTypeModel.id] = messageTypeModel;
    },


    /**
     * Deregister the Layer.Core.MessageTypeModel.
     *
     * @method _removeMessageTypeModel
     * @private
     * @param  {Layer.Core.MessageTypeModel} messageTypeModel
     */
    _removeMessageTypeModel: function _removeMessageTypeModel(messageTypeModel) {
      if (messageTypeModel) {
        delete this._models.messageTypes[messageTypeModel.id];
        this.off(null, null, messageTypeModel);
      }
    },


    /**
     * Get the Layer.Core.MessageTypeModel Class that supports this mimeType.
     *
     * Technically this could be a static method, but its simplest to use when invoked on the Client itself.
     *
     * @method getMessageTypeModelClassForMimeType
     * @param {String} mimeType
     * @returns {Function}
     */
    getMessageTypeModelClassForMimeType: function getMessageTypeModelClassForMimeType(mimeType) {
      return MessageTypeModelHash[mimeType];
    },


    /**
     * Create a Layer.Core.MessageTypeModel instance for this Message.
     *
     * Retrieves one from cache if it already exists.
     *
     * Note that the Part specifies whether we are generating the Root Model, or
     * if not, which sub model to generate for this Message.
     *
     * @method createMessageTypeModel
     * @param {Layer.Core.Message} message
     * @param {Layer.Core.MessagePart} [part=root]
     */
    createMessageTypeModel: function createMessageTypeModel(message, part) {

      // Use the Root Part of the Message if we don't get a part as input
      if (!part) part = message.getRootPart();
      if (!part) return null;

      var messageTypeModel = this.getMessageTypeModel(part.id);
      if (messageTypeModel) {
        return messageTypeModel;
      } else {
        // Instantiate a sutiable model for this Part.
        var MessageTypeModelClass = this.getMessageTypeModelClassForMimeType(part.mimeType);
        if (MessageTypeModelClass) return new MessageTypeModelClass({ message: message, part: part });
      }
      return null;
    }
  },

  staticMethods: {
    /**
     * Call this static method to register a MessageTypeModelClass.
     *
     * @method registerMessageTypeModelClass
     * @param {Function} registerMessageTypeModelClass
     * @static
     */
    registerMessageTypeModelClass: function registerMessageTypeModelClass(messageTypeModelClass, name) {
      MessageTypeModelClasses.push(messageTypeModelClass);
      MessageTypeModelHash[messageTypeModelClass.MIMEType] = messageTypeModelClass;
      if (name) MessageTypeModelNameHash[name] = messageTypeModelClass;
    },


    /**
     * Get the Layer.Core.MessageTypeModel Class that supports this mimeType.
     *
     * @method getMessageTypeModelClassForMimeType
     * @param {String} mimeType
     * @returns {Function}
     * @static
     */
    getMessageTypeModelClass: function getMessageTypeModelClass(name) {
      return MessageTypeModelNameHash[name];
    }
  }
};

_namespace2.default.mixins.Client.push(module.exports);