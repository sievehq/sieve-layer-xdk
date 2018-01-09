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
import { ErrorDictionary } from '../layer-error';
import MessageTypeModel from '../models/message-type-model';
import Core from '../namespace';

const MessageTypeModelClasses = [];
const MessageTypeModelHash = {};
const MessageTypeModelNameHash = {};

module.exports = {
  events: [
    'message-type-model:change',
    'message-type-model:customization',
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
     * Retrieve an existing Message Type Model by Model id or Message Part id.
     *
     * @method getMessageTypeModel
     * @param  {string} id              - layer:///messages/uuid/parts/uuid
     * @return {Layer.Core.MessageTypeModel}
     */
    getMessageTypeModel(id) {
      if (typeof id !== 'string') throw new Error(ErrorDictionary.idParamRequired);
      id = id.replace(/layer:\/\/\/messages\//, MessageTypeModel.prefixUUID);

      return this._models.messageTypes[id] || null;
    },

    /**
     * Register the Layer.Core.MessageTypeModel.
     *
     * @method _addMessageTypeModel
     * @private
     * @param  {Layer.Core.MessageTypeModel} messageTypeModel
     */
    _addMessageTypeModel(messageTypeModel) {
      this._models.messageTypes[messageTypeModel.id] = messageTypeModel;
    },

    /**
     * Deregister the Layer.Core.MessageTypeModel.
     *
     * @method _removeMessageTypeModel
     * @private
     * @param  {Layer.Core.MessageTypeModel} messageTypeModel
     */
    _removeMessageTypeModel(messageTypeModel) {
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
    getMessageTypeModelClassForMimeType(mimeType) {
      return MessageTypeModelHash[mimeType];
    },

    /**
     * Create a Layer.Core.MessageTypeModel instance for this Message.
     *
     * Retrieves one from cache if it already exists.  If recalling from cache,
     * will call _parseMessage and cause it to update its state.
     *
     * TODO: May want to be more cautious with excessive calls to _parseMessage.
     *
     * Note that the Part specifies whether we are generating the Root Model, or
     * if not, which sub model to generate for this Message.
     *
     * @method createMessageTypeModel
     * @param {Layer.Core.Message} message
     * @param {Layer.Core.MessagePart} [part=root]
     */
    createMessageTypeModel(message, part) {

      // Use the Root Part of the Message if we don't get a part as input
      if (!part) part = message.getRootPart();
      if (!part) return null;

      const messageTypeModel = this.getMessageTypeModel(part.id);
      if (messageTypeModel) {
        // If the Model already exists, recall the _parseMessage method
        messageTypeModel._parseMessage(part.body ? JSON.parse(part.body) : {});
        return messageTypeModel;
      } else {
        // Instantiate a sutiable model for this Part.
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
     * @method registerMessageTypeModelClass
     * @param {Function} registerMessageTypeModelClass
     * @static
     */
    registerMessageTypeModelClass(messageTypeModelClass, name) {
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
    getMessageTypeModelClass(name) {
      return MessageTypeModelNameHash[name];
    },
  },
};

Core.mixins.Client.push(module.exports);
