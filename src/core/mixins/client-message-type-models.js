/**
 * Adds MessageTypeModel handling to the layer.Core.Client.
 *
 * TODO:
 * 1. If the Message is destroyed, find and destroy any linked Models
 * 2. If the Message is in use, insure that the Message isn't garbage collected.
 *    Potential definition of in-use: its in the DOM
 *
 * @class layer.mixins.ClientMessageTypeModels
 */
const ErrorDictionary = require('../layer-error').dictionary;
const uuid = require('../../util').uuid;
const MessageTypeModel = require('../models/message-type-model');

const MessageTypeModelClasses = [];
const MessageTypeModelHash = {};
const MessageTypeModelNameHash = {};

module.exports = {
  events: [

  ],
  lifecycle: {
    constructor(options) {
      this._models.messageTypes = {};
    },
    cleanup() {
      Object.keys(this._models.messageTypes).forEach((id) => {
        const query = this._models.messageTypes[id];
        if (query && !query.isDestroyed) {
          query.destroy();
        }
      });
      this._models.messageTypes = null;
    },
    reset() {
      this._models.messageTypes = {};
    },

  },
  methods: {
    /**
     * Retrieve the card by card id.
     *
     * Useful for finding a card when you only have the ID
     *
     * @method getMessageTypeModel
     * @param  {string} id              - layer:///queries/uuid
     * @return {layer.MessageTypeModel}
     */
    getMessageTypeModel(id) {
      if (typeof id !== 'string') throw new Error(ErrorDictionary.idParamRequired);
      id = id.replace(/layer:\/\/\/messages\//, MessageTypeModel.prefixUUID);

      return this._models.messageTypes[id] || null;
    },

    /**
     * Register the layer.MessageTypeModel.
     *
     * @method _addMessageTypeModel
     * @private
     * @param  {layer.MessageTypeModel} messageTypemodel
     */
    _addMessageTypeModel(messageTypemodel) {
      this._models.messageTypes[messageTypemodel.id] = messageTypemodel;
    },

    /**
     * Deregister the layer.MessageTypeModel.
     *
     * @method _removeMessageTypeModel
     * @private
     * @param  {layer.MessageTypeModel} messageTypemodel
     */
    _removeMessageTypeModel(messageTypemodel) {
      if (messageTypemodel) {
        delete this._models.messageTypes[messageTypemodel.id];
        this.off(null, null, messageTypemodel);
      }
    },

    /**
     * Get the MessageTypeModel Class that supports this mimeType.
     *
     * Technically this could be a static method, but its simplest to use when invoked on the Client itself.
     *
     * @param {String} mimeType
     */
    getMessageTypeModelClassForMimeType(mimeType) {
      return MessageTypeModelHash[mimeType];
    },

    /**
     * Create a Card Model for this Message
     *
     * @param {layer.Message} message
     * @param {layer.MessagePart} part
     */
    createMessageTypeModel(message, part) {
      const cardId = part.id.replace(/layer:\/\/\/messages\//, MessageTypeModel.prefixUUID);
      const messageTypeModel = this.getMessageTypeModel(cardId);
      if (messageTypeModel) {
        messageTypeModel._parseMessage(part.body ? JSON.parse(part.body) : {});
        return messageTypeModel;
      } else {
        const MessageTypeModelClass = this.getMessageTypeModelClassForMimeType(part.mimeType);
        if (MessageTypeModelClass) return new MessageTypeModelClass({ message, part });
      }
      return null;
    },
  },

  staticMethods: {
    /**
     * Call this static method to register a MessageTypeModelClass.
     *
     * @param {Function} registerMessageTypeModelClass
     */
    registerMessageTypeModelClass(messageTypeModelClass, name) {
      MessageTypeModelClasses.push(messageTypeModelClass);
      MessageTypeModelHash[messageTypeModelClass.MIMEType] = messageTypeModelClass;
      if (name) MessageTypeModelNameHash[name] = messageTypeModelClass;
    },
    getMessageTypeModelClass(name) {
      return MessageTypeModelNameHash[name];
    },
  },
};

