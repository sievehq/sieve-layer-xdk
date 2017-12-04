/**
 * Root class for all Message Models
 *
 */
import Util from '../../util';
import version from '../../version';
import Root from '../root';
import Message from '../models/message';
import MessagePart from '../models/message-part';
import { ErrorDictionary } from '../layer-error';

// FIXME: this doesn't really need to extend root probably
class MessageTypeModel extends Root {
  /**
   * Create a Model representing/abstracting a Message's data.
   *
   * @method  constructor
   * @private
   * @return {layer.MessageTypeModel}
   */
  constructor(options = {}) {
    if (!options.action) options.action = {};

    // Message Model UUID should always match the Message ID; there should never be more than one MessageTypeModel for a given Message
    super(options);
    //if (!this.constructor.isSupportedMessage(this.message)) throw new Error(ErrorDictionary.unsupportedMessage);

    if (!this.customData) this.customData = {};
    this.currentMessageRenderer = this.constructor.messageRenderer;
    this.currentMessageRendererExpanded = this.constructor.messageRendererExpanded;
    this.childParts = [];
    this.initializeProperties();
    if (this.message) {
      this._setupMessage();
    } else {

    }
  }

  initializeProperties() {}

  generateMessage(conversation, callback) {
    if (!conversation) throw new Error(ErrorDictionary.conversationMissing);
    if (!(conversation instanceof Root)) throw new Error(ErrorDictionary.conversationMissing);
    this._generateParts((parts) => {
      this.childParts = parts;
      this.part.mimeAttributes.role = 'root';
      this.part.mimeAttributes.xdkVersion = 'webxdk-' + version;
      this.message = conversation.createMessage({
        id: Message.prefixUUID + this.id.replace(/\/parts\/.*$/, '').replace(/^.*MessageTypeModels\//, ''),
        parts: this.childParts,
      });
      this._setupMessage(true);
      callback(this.message);
    });
  }

  _addModel(model, role, callback) {
    model._generateParts((moreParts) => {
      moreParts[0].mimeAttributes.role = role;
      moreParts[0].mimeAttributes['parent-node-id'] = this.part.nodeId;
      if (callback) callback(moreParts);
    });
  }


  _setupMessage(doNotParse) {
    if (this.part) {
      this.id = MessageTypeModel.prefixUUID + this.part.id.replace(/^.*messages\//, '');
      this.role = this.part.mimeAttributes.role;
      this.childParts = this.message.getPartsMatchingAttribute({
        'parent-node-id': this.nodeId,
      });


      // Call handlePartChanges any message edits that update a part.
      this.part.on('messageparts:change', this._handlePartChanges, this);
      this.childParts.forEach(part => part.on('messageparts:change', this._handlePartChanges, this));
    } else {
      this.childParts = [];
    }

    this.message.on('messages:part-added', this._handlePartAdded, this);
    this.message.on('messages:part-removed', this._handlePartRemoved, this);

    this.message.on('destroy', this.destroy, this);
    this.message.getClient()._addMessageTypeModel(this);
    if (!doNotParse && this.part) {
      if (!this.part.body) this.part.fetchContent();
      this._parseMessage(this.part.body ? JSON.parse(this.part.body) : {});
    }
  }

  _initBodyWithMetadata(fields) {
    const body = { };
    const newFields = ['action', 'purpose', 'customData'].concat(fields);
    newFields.forEach((fieldName) => {
      if (this._propertyHasValue(fieldName)) {
        body[Util.hyphenate(fieldName, '_')] = this[fieldName];
      }
    });
    return body;
  }

  _propertyHasValue(fieldName) {
    if (fieldName === 'action' && Util.isEmpty(this.action)) return false;
    if (fieldName === 'customData' && Util.isEmpty(this.customData)) return false;
    if (this[fieldName] === this.constructor.prototype[fieldName]) return false;
    return true;
  }

  /**
   * This method parses the message property to extract the information managed by the model.
   *
   * @method
   */
  _parseMessage(payload) {
    const responses = this.childParts.filter(part => part.mimeAttributes.role === 'response_summary')[0];
    if (responses) {
      const responseData = JSON.parse(responses.body);
      if (responseData.participant_data) {
        responseData.participantData = responseData.participant_data;
        delete responseData.participant_data;
      }
      if (!Util.doesObjectMatch(this.responses, responseData)) {
        this.responses = responseData;
      }
    }

    Object.keys(payload).forEach((propertyName) => {
      this[Util.camelCase(propertyName)] = payload[propertyName];
    });
  }

  _handlePartChanges(evt) {
    this._parseMessage(this.part.body ? JSON.parse(this.part.body) : {});
    this._triggerAsync('change');
  }

  _handlePartRemoved(removed) {
    // const removedPart = this.childParts.filter(part => part.id === removed.part.id);
    this.childParts = this.childParts.filter(part => part.id !== removed.part.id);
    this._handlePartChanges();
  }

  _handlePartAdded(evt) {
    const part = evt.part;
    const message = this.message;
    this.childParts = this.childParts.filter(childPart => message.parts.indexOf(childPart) !== -1);
    if (part.mimeAttributes['parent-node-id'] && part.mimeAttributes['parent-node-id'] === Util.uuid(this.id)) {
      this.childParts.push(part);
      part.on('messageparts:change', this._handlePartChanges, this);
      if (!this.part.body) this.part.fetchContent();
      this._parseMessage(this.part.body ? JSON.parse(this.part.body) : {});
      this._triggerAsync('change');
    } else if (part.nodeId === this.part.nodeId) {
      this.part = part;
      this._handlePartChanges();
    }
  }

/*
  getChildPartById(id) {
    return this.childParts.filter(part => part.mimeAttributes['node-id'] === id)[0];
  }

  getChildModelById(id) {
    const childPart = this.getChildPartById(id);
    if (childPart) {
      return this.getClient().getMessageTypeModel(childPart.id);
    }
  }
  generateResponseMessageText() {
    return this.getClient().user.displayName + ' has responded' + (this.title ? ' to ' + this.title : '');
  }
*/

  getModelFromPart(role) {
    const part = this.childParts.filter(aPart => aPart.mimeAttributes.role === role)[0];
    if (part) {
      return this.getClient().createMessageTypeModel(this.message, part);
    } else {
      return null;
    }
  }

  getModelsFromPart(role) {
    const parts = this.childParts.filter(part => part.mimeAttributes.role === role);
    return parts.map(part => this.getClient().createMessageTypeModel(this.message, part));
  }
/*
  hasNoContainerData() {
    const title = this.getTitle && this.getTitle();
    const description = this.getDescription && this.getDescription();
    const footer = this.getFooter && this.getFooter();
    return !title && !description && !footer;
  }

  send(conversation, notification) {
    if (!this.message) {
      const parts = [this.part].concat(this.childParts);
      this.message = conversation.createMessage({ parts });
    }
    this.message.send(notification);
    return this;
  }
*/
  getClient() {
    if (this.part) return this.part._getClient();
    if (this.message) return this.message.getClient();
    return null;
  }

  destroy() {
    this.getClient()._removeMessageTypeModel(this);
    delete this.message;
    super.destroy();
  }

  /* MANAGE METADATA */

  getTitle() {
    return this.title || '';
  }
  getDescription() {
    return '';
  }
  getFooter() {
    return '';
  }

  /* MANAGE LAST MESSAGE REPRESENTATION */
  getOneLineSummary() {
    return this.getTitle() || this.constructor.Label;
  }

  _mergeAction(newValue) {
    if (!this.action.event) this.action.event = newValue.event;
    const newData = newValue.data || {};
    let currentData;
    if (this.action.data) {
      currentData = this.action.data;
    } else {
      this.action.data = currentData = {};
    }

    Object.keys(newData).forEach((propertyName) => {
      if (!(propertyName in currentData)) currentData[propertyName] = newData[propertyName];
    });
  }

  // If triggered by a message change, trigger('change') is called above
  __updateResponses(newResponse, oldResponse) {
    if (!this.responses) this.__responses = {};
    this._processNewResponses();
  }

  _processNewResponses() { }

  __getActionEvent() {
    return this.action.event || this.constructor.defaultAction;
  }

  __getActionData() {
    return this.action.data || {};
  }

  __getNodeId() {
    return this.part ? this.part.nodeId : '';
  }

  __getParentId() {
    return this.part ? this.part.parentId : this.__parentId;
  }

  getParentPart() {
    const parentId = this.parentId;
    if (parentId) {
      return this.message.getPartsMatchingAttribute({ 'node-id': parentId })[0];
    } else {
      return null;
    }
  }

  _processDelayedTriggers() {
    if (this.isDestroyed) return;
    const changes = this._delayedTriggers.filter(evt => evt[0] === 'change');
    if (changes.length > 1) {
      let hasOne = false;
      this._delayedTriggers = this._delayedTriggers.filter(evt => {
        if (evt[0] === 'change' && !hasOne) {
          hasOne = true;
          return true;
        } else if (evt[0] === 'change') {
          return false;
        } else {
          return true;
        }
      });
    }
    super._processDelayedTriggers();
  }

  /**
   * Determine if the given Message is valid for this Message type.
   *
   *
   * @method isSupportedMessage
   * @static
   * @protected
   * @param  {layer.MessagePart} messagePart
   * @return {boolean}
   */
  static isSupportedMessage(message, messageRenderer) {
    if (messageRenderer || this.messageRenderer) return messageRenderer === this.messageRenderer;
    const pollPart = message.getPartWithMimeType(this.MIMEType);
    return Boolean(pollPart);
  }
}

/**
 * Property to reference the Parent node this model's Message Part's Parent Message Part within the Message Part Tree.
 *
 * @protected
 * @type {String}
 */
MessageTypeModel.prototype.parentId = null;

MessageTypeModel.prototype.nodeId = null;

/**
 * Node Identifier to uniquely identify this Message Part such that a Parent ID can reference it.
 *
 * @protected
 * @type {String}
 */
MessageTypeModel.prototype.nodeId = null;

/**
 * Message for this Message Model
 *
 * @type {layer.Message}
 */
MessageTypeModel.prototype.message = null;

/**
 * Message Parts that are directly used by this model.
 *
 * @type {layer.MessagePart[]}
 */
MessageTypeModel.prototype.childParts = null;

/**
 * Custom string used to describe the purpose of this Message Model to Integration Services.
 *
 * @type {String}
 */
MessageTypeModel.prototype.purpose = '';

/**
 * Custom data for your message.
 *
 * Typically this data is not used for rendering, but rather for understanding and tracking what data means.
 * For example, you might stick Product IDs into your Product Messag so that when you receive a Product Message
 * you have all the info needed to lookup the full details.
 *
 * @type {Object}
 */
MessageTypeModel.prototype.customData = null;

/**
 * Action object contains actionEvent and actionData
 *
 * @private
 * @type {Object}
 */
MessageTypeModel.prototype.action = null;

/**
 * Action to trigger when user selects this Message/Primitive
 *
 * Actions are strings that are put into events and which are intercepted and
 * interpreted either by Parent Model or by the app.
 *
 * @type {String}
 */
MessageTypeModel.prototype.actionEvent = '';

/**
 * Data to share when triggering an Action.
 *
 * Action Data is an arbitrary hash, and typically would be null.
 * Most actions can directly work with the properties of the model
 * being operated upon (open-url uses the url property).
 * A Buy button however may get stuck on something that lacks
 * a price or product number (an Image Message).
 *
 * @type {Object}
 */
MessageTypeModel.prototype.actionData = null;

/**
 * Root Part defining this Model
 *
 * @type {layer.MessagePart}
 */
MessageTypeModel.prototype.part = null;

/**
 * The role value for the MessagePart.
 * @type {String}
 */
MessageTypeModel.prototype.role = null;

/**
 * Are responses enabled for this Message?
 *
 * @type {Boolean}
 */
MessageTypeModel.prototype.locked = false;

/**
 * Stores all user responses indexed by Identity ID
 *
 * @type {Object}
 */
MessageTypeModel.prototype.responses = null;

MessageTypeModel.prototype.currentMessageRenderer = '';
MessageTypeModel.prototype.currentMessageRendererExpanded = '';

MessageTypeModel.prefixUUID = 'layer:///MessageTypeModels/';
MessageTypeModel._supportedEvents = ['change'].concat(Root._supportedEvents);
Root.initClass.apply(MessageTypeModel, [MessageTypeModel, 'MessageTypeModel']);
module.exports = MessageTypeModel;

