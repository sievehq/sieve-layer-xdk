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
 * @class Layer.UI.handlers.message.MessageViewer
 * @extends Layer.UI.components.Component
 */
import { registerMessageComponent } from '../../components/component';
import MessageHandler from '../../mixins/message-handler';
import Clickable from '../../mixins/clickable';

import { messageActionHandlers, components } from '../../base';


registerMessageComponent('layer-message-viewer', {
  mixins: [MessageHandler, Clickable],
  style: `layer-message-viewer {
    display: inline-flex;
    flex-direction: row;
    align-items: stretch;
    position: relative;
  }
  `,

   // Note that there is also a message property managed by the MessageHandler mixin
  properties: {

    /**
     * The model to be rendered by some UI within this Viewer.
     *
     * @type {Layer.Core.MessageTypeModel} model
     */
    model: {
      set(model) {
        if (model.message !== this.properties.message) {
          this.message = model.message;
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
     * @type {Layer.Core.Message} message
     */
    message: {
      set(message) {
        this.innerHTML = '';
        if (message) {
          if (!this.properties.model) this.properties.model = message.createModel();
          if (!this.properties.model) return;
          if (this.properties._internalState.onAfterCreateCalled) {
            this.setupMessage();
          }
        }
      },
    },

    /**
     * This property primarily exists so that one can set/override the messageViewContainerTagName on
     * individual Card UIs.
     *
     * Currently can only be used to replace 'layer-standard-view-container' with a custom value.
     *
     * @type {String} messageViewContainerTagName
     */
    messageViewContainerTagName: {
      noGetterFromSetter: true,

      // If the property is set, indicate that its been explicitly set
      set(inValue) {
        this.properties.messageViewContainerTagNameIsSet = true;
      },

      // Get the UI Node's preferred Display Container... unless this component's messageViewContainerTagName has been set
      get() {
        const result = this.nodes.ui.messageViewContainerTagName;
        if (result === 'layer-standard-view-container' && this.properties.messageViewContainerTagNameIsSet) {
          return this.properties.messageViewContainerTagName;
        } else {
          return result;
        }
      },
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
     * @type {String} cardBorderStyle
     */
    cardBorderStyle: {
      set(newValue, oldValue) {
        if (oldValue) {
          this.classList.remove('layer-card-border-' + oldValue);
        }
        if (newValue) {
          this.classList.add('layer-card-border-' + newValue);
        }
      },
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
     * @type {String} widthType
     */
    widthType: {
      set(newValue, oldValue) {
        if (oldValue) this.classList.remove('layer-card-width-' + oldValue);
        if (newValue) this.classList.add('layer-card-width-' + newValue);
      },
    },
  },
  methods: {
    /**
     * This component can render any message that starts with text/plain message part
     *
     * @method
     * @static
     */
    handlesMessage(message, container) {
      return Boolean(message.getRootPart());
    },

    // Standard lifecycle event insures that _handleSelection will be called when clicked
    onCreate() {
      this.addClickHandler('card-click', this, this._handleSelection.bind(this));
    },

    // Standard lifecycle event insures that setupMessage is called
    onAfterCreate() {
      if (this.message) this.setupMessage();
    },

    /**
     * Given a message and a model, generate the UI Component and a Display Container.
     *
     * @method setupMessage
     */
    setupMessage() {
      if (!this.model) return;

      // The rootPart is typically the Root Part of the message, but the Card View may be asked to render subcards
      // Clearly differentiate a top level Root Part from subparts using the layer-root-card css class
      if (this.model.part === this.message.getRootPart()) this.classList.add('layer-root-card');

      const cardUIType = this.model.currentMessageRenderer;
      this.classList.add(cardUIType);
      if (this.parentComponent && this.parentComponent.isMessageListItem) {
        this.parentComponent.classList.add('layer-message-item-' + cardUIType);
      }
      const cardUI = this.createElement(cardUIType, {
        model: this.model,
        messageViewer: this,
        noCreate: true,
      });
      this.nodes.ui = cardUI;

      const cardContainerClass = this.messageViewContainerTagName;
      if (this.messageViewContainerTagName) this.classList.add(this.messageViewContainerTagName);

      if (cardContainerClass) {
        const cardContainer = this.createElement(cardContainerClass, {
          model: this.model,
          ui: cardUI,
          parentNode: this,
          name: 'cardContainer',
          noCreate: true, // tells createElement not to call _onAfterCreate just yet
        });
        cardContainer.ui = cardUI;
        cardUI.parentComponent = cardContainer;
        this.cardBorderStyle = this.properties.cardBorderStyle || cardContainer.cardBorderStyle || 'standard';
      } else {
        this.appendChild(cardUI);
        this.cardBorderStyle = this.properties.cardBorderStyle || cardUI.cardBorderStyle || 'standard';
      }

      CustomElements.takeRecords();
      if (this.nodes.cardContainer) this.nodes.cardContainer._onAfterCreate();
      if (cardUI._onAfterCreate) cardUI._onAfterCreate();
      if (this.nodes.cardContainer) cardUI._setupContainerClasses();
    },

    /**
     * When the user taps/clicks/selects this Message, call `runAction()`
     *
     * @method _handleSelection
     * @private
     * @param {Event} evt
     */
    _handleSelection(evt) {
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
    _runAction(action) {
      if (this.nodes.ui.runAction && this.nodes.ui.runAction(action)) return;

      const event = action && action.event ? action.event : this.model.actionEvent;
      const actionData = action && action.data ? action.data : this.model.actionData; // TODO: perhaps merge action.data with actionData?
      const rootModel = this.message.getRootPart().createModel();

      const args = {
        model: this.model,
        rootModel,
        data: actionData,
        messageViewer: this,
      };

      // Trigger an event based on the event name; trigger returns false if evt.preventDefault() was called
      const actionHandlerAllowed = this.nodes.ui.trigger(event, args);

      // If evt.preventDefault() was not called then invoke any registered action handler
      if (actionHandlerAllowed && messageActionHandlers[event]) {
        messageActionHandlers[event].call(null, args);
      }
    },
  },
});
