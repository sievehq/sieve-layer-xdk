/**
 * Root class for all Message Type Models.
 *
 * A Message Type Model represents an abstraction of a Layer.Core.Message that
 * contains an understanding of the content it represents and how to map between
 * a structure of MessageParts and that content.
 *
 * Subclasses of Message Type Model can be used to define representations of
 * Text Messages, Image Messages, Product Messages, etc...
 *
 * Each Layer.Core.Message should only have a single instance of a Message Type Model;
 * to maintain this connection, they will share UUIDs.
 *
 * @class  Layer.Core.MessageTypeModel
 * @extends Layer.Core.Root
 */
import { client as Client } from '../../settings';
import Core from '../namespace';
import Util from '../../utils';
import version from '../../version';
import Root from '../root';
import Message from '../models/message';
import { ErrorDictionary } from '../layer-error';

class MessageTypeModel extends Root {
  /**
   * Create a Model representing/abstracting a Message's data.
   *
   * @method constructor
   * @param {Object} options
   * @param {Layer.Core.Message} options.message
   * @param {Layer.Core.MessagePart} options.part
   * @private
   * @return {Layer.Core.MessageTypeModel}
   */
  constructor(options = {}) {
    if (!options.action) options.action = {};

    super(options);

    if (!this.customData) this.customData = {};
    this.currentMessageRenderer = this.constructor.messageRenderer;
    this.currentMessageRendererExpanded = this.constructor.messageRendererExpanded;
    this.childParts = [];
    this._initializeProperties();
    if (this.message) {
      this._setupMessage();
    } else {

    }
  }

  /**
   * Initializes properties of the Message Type subclass.
   *
   * Why use this? There are two paths for initialization:
   *
   * 1. _generateParts() for generating a Message from a Model
   * 2. _parseMessage() for populating the model from a Message
   *
   * Rather than initialize things in both methods, put basic initialization in `_initializeProperties`.
   *
   * Putting initialization in a subclass's constructor has sequencing problems.
   *
   * @abstract
   * @protected
   * @method _initializeProperties
   */
  _initializeProperties() {}

  /**
   * Send this Message Type Model within the specified Conversation
   *
   * ```
   * model.send({
   *    conversation: myConversation,
   *    notification: {
   *      title: "New Message from " + client.user.displayName,
   *      text: model.text || model.title || 'New Message',
   *      souncd: 'bleep.aiff'
   *    },
   *    callback(message) {
   *       console.log("Generated and sending " + message.id);
   *       message.once('messages:sent', function(evt) {
   *         console.log("Message Sent " + message.id);
   *       });
   *    }
   * });
   * ```
   *
   * The send method takes a `notification` object. In normal use, it provides the same notification to ALL
   * recipients, but you can customize notifications on a per recipient basis, as well as embed actions into the notification.
   *
   * For the Full Notification API, see [Server Docs](https://docs.layer.com/reference/server_api/push_notifications.out).
   *
   *
   * @method send
   * @param {Object} options
   * @param {Layer.Core.Container} options.conversation   The Conversation/Channel to send this message on
   * @param {Object} [options.notification]               Parameters for controling how the phones manage notifications of the new Message.
   *                                                      See IOS and Android docs for details.
   * @param {String} [options.notification.title]         Title to show on lock screen and notification bar
   * @param {String} [options.notification.text]          Text of your notification
   * @param {String} [options.notification.sound]         Name of an audio file or other sound-related hint
   * @param {Function} [options.callback]                 Function to call with generated Message;
   *                                                      Message state should be "sending" but not yet
   *                                                      received by the server
   * @param {Layer.Core.Message} [options.callback.message]
   * @return {Layer.Core.MessageTypeModel} this
   */
  send({ conversation, notification, callback }) {
    return this.generateMessage(conversation, (message) => {
      if (message.isNew()) message.send(notification);
      if (callback) callback(message);
    });
  }

