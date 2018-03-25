/**
 * The Message Viewer (`<layer-message-viewer />`) is a Message Handler that handles all standard Messages.
 *
 * A standard message is assumed to have a single Message Part whose `role` is `root` and which represents
 * a Layer.Core.MessageTypeModel.
 *
 * A Message Viewer can be instantiated with *either* a:
 *
 * * `message`: A model is generated/retrieved for this message using the Root MessagePart for this Message
 * * `model`: The model unambiguously specifies what `message` and what `rootPart` are to be used for this Message Viewer
 *
 * Note that if using a `model` that does not have a message, best practice is to create a message but
 * not send it; you should call `message.presend()` if rendering this within a Message List.
 *
 * ```
 * var model = new TextModel({ text: "Howdy" });
 * model.generateMessage(conversation, (message) => {
 *   messageViewer.model = model;  // model.message will be accessed by the Viewer
 * });
 * ```
 *
 * @class Layer.UI.handlers.message.MessageViewer
 * @extends Layer.UI.Component
 * @mixin Layer.UI.mixins.Clickable
 */
'use strict';

var _component = require('../../components/component');

var _messageHandler = require('../../mixins/message-handler');

var _messageHandler2 = _interopRequireDefault(_messageHandler);

var _clickable = require('../../mixins/clickable');

var _clickable2 = _interopRequireDefault(_clickable);

var _index = require('../../message-actions/index');

var _index2 = _interopRequireDefault(_index);

