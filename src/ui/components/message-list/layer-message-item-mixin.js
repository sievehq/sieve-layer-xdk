/**
 * The Layer Message Item widget renders a single Message synopsis.
 *
 * This is designed to go inside of the layerUI.MessageList widget.  This widget renders the framework of information that goes around a Message,
 * but leaves it up to custom handlers to render the contents and assorted MIME Types of the messages.
 *
 * This Component has two named templates:
 *
 * * `layer-message-item-sent`: Rendering for Messages sent by the owner of this Session
 * * `layer-message-item-received`: Rendering for Messages sent by other users
 *
 * ## CSS Classes
 *
 * * When sending a message, if using `presend()` the message item will have the CSS class `layer-message-preview` until its sent
 * * The tagName used to render the content within the message item will be used as a class name of the parent item.
 *   If using a `<layer-message-text-plain />` widget within the item, the item itself will receive the `layer-message-text-plain` CSS class
 * * `layer-unread-message` will be applied to any message that the user has received but which hasn't been marked as read
 * * `layer-message-status-read-by-all`: All receipients of your user's message have read the message
 * * `layer-message-status-read-by-some`: Some receipients of your user's message have read the message
 * * `layer-message-status-read-by-none`: No receipients of your user's message have read the message
 * * `layer-message-status-delivered-to-all`: All receipients of your user's message have received the message on their device
 * * `layer-message-status-delivered-to-some`: Some receipients of your user's message have received the message on their device
 * * `layer-message-status-delivered-to-none`: No receipients of your user's message have received the message on their device
 * * `layer-message-status-pending`: The Message is trying to reach the server and has not yet completed sending
 * * `layer-list-item-last`: The message is the last in a series of messages from the same sender and within the same block of time
 * * `layer-list-item-first`: The message is the first in a series of messages from the same sender and within the same block of time
 *
 * ## Advanced Customization
 *
 * The simple way to customize the widget is to modify its template.
 * For more advanced customizations where the Message Item widget needs new properties, methods and capabilities, you have two options:
 *
 * 1. Define a custom `<layer-message-item/>` widget; this works but your now entirely responsible for all of its
 *    behaviors, and can not easily integrate fixes and enhancements added to this repo. This is discussed in more
 *    detail at [docs.layer.com](https://docs.layer.com).
 * 2. Enhance the provided widget with Mixins.  Below illustrates an example of a mixin.
 *
 * A Custom Mixin can be used to add Properties and Methods to this class.
 * Any method of this class can be enhanced using a Custom Mixin, however the following methods are recommended
 * as sufficient for most solutions:
 *
 * * layerUI.components.MessagesListPanel.List.onCreate: Your widget has just been created; it has a DOM node, it has child
 *   nodes, *it has no properties*, nor does not yet have a `parentNode`.
 *   Provide an `onCreate` if there is any DOM manipulation you want to do any initialization.  (DOM Manipulation here should NOT depend
 *   upon property values).
 * * layerUI.components.MessagesListPanel.List.onAttach: Your widget now has a `parentNode`.  This is solely for initialization
 *   code that depends upon looking at the `parentNode`, and is not commonly used.
 * * layerUI.components.MessagesListPanel.List.onRender: Your Message Item widget has just been rendered for the first time.
 *   Your widget should have an `item` at this point and any property-based dom manipulation can be done at this time.
 *
 * The following example adds a search bar to the Message List
 * ```
 * layerUI.init({
 *   appId: 'my-app-id',
 *   mixins: {
 *     'layer-messages-item': {
 *       properties: {
 *         selected: {
 *           value: false,
 *           set: function(value) {
 *             if (this.nodes.checkbox) this.nodes.checkbox.checked = value;
 *           },
 *           get: function() {
 *             return this.nodes.checkbox ? this.nodes.checkbox.checked : this.properties.selected;
 *           }
 *         }
 *       },
 *       methods: {
 *         onCreate: function() {
 *           this.nodes.checkbox = document.createElement('input');
 *           this.nodes.checkbox.type = 'checkbox';
 *           this.nodes.checkbox.classList.add('custom-checkbox');
 *           this.nodes.checkbox.addEventListener('click', this._handleCustomCheckboxEvent.bind(this));
 *           this.appendChild(this.nodes.checkbox);
 *         },
 *
 *         // When the widget has been rendered is a good time to do any property based dom manipulation
 *         onRender: function() {
 *          this.nodes.checkbox.checked = this.selected;
 *         },
 *
 *         // Search is run whenver the user changes the search text, app changes the search text,
 *         // or new messages arrive that need to be searched
 *         _handleCustomCheckboxEvent(evt) {
 *           this.trigger('custom-message-checkbox-change', {
 *             isChecked: this.selected,
 *             item: this.item
 *           });
 *         }
 *       }
 *     }
 *   }
 * });
 * ```
 *
 * @class layerUI.components.MessagesListPanel.Item
 * @mixins layerUI.mixins.ListItem
 * @extends layerUI.components.Component
 */
import Layer from '../../../core';
import Constants from '../../../constants';
import Util from '../../../util';
import '../layer-replaceable-content/layer-replaceable-content';

