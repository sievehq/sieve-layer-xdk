/**
 *
 * @class layer.UI.handlers.message.messageViewer
 * @extends layer.UI.components.Component
 */
import { registerMessageComponent } from '../../components/component';
import MessageHandler from '../../mixins/message-handler';
import Clickable from '../../mixins/clickable';

import { messageActionHandlers } from '../../base';


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
    model: {},
    label: {
      get() {
        return this.model.label;
      },
    },
    rootPart: {},
    message: {
      set(message) {
        this.innerHTML = '';
        if (message) {
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
     * @type {String}
     */
    messageViewContainerTagName: {
      noGetterFromSetter: true,
      set(inValue) {
        this.properties.messageViewContainerTagNameIsSet = true;
      },
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

    // One of:
    // "full-width": Uses all available width
    // "chat-bubble": No minimum, maximum is all available width; generallay does not look like a card
    // "flex-width": card that has a minimum and a maximum but tries for an optimal size for its contents
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
      return Boolean(message.getPartsMatchingAttribute({ role: 'root' })[0]);
    },

    onCreate() {
      this.addClickHandler('card-click', this, this.handleSelection.bind(this));
    },

    onAfterCreate() {
      if (this.message) this.setupMessage();
    },

    setupMessage() {
      // The rootPart is typically the Root Part of the message, but the Card View may be asked to render subcards
      // in which case its rootPart property will be preset
      const rootPart = this.message.getPartsMatchingAttribute({ role: 'root' })[0];
      if (!this.rootPart) {
        this.rootPart = rootPart;
      }
      if (!this.rootPart) return;

      // Clearly differentiate a top level Root Part from subparts using the layer-root-card css class
      if (this.rootPart === rootPart) this.classList.add('layer-root-card');

      if (!this.model) this.model = this.client.createMessageTypeModel(this.message, this.rootPart);
      if (!this.model) return;

      const cardUIType = this.model.currentMessageRenderer;
      this.classList.add(cardUIType);
      const cardUI = this.createElement(cardUIType, {
        model: this.model,
        messageViewer: this,
        noCreate: true,
      });
      this.nodes.ui = cardUI;

      const cardContainerClass = this.messageViewContainerTagName;
      if (this.messageViewContainerTagName) this.classList.add(this.messageViewContainerTagName);
      if (cardUI.messageViewContainerTagName === 'layer-standard-display-container') {
        this.classList.add('layer-card-primitive');
      }
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
      if (this.nodes.cardContainer) cardUI.setupContainerClasses();

    },

    /**
     *
     * @method
     */
    onRender() {

    },

    onRerender() {

    },


    handleSelection(evt) {
      evt.stopPropagation();
      this.runAction({});
    },

    runAction(options) {
      if (this.nodes.ui.runAction && this.nodes.ui.runAction(options)) return;

      const event = options && options.event ? options.event : this.model.actionEvent;
      const actionData = options && options.data ? options.data : this.model.actionData; // TODO: perhaps merge options.data with actionData?

      if (messageActionHandlers[event]) return messageActionHandlers[event].apply(this, [actionData]);
      const rootPart = this.message.getPartsMatchingAttribute({ role: 'root' })[0];
      const rootModel = this.client.getMessageTypeModel(rootPart.id);
      this.nodes.ui.trigger(event, {
        model: this.model,
        rootModel,
        data: actionData,
      });
    },
  },
});