var _messageHandlers = require('./message-handlers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _component.registerComponent)('layer-message-viewer', {
  mixins: [_messageHandler2.default, _clickable2.default],
  style: 'layer-message-viewer {\ndisplay: inline-flex;\nflex-direction: row;\nalign-items: stretch;\nposition: relative;\n}',

  // Note that there is also a message property managed by the MessageHandler mixin
  properties: {

    /**
     * The model to be rendered by some UI within this Viewer.
     *
     * @property {Layer.Core.MessageTypeModel} model
     */
    model: {
      set: function set(model) {
        if (model.message !== this.properties.message) {
          this.message = model.message;
        } else if (!model.message) {
          this._setupMessage();
        }
      }
    },

    /**
     * The message being rendered either in its entirety, or some subtree of content within it.
     *
     * The message determines what is being rendered; but the specific
     * model identifies a Message Part within it that has a position within the Message Part
     * tree and determines what part of the message this UI Component will render.
     *
     * @property {Layer.Core.Message} message
     */
    message: {
      set: function set(message) {
        var model = message && !this.properties.model ? message.createModel() : null;
        if (model) {
          this.classList.remove('layer-model-not-supported');
          this.properties.model = model;
          if (this.properties._internalState.onAfterCreateCalled) {
            this._setupMessage();
          }
        } else if (!this.model) {
          this.classList.add('layer-model-not-supported');
          this.innerHTML = this.modelNotSupported + (this.message.getRootPart() || this.message.findPart()).mimeType;
        }
      }
    },

    /**
     * This property primarily exists so that one can set/override the messageViewContainerTagName on
     * individual Card UIs.
     *
     * Currently can only be used to replace 'layer-standard-view-container' with a custom value.
     *
     * @property {String} messageViewContainerTagName
     */
    messageViewContainerTagName: {
      noGetterFromSetter: true,

      // If the property is set, indicate that its been explicitly set
      set: function set(inValue) {
        this.properties.messageViewContainerTagNameIsSet = true;
      },


      // Get the UI Node's preferred Display Container... unless this component's messageViewContainerTagName has been set
      get: function get() {
        var result = this.nodes.ui.messageViewContainerTagName;
        if (result === 'layer-standard-view-container' && this.properties.messageViewContainerTagNameIsSet) {
          return this.properties.messageViewContainerTagName;
        } else {
          return result;
        }
      }
    },

    /**
     * Possible values are:
     *
     * * standard: full border with rounded corners
     * * list: top border only, no radius
     * * rounded-top: full border, rounded top, square bottom
     * * rounded-bottom: full border, rounded bottom, square top
     * * none: no border
     *
     * @property {String} cardBorderStyle
     */
    cardBorderStyle: {
      set: function set(newValue, oldValue) {
        if (oldValue) {
          this.classList.remove('layer-card-border-' + oldValue);
        }
        if (newValue) {
          this.classList.add('layer-card-border-' + newValue);
        }
      }
    },

    /**
     * Describes how the width of this Message Type will be managed.
     *
     * One of:
     *
     * * Layer.UI.Constants.WIDTH.FULL: Uses all available width
     * * Layer.UI.Constants.WIDTH.ANY: No minimum, maximum is all available width; generallay does not look like a card
     * * Layer.UI.Constants.WIDTH.FLEX: card that has a minimum and a maximum but tries for an optimal size for its contents
     *
     * @property {String} widthType
     */
    widthType: {
      set: function set(newValue, oldValue) {
        if (oldValue) this.classList.remove('layer-card-width-' + oldValue);
        if (newValue) this.classList.add('layer-card-width-' + newValue);
      }
    },

    modelNotSupported: {
      value: 'No model registered to handle MIME Type: '
    },
    isRootModel: {
      set: function set(value) {
        if (value) this.classList.add('layer-root-viewer');
      }
    }
  },
  methods: {
    // Standard lifecycle event insures that _handleSelection will be called when clicked
    onCreate: function onCreate() {
      this.addClickHandler('card-click', this, this._handleSelection.bind(this));
    },


    // Standard lifecycle event insures that setupMessage is called
    onAfterCreate: function onAfterCreate() {
      if (this.message) this._setupMessage();
    },


    /**
     * Given a message and a model, generate the UI Component and a Display Container.
     *
     * @method _setupMessage
     * @private
     */
    _setupMessage: function _setupMessage() {
      if (!this.model) return;
      if (this.firstChild) this.innerHTML = '';

      // The rootPart is typically the Root Part of the message, but the Card View may be asked to render subcards
      // Clearly differentiate a top level Root Part from subparts using the layer-root-viewer css class
      if (!this.message || this.model.part === this.message.getRootPart()) this.isRootModel = true;

      var cardUIType = this.model.currentMessageRenderer;
      this.classList.add(cardUIType);
      if (this.parentComponent && this.parentComponent.isMessageListItem) {
        this.parentComponent.classList.add('layer-message-item-' + cardUIType);
      }
      var cardUI = this.createElement(cardUIType, {
        model: this.model,
        messageViewer: this,
        noCreate: true
      });
      this.nodes.ui = cardUI;

      var cardContainerClass = this.messageViewContainerTagName;
      if (this.messageViewContainerTagName) this.classList.add(this.messageViewContainerTagName);

      if (cardContainerClass) {
        var cardContainer = this.createElement(cardContainerClass, {
          model: this.model,
          ui: cardUI,
          parentNode: this,
          name: 'cardContainer',
          noCreate: true // tells createElement not to call _onAfterCreate just yet
        });
        cardContainer.ui = cardUI;
        cardUI.parentComponent = cardContainer;
        this.cardBorderStyle = this.properties.cardBorderStyle || cardContainer.cardBorderStyle || 'standard';
      } else {
        this.appendChild(cardUI);
        this.cardBorderStyle = this.properties.cardBorderStyle || cardUI.cardBorderStyle || 'standard';
      }

      CustomElements.upgradeAll(this);
      if (this.nodes.cardContainer) this.nodes.cardContainer._onAfterCreate();
      if (cardUI._onAfterCreate) cardUI._onAfterCreate();
      if (this.nodes.cardContainer) cardUI._setupContainerClasses();
      if (cardUI.hideMessageItemRightAndLeftContent && this.parentComponent) {
        this.parentComponent.classList.add('layer-message-item-hide-replaceable-content');
      }
    },


    /**
     * When the user taps/clicks/selects this Message, call `runAction()`
     *
     * @method _handleSelection
     * @private
     * @param {Event} evt
     */
    _handleSelection: function _handleSelection(evt) {
      evt.stopPropagation();
      this._runAction({});
    },


    /**
     * Initiates the execution of action handlers upon this Message.
     *
     * When called from an actionButton, an options argument is provided with that button's
     * actionEvent and actionData properties.
     *
     * @method _runAction
     * @private
     * @param {Object} action
     * @param {String} action.event   Event name
     * @param {Object} action.data    Data to use when processing the event, in addition to the model's data
     */
    _runAction: function _runAction(action) {
      if (this.nodes.ui.runAction && this.nodes.ui.runAction(action)) return;

      var event = action && action.event ? action.event : this.model.actionEvent;
      if (!event) return;

      var actionData = action && action.data ? action.data : this.model.actionData; // TODO: perhaps merge action.data with actionData?
      var rootModel = this.message ? this.message.getRootPart().createModel() : null;

      var args = {
        model: this.model,
        rootModel: rootModel,
        data: actionData,
        messageViewer: this
      };

      // Trigger an event based on the event name; trigger returns false if evt.preventDefault() was called
      var actionHandlerAllowed = this.nodes.ui.trigger(event, args);

      // If evt.preventDefault() was not called then invoke any registered action handler
      if (actionHandlerAllowed && _index2.default[event]) {
        _index2.default[event].call(null, args);
      }
    }
  }
}); 


(0, _messageHandlers.register)({
  handlesMessage: function handlesMessage(message, container) {
    return Boolean(message.getRootPart());
  },

  tagName: 'layer-message-viewer',
  order: undefined
});