  /**
   * Generate a Layer.Core.Message from this Model.
   *
   * This method returns the Message asynchronously as some models
   * may require processing of data prior to writing data into MessageParts.
   *
   * ```
   * model.generateMessage(conversation, function(message) {
   *     message.send();
   * });
   * ```
   *
   * @method generateMessage
   * @param {Layer.Core.Conversation} conversation
   * @param {Function} callback
   * @param {Layer.Core.Message} callback.message
   * @return {Layer.Core.MessageTypeModel} this
   */
  generateMessage(conversation, callback) {
    if (this.message) return callback(this.message);
    if (!conversation) throw new Error(ErrorDictionary.conversationMissing);
    if (!(conversation instanceof Root)) throw new Error(ErrorDictionary.conversationMissing);
    this._generateParts((parts) => {
      this.childParts = parts;
      this.part.mimeAttributes.role = 'root';
      //this.part.mimeAttributes.xdkVersion = 'webxdk-' + version;
      this.message = conversation.createMessage({
        id: Message.prefixUUID + this.id.replace(/\/parts\/.*$/, '').replace(/^.*MessageTypeModels\//, ''),
        parts: this.childParts,
      });

      Client._removeMessageTypeModel(this);
      this.id = MessageTypeModel.prefixUUID + this.part.id.replace(/^.*messages\//, '');
      Client._addMessageTypeModel(this);
      this._setupMessage(true);
      if (callback) callback(this.message);
    });
    return this;
  }

  /**
   * Adds a Model (submodel) to this Model; for use from `_generateParts` *only*.
   *
   * Note that adding a role name is needed for proper parsing of the Message by recipients of the Message.
   *
   * ```
   * _generateParts(callback) {
   *     this.part = new MessagePart({
   *         mimeType: this.constructor.MIMEType,
   *         body: JSON.stringify({}),
   *     });
   *     if (this.subModel) {
   *         model._addModel(subModel, 'some-role', function(parts) {
   *             callback([this.part].concat(parts));
   *         });
   *     }
   * }
   * ```
   *
   * @protected
   * @method _addModel
   * @param {Layer.Core.MessageTypeModel} model    The sub-model to add to this model
   * @param {String} role                          The role to assign the sub-model
   * @param {Function} callback                    The function to call when the sub-model has generated its parts
   * @param {Layer.Core.MessagePart[]} parts       Array of Parts that should be added to the Message
   */
  _addModel(model, role, callback) {
    model._generateParts((moreParts) => {
      moreParts[0].mimeAttributes.role = role;
      moreParts[0].mimeAttributes['parent-node-id'] = this.part.nodeId;
      if (callback) callback(moreParts);
    });
  }

  /**
   * Setup any Layer.Core.Message so that its bound to this Model.
   *
   * This method will take whatever `this.message` contains and do setup upon it.
   *
   * When completed, Layer.Core.MessageTypeModel._parseMessage is called upon it
   * unless explicitly suppressed.
   *
   * @method _setupMessage
   * @protected
   * @param {Boolean} doNotParse     Do not call Layer.Core.MessageTypeModel._parseMessage on finishing setup
   */
  _setupMessage(doNotParse) {

    // Typically, every model will have a part; however, there are some special cases where
    // an "anonymous" submodel may be created, such as is done when the ButonModel creates a ChoiceModel
    // that is not directly associated with a part, but is indirectly associated (handled via `parentId` property)
    if (this.part) {
      if (!this.id) {
        // The Model ID is derived from the Message ID so that they are linked together in a 1-to-1 relationship.
        this.id = MessageTypeModel.prefixUUID + this.part.id.replace(/^.*messages\//, '');
      }

      // Call handlePartChanges any message edits that update a part.
      this.part.on('messageparts:change', this._handlePartChanges, this);

      // Gather all of the Child Nodes so that any subclass can directly iterate over relevant parts
      this.childParts = this.message.getPartsMatchingAttribute({
        'parent-node-id': this.nodeId,
      });
      this.childModels = this.childParts.map(part => part.createModel()).filter(model => model);

      this.childParts.forEach(part => part.on('messageparts:change', this._handlePartChanges, this));
    } else {
      this.childParts = [];
      this.childModels = [];
    }

    // For any part added/removed call suitable handlers
    this.message.on('messages:part-added', this._handlePartAdded, this);
    this.message.on('messages:part-removed', this._handlePartRemoved, this);

    // If the message is destroyed, destroy the model as well
    this.message.on('destroy', this.destroy, this);

    // Register this model so that it can be retrieved instead of re-instantiated
    Client._addMessageTypeModel(this);

    if (this.part) {
      // If a Message Type Model's main part does not have a body, that means it has to be fetched;
      // call fetchContent to start loading it.
      if (!this.part.body) this.part.fetchContent();

      // Parse the message-part and initialize the model from the part's body
      if (!doNotParse) {
        this._parseMessage(this.part.body ? JSON.parse(this.part.body) : {});
      }
    }
  }

  /**
   * Generate the Layer.Core.MessagePart.body field to represent this Message Type Model.
   *
   * This is for use from Layer.Core.MessageTypeModel._generatePart to build a `body` object
   * from the properties specified here.
   *
   * This code snippet will copy the author, size and title properties into the MessagePart `body`
   * of the Part being generated.
   *
   * This method also converts all camelCase property names into snake_case property names.
   *
   * ```
   * var body = this._initBodyWithMetadata(['author', 'size', 'title']);
   * this.part = new MessagePart({
   *   mimeType: this.constructor.MIMEType,
   *   body: JSON.stringify(body),
   * });
   * ```
   *
   * @method _initBodyWithMetadata
   * @protected
   * @param {String[]} fields
   * @returns {String}
   */
  _initBodyWithMetadata(fields) {
    const body = { };
    const newFields = ['action', 'customData'].concat(fields);
    newFields.forEach((fieldName) => {
      if (this._propertyHasValue(fieldName)) {
        body[Util.hyphenate(fieldName, '_')] = this[fieldName];
      }
    });
    return body;
  }

  /**
   * Used by Layer.Core.MessageTypeModel._initBodyWithMetadata to determine if a given property has a value to write to the `body`.
   *
   * Any property whose value is different from its prototype would typically be written... but
   * Object properties must always be generated separate from the prototype, so custom tests
   * must be added here and to subclasses.
   *
   * This method prevents us from writing every property to `body` and instead only write those with relevant data.
   *
   * @method _propertyHasValue
   * @protected
   * @param {String} fieldName   The property name whose value may/may-not be worth writing.
   * @returns {Boolean}
   */
  _propertyHasValue(fieldName) {
    if (fieldName === 'action' && Util.isEmpty(this.action)) return false;
    if (fieldName === 'customData' && Util.isEmpty(this.customData)) return false;
    if (this[fieldName] === this.constructor.prototype[fieldName]) return false;
    return true;
  }

  /**
   * This method parses the message to extract the information managed by the model.
   *
   * `_parseMessage` is called for intialization, and is also recalled
   * whenever the Message itself is modified.  Any subclass providing an implementation should
   * take steps to determine whether changes from the server should overwrite properties that are already setup.
   *
   * The payload represents the Message's Root Message Part's JSON properties.
   *
   * `this.message` and `this.childParts` are already set and can help building the model.
   *
   * This method will:
   *
   * * setup `this.responses` with any data sent via Response Messages.
   * * Import each property from payload into the properties of this instance (converting from snake case to cammel case)
   *
   * Subclass this method to add additional parsing specific to your custom Layer.Core.MessageTypeModel.
   *
   * @method _parseMessage
   * @protected
   * @param {Object} payload    This is the body of the message after running it through `JSON.parse(body)`
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
        this._triggerAsync('message-type-model:change', {
          propertyName: 'responses',
          oldValue: this.responses,
          newValue: responseData,
        });
        this.responses = responseData;
      }
    }

    Object.keys(payload).forEach((propertyName) => {
      const modelName = Util.camelCase(propertyName);
      if (this[modelName] !== payload[propertyName]) {
        this._triggerAsync('message-type-model:change', {
          propertyName: modelName,
          oldValue: this[modelName],
          newValue: payload[propertyName],
        });
        this[modelName] = payload[propertyName];
      }
    });
  }

  /**
   * Whenever a relevant part has changed, reparse the message.
   *
   * This handler is called whenever:
   *
   * * `this.part` is changed
   * * Any part within `this.childParts` is changed
   * * Any part is added/removed from `this.childParts`
   *
   * Any time the underlying message changes, Layer.Core.MessageTypeModel._parseMessage is recalled
   * so that the Model can be rebuilt.
   *
   * > *Note*
   * >
   * > If you manage state in your model, you must track whether this is your first call to
   * > `_parseMessage` in which all state can be updated, or a subsequent call in which
   * > you want to *not* overwrite some local state manipulations.
   *
   * @method _handlePartChanges
   * @private
   * @param {Layer.Core.LayerEvent} evt
   */
  _handlePartChanges(evt) {
    if (this.part) {
      this._parseMessage(this.part.body ? JSON.parse(this.part.body) : {});
    }
  }

  /**
   * A MessagePart has been removed.
   *
   * If the part is a Child Part, remove it from `this.childParts` and call
   * Layer.Core.MessageTypeModel._handlePartChanges which in turn will trigger a change event.
   *
   * Assume that the root part would never be removed as that would be an invalid operation.
   *
   * @method _handlePartRemoved
   * @private
   * @param {Layer.Core.LayerEvent} removeEvt
   */
  _handlePartRemoved(removeEvt) {
    const removedPart = removeEvt.part;
    const partIndex = this.childParts.indexOf(removedPart);
    if (partIndex !== -1) {
      this.childParts.splice(partIndex, 1);
      this._handlePartChanges(removeEvt);
    }

    this.childModels = this.childModels.filter(part => part.id !== removedPart.id);
  }

  /**
   * A MessagePart has been added.
   *
   * If the new part is a Child Part, add it to `this.childParts` and call
   * Layer.Core.MessageTypeModel._handlePartChanges.
   *
   * @method _handlePartAdded
   * @private
   * @param {Layer.Core.LayerEvent} addEvt
   */
  _handlePartAdded(addEvt) {
    const part = addEvt.part;
    const message = this.message;

    // This removes from childParts any part that is not a part of the message. Doesn't seem to be a useful operation,
    // but commented it out until more thought goes into it.
    // this.childParts = this.childParts.filter(childPart => message.parts.has(childPart));

    // If this MessagePart is a Chile Node of this Model, then add it to our childParts and call _handlePartChanges
    const parentId = part.parentId;
    if (parentId && parentId === this.nodeId) {
      this.childParts.push(part);
      const childModel = part.createModel();
      if (childModel) this.childModels.push(childModel);

      part.on('messageparts:change', this._handlePartChanges, this);
      if (!this.part.body) this.part.fetchContent();
      this._parseMessage(this.part.body ? JSON.parse(this.part.body) : {});
      //this._triggerAsync('message-type-model:change');
    } else if (this.part && part.nodeId === this.part.nodeId) {
      this.part = part;
      this._handlePartChanges(addEvt);
    }
  }

  /**
   * Used from {@link #_parseMessage} subclass implementations to gather submodels and assign them as properties.
   *
   * This code snippet shows how a submodel is generated from the Message for the specified role name:
   *
   * ```
   * _parseMessage(payload) {
   *     super._parseMessage(payload);
   *     this.billingAddressModel = this.getModelsByRole('billing-address')[0];
   *     this.productItems = this.getModelsByRole('product-item');
   * }
   * ```
   *
   * Specifically, it will search the {@link #childModels} for a MessageTypeModel whose `role` value
   * matches the specified role.  Note that `role` is part of the Layer.Core.MessagePart's attributes.
   *
   * @method getModelsByRole
   * @protected
   * @param {String} role
   * @returns {Layer.Core.MessageTypeModel[]}
   */
  getModelsByRole(role) {
    return this.childModels.filter(model => model.role === role);
  }

  _getBubbleEventsTo() {
    return Client;
  }

  // Parent method docuemnts this
  destroy() {
    Client._removeMessageTypeModel(this);
    delete this.message;
    super.destroy();
  }

  /* MANAGE METADATA */

  /**
   * Returns the title metadata; used by the `<layer-standard-message-view-container />`
   *
   * @method getTitle
   * @returns {String}
   */
  getTitle() {
    return this.title || '';
  }

  /**
   * Returns the description metadata; used by the `<layer-standard-message-view-container />`
   *
   * @method getDescription
   * @returns {String}
   */
  getDescription() {
    return '';
  }

  /**
   * Returns the footer metadata; used by the `<layer-standard-message-view-container />`
   *
   * @method getFooter
   * @returns {String}
   */
  getFooter() {
    return '';
  }

  /**
   * Generate a concise textual summary of the Message.
   *
   * This is currently used to represent the Layer.Core.Conversation.lastMessage.
   *
   * @method getOneLineSummary
   * @returns {String}
   */
  getOneLineSummary() {
    const title = this.getTitle();
    if (title) {
      return title;
    } else {
      return this.constructor.Label + ' ' + (Client.user === this.message.sender ? 'sent' : 'received');
    }
  }

  /**
   * Takes an action property and merges it into the existing action property.
   *
   * If the Layer.Core.MessageTypeModel.action already has an `event` property,
   * then this will be left untouched, else a new `event` will be copied in (if present
   * within `newValue`.
   *
   * For each subproperty within the Layer.Core.MessageTypeModel.action `data` property,
   * if it exists, leave it untouched, else copy in the value from `newValue`
   *
   * @method _mergeAction
   * @protected
   * @param {Object} newValue    A new event and/or data for the action of this Model.
   */
  _mergeAction(newValue) {

    // If there is no current event, copy in the new event (if there is one)
    if (!this.action.event) this.action.event = newValue.event;

    // The new data is the data passed in
    const newData = newValue.data || {};

    // The current data is the data (if any) from the existing action on this instance
    let currentData;
    if (this.action.data) {
      currentData = this.action.data;
    } else {
      this.action.data = currentData = {};
    }

    // Any property in newData gets copied into the currentData... if the property
    // isn't already defined in currentData.
    Object.keys(newData).forEach((propertyName) => {
      if (!(propertyName in currentData)) currentData[propertyName] = newData[propertyName];
    });
  }

  /**
   * Any time `this.responses` is set, this method is called to handle any side-effects.
   *
   * Any time `this.responses` is set, call Layer.Core.MessageTypeModel._processNewResponses.
   *
   * `this.responses` is set by Layer.Core.MessageTypeModel._parseMessage under two conditions:
   *
   * * Initializing this model from the Message; `__updateResponses` is not called during initialization
   * * Updating this model after a `responsesummary` part is added or updated
   *
   * (DISABLED) Note that `this.trigger('message-type-model:change')` is called by the `_handlePartAdded` and `_handlePartChanged` methods above.
   *
   * @method __updateResponses
   * @private
   * @param {Object} newResponse
   * @param {Object} oldResponse
   */
  __updateResponses(newResponse, oldResponse) {
    if (!this.responses) this.__responses = {};
    this._processNewResponses();
    if (!this.part) {
      this._triggerAsync('message-type-model:change', {
        propertyName: 'responses',
        oldValue: oldResponse,
        newValue: newResponse,
      });
    }
  }

  /**
   * Whenever the `resopnsesummary` Message Part is added or updated, this method is called to process the responses.
   *
   * When the responses have changed, a subclass may copy parts of the responses into its own properties.
   *
   * @protected
   * @abstract
   * @method _processNewResponses
   */
  _processNewResponses() { }


  /**
   * Get the Response Message value corresponding to the given `responseName`.
   *
   * The identityId parameter can be ommitted, but if multiple users have sent Response Messages
   * with the same responseName (i.e. "selection") then an error will be thrown by this method.
   *
   * @throws
   * Multiple Responses; must use the identityId parameter
   *
   * @method getParticipantResponse
   * @param {String} responseName    Name of the response to lookup
   * @param {String} identityId         Identity ID of the user who made the response
   */
  getParticipantResponse(responseName, identityId) {
    const results = []
    if (identityId) {
      return this.responses[identityId].responseName;
    } else {
      Object.keys(this.responses.participantData || {}).forEach((identityId) => {
        const value = this.responses.participantData[identityId][responseName];
        if (value !== null && value !== undefined) results.push(value);
      });
      if (results.length > 1) throw new Error('Multiple Responses; must use the identityId parameter');
      return results[0];
    }
  }

  /**
   * Return the name of the Layer.Core.MessageTypeModel class that represents this Message; for use in simple tests.
   *
   * ```
   * if (model.getModelName() === "TextModel") {
   *    console.log("Yet another text message");
   * }
   * ```
   *
   * @method getModelName
   * @returns {String}
   */
  getModelName() {
    return this.constructor.name;
  }

  // see role property docs below
  __getRole() {
    return this.part ? this.part.role : '';
  }

  // see actionEvent property docs below
  __getActionEvent() {
    return this.action.event || this.constructor.defaultAction;
  }

  // see actionData property docs below
  __getActionData() {
    return this.action.data || {};
  }


  // See nodeId property docs below
  __getNodeId() {
    return this.part ? this.part.nodeId : '';
  }

  // See parentId property docs below
  __getParentId() {
    return this.part ? this.part.parentId : this.__parentId;
  }

  __getMessageSender() {
    return this.message ? this.message.sender : null;
  }

  __getMessageSentAt() {
    return this.message ? this.message.sentAt : null;
  }

  __getMessageRecipientStatus() {
    return this.message ? this.message.recipientStatus : null;
  }

  /**
   * Access the Message Type Submodel's parent Message Type Model in the Model tree.
   *
   * @method getParentModel
   * @returns {Layer.Core.MessageTypeModel}
   */
  getParentModel() {
    const parentId = this.parentId;
    const part = parentId ? this.message.findPart(aPart => aPart.nodeId === parentId) : null;
    return part ? part.createModel() : null;
  }

  /**
   * Multiple calls to _triggerAsync('message-type-model:change') should be replaced by a single 'message-type-model:change' event.
   *
   * @method _processDelayedTriggers
   * @private
   */
  _processDelayedTriggers() {
    if (this.isDestroyed) return;
    let hasChange = false;
    this._delayedTriggers = this._delayedTriggers.filter(evt => {
      if (evt[0] === 'message-type-model:change' && !hasChange) {
        hasChange = true;
        return true;
      } else if (evt[0] === 'message-type-model:change') {
        return false;
      } else {
        return true;
      }
    });
    super._processDelayedTriggers();
  }

  toString() {
    return `[${this.constructor.name} ${this.id}]`;
  }
}

/**
 * Unique identifier, derived from the associated Part ID.
 *
 * @property {string}
 */
MessageTypeModel.prototype.id = '';

/**
 * Property to reference the Parent node this model's Message Part's Parent Message Part within the Message Part Tree.
 *
 * @protected
 * @property {String}
 */
MessageTypeModel.prototype.parentId = null;

/**
 * Node Identifier to uniquely identify this Message Part such that a Parent ID can reference it.
 *
 * @readonly
 * @property {String}
 */
MessageTypeModel.prototype.nodeId = null;

/**
 * Message for this Message Model
 *
 * @property {Layer.Core.Message}
 */
MessageTypeModel.prototype.message = null;

/**
 * Message Parts that are directly used by this model.
 *
 * It is assumed to be used by this model if they are its children in the MessagePart tree.
 *
 * @property {Layer.Core.MessagePart[]}
 */
MessageTypeModel.prototype.childParts = null;

/**
 * Message Type Models that are directly used by this model.
 *
 * It is assumed to be used by this model if they are its children in the MessagePart tree.
 *
 * > *Note*
 * >
 * > childModels is *not* initialized if creating a model without a Message (even if you later call `generateMessage()`)
 *
 * @property {Layer.Core.MessageTypeModel[]}
 */
MessageTypeModel.prototype.childModels = null;

/**
 * Custom data for your message.
 *
 * A Message Type View/Model pair would not be implemented to render custom data; it would instead be
 * designed to support exactly the properties they need.
 *
 * However, an app that is customizing someone else's Message Type View may want to add properties
 * to the model without modifying the Model Definition itself; Custom Data supports that task.
 *
 * Custom Data also is useful for sticking properties about your Model that are for use by your server
 * rather than by the UI.
 * For example, you might stick Product IDs into your Product Message so that when your server receives
 * a Product Message it has all the info needed to lookup the full details.
 *
 * @property {Object}
 */
MessageTypeModel.prototype.customData = null;

/**
 * Action object represents the Layer.MessageTypeModel.actionEvent and Layer.MessageTypeModel.actionData properties.
 *
 * Typically you would pass this into the Model constructor as:
 *
 * ```
 * new Model({
 *    action: {
 *       event: "event-name",
 *       data: {custom: "data"}
 *    }
 * });
 * ```
 *
 * @property {Object}
 */
MessageTypeModel.prototype.action = null;

/**
 * Action to trigger when user selects a UI representing this Message Type Model
 *
 * Actions are strings that are put into events and which are intercepted and
 * interpreted either by `<layer-message-viewer />` or by the app.
 *
 * @property {String}
 */
MessageTypeModel.prototype.actionEvent = '';

/**
 * Data to use when triggering the Layer.MessageTypeModel.actionEvent.
 *
 * Action Data is an arbitrary hash, and contains data specific to the action.
 * This can be used to provide an alternate url to open from the one shown in a Link Message.
 * This can be used to provide a product-id to buy if showing a Product with an Image Message instead of a Product Message.
 * This can be used to provide the properties used by the action where the values in the model itself aren't suitable/available.
 *
 * @property {Object}
 */
MessageTypeModel.prototype.actionData = null;

/**
 * Root Part defining this Model
 *
 * @property {Layer.Core.MessagePart}
 */
MessageTypeModel.prototype.part = null;

/**
 * The role of this model.
 *
 * The role is defined by the MessagePart for this Model, and
 * determines what this Model means to its Parent Model in the Model tree.
 *
 * @property {String}
 */
MessageTypeModel.prototype.role = null;

/**
 * Are responses enabled for this Message?
 *
 * @ignore
 * @property {Boolean}
 */
//MessageTypeModel.prototype.locked = false;

/**
 * Stores all user responses indexed by Identity ID within the `participant_data` subproperty
 *
 * ```
 * {
 *     participant_data: {
 *         'layer:///identities/user_a': {
 *            selection: 'item1'
 *          },
 *          'layer:///identities/user_b': {
 *            vote: 'approved'
 *          }
 *      }
 * }
 * ```
 *
 * TODO: should normalize to `participantData`
 * TODO: should represent this with a custom class and not Object.
 *
 * @property {Object}
 */
MessageTypeModel.prototype.responses = null;

/**
 * The requested UI Component name for rendering this model.
 *
 * This property is set from the static `messageRenderer` property provided by most Models.
 *
 * Some models may need this value to be dynamically looked up instead of static:
 *
 * ```
 * __getCurrentMessageRenderer() {
 *   if (this.xxx) {
 *     return 'view1';
 *   else {
 *     return 'view2';
 *   }
 * }
 * ```
 *
 * @property {String}
 */
MessageTypeModel.prototype.currentMessageRenderer = '';
MessageTypeModel.prototype.currentMessageRendererExpanded = '';

/**
 * Sender of the Message Model
 *
 * @property {Layer.Core.Identity} messageSender
 */
MessageTypeModel.prototype.messageSender = null;

/**
 * Time the Message was sent.
 *
 * Note that a locally created Layer.Core.Message.sentAt will have a `sentAt` value even
 * though its not yet sent; this is so that any rendering code doesn't need
 * to account for `null` values.  Sending the Message may cause a slight change
 * in the `sentAt` value.
 *
 * @property {Date} messageSentAt
 */
MessageTypeModel.prototype.messageSentAt = null;

/**
 * Read/delivery State of all participants.
 *
 * This is an object containing keys for each participant,
 * and a value of:
 *
 * * Layer.Constants.RECEIPT_STATE.SENT
 * * Layer.Constants.RECEIPT_STATE.DELIVERED
 * * Layer.Constants.RECEIPT_STATE.READ
 * * Layer.Constants.RECEIPT_STATE.PENDING
 *
 * @property {Object}
 */
MessageTypeModel.prototype.messageRecipientStatus = null;

MessageTypeModel.prefixUUID = 'layer:///MessageTypeModels/';
MessageTypeModel._supportedEvents = [
  'message-type-model:change',
  'message-type-model:customization',
].concat(Root._supportedEvents);
Root.initClass.apply(MessageTypeModel, [MessageTypeModel, 'MessageTypeModel', Core]);
module.exports = MessageTypeModel;