module.exports = {
  properties: {

    /**
     * Rather than sort out `instanceof` operations, you can use `isMessageListItem` to test to see if a widget represents a Message Item.
     *
     * A Message Item only shows up in a MessageList; other places where Messages are rendered (layer-notifier, layer-conversation-last-message, etc...) are
     * NOT Message Items, and may need to keep its content more compact.
     */
    isMessageListItem: {
      value: true,
    },

    // Every List Item has an item property, here it represents the Conversation to render
    item: {},

    /**
     * Deletion of this Message is enabled.
     *
     * ```
     * widget.getDeleteEnabled = function(message) {
     *    return message.sender.sessionOwner;
     * }
     * ```
     *
     * @property {Function}
     */
    getDeleteEnabled: {
      type: Function,
    },

    /**
     * HTML Tag to generate for the current content
     *
     * @private
     * @property {String}
     */
    _contentTag: {
      set(newTag, oldTag) {
        if (oldTag) this.removeClass(oldTag);
        if (newTag) this.addClass(newTag);
      },
    },

    /**
     * Provide property to override the function used to render a date for each Message Item.
     *
     * Note that changing this will not regenerate the list; this should be set when initializing a new List.
     *
     * ```javascript
     * messageItem.dateRenderer = function(date) {
     *    return date.toISOString();
     * };
     * ```
     *
     * @property {Function}
     */
    dateRenderer: {},

    dateFormat: {},

    /**
     * Provide a function that returns the menu items for the given Conversation.
     *
     * Note that this is called each time the user clicks on a menu button to open the menu,
     * but is not dynamic in that it will regenerate the list as the Conversation's properties change.
     *
     * Format is:
     *
     * ```
     * widget.getMenuOptions = function(conversation) {
     *   return [
     *     {text: "label1", method: method1},
     *     {text: "label2", method: method2},
     *     {text: "label3", method: method3}
     *   ];
     * }
     * ```
     *
     * @property {Function} getMenuOptions
     * @property {layer.Conversation} getMenuOptions.conversation
     * @property {Object[]} getMenuOptions.returns
     */
    getMenuOptions: {
      type: Function,
      propagateToChildren: true,
    },

    /**
     * Provide property to override the function used to render a date for each Message Item.
     *
     * Note that changing this will not regenerate the list; this should be set when initializing a new List.
     *
     * ```javascript
     * messageItem.messageStatusRenderer = function(message) {
     *    return message.readStatus === layer.Constants.RECIPIENT_STATE.ALL ? 'read' : 'processing...';
     * };
     * ```
     *
     * @property {Function}
     */
    messageStatusRenderer: {},
  },
  methods: {
    onCreate: function onCreate() {
      this.classList.add('layer-message-item');
    },

    onAfterCreate() {
      const dateFormat = this.dateFormat;
      if (dateFormat && this.nodes.date) {
        Object.keys(dateFormat).forEach(formatName => (this.nodes.date[formatName + 'Format'] = dateFormat[formatName]));
      }
    },

    onRender: function onRender() {
      try {

        // Setup the layer-sender-name
        if (this.nodes.sender) {
          this.nodes.sender.innerHTML = this.item.sender.displayName;
        }

        if (this.nodes.avatar) {
          this.nodes.avatar.users = [this.item.sender];
        }

        // Setup the layer-date
        if (this.nodes.date && !this.item.isNew()) {
          if (this.dateRenderer) this.nodes.date.dateRenderer = this.dateRenderer;
          this.nodes.date.date = this.item.sentAt;
        }

        // Setup the layer-message-status
        if (this.nodes.status && this.messageStatusRenderer) this.nodes.status.messageStatusRenderer = this.messageStatusRenderer;

        // Setup the layer-delete
        if (this.nodes.delete) {
          this.nodes.delete.enabled = this.getDeleteEnabled ? this.getDeleteEnabled(this.properties.item) : true;
        }

        // Generate the renderer for this Message's MessageParts.
        this._applyContentTag();

        // Render all mutable data
        this.onRerender();
      } catch (err) {
        console.error('layer-message-item.render(): ', err);
      }
    },

    onRerender() {
      const readStatus = this.properties.item.readStatus;
      const deliveryStatus = this.properties.item.deliveryStatus;
      const statusPrefix = 'layer-message-status';
      this.toggleClass('layer-unread-message', !this.properties.item.isRead);
      this.toggleClass(`${statusPrefix}-read-by-all`, readStatus === Constants.RECIPIENT_STATE.ALL);
      this.toggleClass(`${statusPrefix}-read-by-some`, readStatus === Constants.RECIPIENT_STATE.SOME);
      this.toggleClass(`${statusPrefix}-read-by-none`, readStatus === Constants.RECIPIENT_STATE.NONE);

      this.toggleClass(`${statusPrefix}-delivered-to-all`, deliveryStatus === Constants.RECIPIENT_STATE.ALL);
      this.toggleClass(`${statusPrefix}-delivered-to-some`, deliveryStatus === Constants.RECIPIENT_STATE.SOME);
      this.toggleClass(`${statusPrefix}-delivered-to-none`, deliveryStatus === Constants.RECIPIENT_STATE.NONE);

      this.toggleClass(`${statusPrefix}-pending`, this.properties.item.isSaving());
      this.toggleClass('layer-message-preview', this.properties.item.isNew());
    },

    /**
     * The parent component sets the _contentTag property, and now its time to use it.
     *
     * Use that tagName to create a DOM Node to render the MessageParts.
     *
     * @method
     * @private
     */
    _applyContentTag() {
      let messageHandler;
      if (this._contentTag.toLowerCase() === 'layer-message-viewer') {
        messageHandler = this.nodes.messageViewer;
        if (this.nodes.content) this.nodes.content.parentNode.removeChild(this.nodes.content);
        this.nodes.messageViewer.message = this.item;
      } else {
        messageHandler = document.createElement(this._contentTag);
        messageHandler.parentComponent = this;
        messageHandler.message = this.item;
        this.nodes.messageHandler = messageHandler;
        this.nodes.messageViewer.parentNode.removeChild(this.nodes.messageViewer);
        this.nodes.content.appendChild(messageHandler);
      }
      Util.defer(() => {
        if (messageHandler.style.height) {
          this.nodes.content.style.height = messageHandler.style.height;
        }
      });
    },
  },
};
