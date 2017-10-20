/**
 * The Layer Conversation Panel includes a Message List, Typing Indicator Panel, and a Compose bar.
 *
 * Note that its up to the developer to tell this panel what its showing by setting the `conversationId` property.
 * This property affects what messages are rendered, what typing indicators are sent and rendered, and what Conversations messages are
 * sent to when your user types into the compose bar.
 *
 * Changing the `conversationId` is as simple as:
 *
 * ```javascript
 *  function selectConversation(conversation) {
 *    conversationPanel.conversationId = conversation.id;
 *  }
 * ```
 *
 * or if using a templating engine, something like this would also work for setting the `conversationId`:
 *
 * ```
 * <layer-conversation-view conversation-id={selectedConversationId}></layer-conversation-view>
 * ```
 *
 * This Component can be added to your project directly in the HTML file:
 *
 * ```
 * <layer-conversation-view></layer-conversation-view>
 * ```
 *
 * Or via DOM Manipulation:
 *
 * ```javascript
 * var conversation = document.createElement('layer-conversation-view');
 * ```
 *
 * ## Key Properties
 *
 * * layer.UI.components.ConversationPanel.conversationId (attribute-name: `conversation-id`): Set what conversation is being viewed
 * * layer.UI.components.ConversationPanel.queryId (attribute-name: `query-id`): If your app already has a layer.Core.Query, you can provide it to this widget to render and page through its Messages.  If you don't have a layer.Core.Query instance, this widget will generate one for you.
 *
 * NOTE: If you provide your own Query, you must update its predicate when changing Conversations.
 *
 * ## Events
 *
 * Events listed here come from either this component, or its subcomponents.
 *
 * * {@link layer.UI.components.Composer#layer-send-message layer-send-message}: User has requested their Message be sent
 * * {@link layer.UI.components.TypingIndicator#layer-typing-indicator-change layer-typing-indicator-change}: Someone in the Conversation has started/stopped typing
 *
 * @class layer.UI.components.ConversationPanel
 * @extends layer.UI.components.Component
 * @mixin layerUI.mixins.MainComponent
 * @mixin layerUI.mixins.HasQuery
 * @mixin layerUI.mixins.FileDropTarget
 */
import Core from '../../../core';
import Constants from '../../../constants';
import { registerComponent } from '../component';
import MainComponent from '../../mixins/main-component';
import HasQuery from '../../mixins/has-query';
import FocusOnKeydown from '../../mixins/focus-on-keydown';
import FileDropTarget from '../../mixins/file-drop-target';
import Throttler from '../../mixins/throttler';

import '../message-list/layer-message-list/layer-message-list';
import '../layer-compose-bar/layer-compose-bar';
import '../layer-typing-indicator/layer-typing-indicator';

registerComponent('layer-conversation-view', {
  mixins: [MainComponent, HasQuery, FocusOnKeydown, FileDropTarget, Throttler],

  /**
   * This event is triggered before any Message is sent.
   *
   * You can use this event to provide your own logic for sending the Message.
   *
   * ```javascript
   * conversationPanel.onSendMessage = function(evt) {
   *   evt.preventDefault();
   *   var message = evt.detail.item;
   *   myAsyncLookup(function(result) {
   *     var part = new layer.MessagePart({
   *       mimeType: 'application/json',
   *       body: result
   *     });
   *     message.addPart(part);
   *     message.send();
   *   });
   * };
   * ```
   *
   * @property {Function} onSendMessage
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Message} evt.detail.item
   */

  /**
   * This event is triggered before any Message is sent.
   *
   * You can use this event to provide your own logic for sending the Message.
   *
   * ```javascript
   * document.body.addEventListener('layer-send-message', function(evt) {
   *   evt.preventDefault();
   *   var message = evt.detail.item;
   *   myAsyncLookup(function(result) {
   *     var part = new layer.MessagePart({
   *       mimeType: 'application/json',
   *       body: result
   *     });
   *     message.addPart(part);
   *     message.send();
   *   });
   * });
   * ```
   *
   * @event layer-send-message
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Message} evt.detail.item
   * @param {Object} evt.detail.notification
   */

  /**
   * This event is triggered before the Message is deleted.
   *
   * You can use this event to provide your own logic for deleting the Message, or preventing it from being deleted.
   *
   * ```javascript
   * conversationPanel.onMessageDeleted = function(evt) {
   *   evt.preventDefault();
   *   var message = evt.detail.item;
   *   message.delete(layer.Constants.DELETION_MODES.MY_DEVICES);
   * };
   * ```
   *
   * @property {Function} onMessageDeleted
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Message} evt.detail.item
   * @removed 2.0, use menu options callback to perform any needed actions or trigger any needed events
   */

  /**
   * This event is triggered before the Message is deleted.
   *
   * You can use this event to provide your own logic for deleting the Message, or preventing it from being deleted.
   *
   * ```javascript
   * document.body.addEventListener('layer-message-deleted', function(evt) {
   *   evt.preventDefault();
   *   var message = evt.detail.item;
   *   message.delete(layer.Constants.DELETION_MODES.MY_DEVICES);
   * });
   * ```
   *
   * @event layer-message-deleted
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Message} evt.detail.item
   * @removed 2.0, use menu options callback to perform any needed actions or trigger any needed events
   */

  /**
   * Custom handler to use for rendering typing indicators.
   *
   * By calling `evt.preventDefault()` on the event you can provide your own custom typing indicator text to this widget:
   *
   * ```javascript
   * conversationPanel.onTypingIndicator = function(evt) {
   *    evt.preventDefault();
   *    var widget = evt.target;
   *    var typingUsers = evt.detail.typing;
   *    var pausedUsers = evt.detail.paused;
   *    var text = '';
   *    if (typingUsers.length) text = typingUsers.length + ' users are typing';
   *    if (pausedUsers.length && typingUsers.length) text += ' and ';
   *    if (pausedUsers.length) text += pausedUsers.length + ' users have paused typing';
   *    widget.value = text;
   * };
   * ```
   *
   * Note that as long as you have called `evt.preventDefault()` you can also just directly manipulate child domNodes of `evt.detail.widget`
   * if a plain textual message doesn't suffice.
   *
   * @property {Function} onTypingIndicatorChange
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Core.Identity[]} evt.detail.typing
   * @param {layer.Core.Identity[]} evt.detail.paused
   */

  /**
   * Custom handler to use for rendering typing indicators.
   *
   * By calling `evt.preventDefault()` on the event you can provide your own custom typing indicator text to this widget:
   *
   * ```javascript
   * document.body.addEventListener('layer-typing-indicator-change', function(evt) {
   *    evt.preventDefault();
   *    var widget = evt.target;
   *    var typingUsers = evt.detail.typing;
   *    var pausedUsers = evt.detail.paused;
   *    var text = '';
   *    if (typingUsers.length) text = typingUsers.length + ' users are typing';
   *    if (pausedUsers.length && typingUsers.length) text += ' and ';
   *    if (pausedUsers.length) text += pausedUsers.length + ' users have paused typing';
   *    widget.value = text;
   * });
   * ```
   *
   * Note that as long as you have called `evt.preventDefault()` you can also just directly manipulate child domNodes of `evt.detail.widget`
   * if a plain textual message doesn't suffice.
   *
   * @event layer-typing-indicator-change
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Core.Identity[]} evt.detail.typing
   * @param {layer.Core.Identity[]} evt.detail.paused
   */

  /**
   * This event is triggered whenever the composer value changes.
   *
   * This is not a cancelable event.
   *
   * ```javascript
   * conversationPanel.onComposerChangeValue = function(evt) {
   *   this.setState({composerValue: evt.detail.value});
   * }
   * ```
   *
   * @property {Function} onComposerChangeValue
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {String} evt.detail.value
   * @param {String} evt.detail.oldValue
   */
  events: ['layer-send-message', 'layer-typing-indicator-change',
    'layer-compose-bar-change-value'],

  properties: {

    // Documented in mixins/has-query.js
    query: {
      set(value) {
        this.nodes.list.query = value;
      },
    },

    /**
     * ID of the Conversation being shown by this panel.
     *
     * This Conversation ID specifies what conversation to render and interact with.
     * This property needs to be changed any time you change to view a different Conversation.
     *
     * Alternative: See layer.UI.components.LayerConversation.conversation property.  Strings however are easier to stick
     * into html template files.
     *
     * ```
     * function selectConversation(selectedConversation) {
     *   // These two lines are equivalent:
     *   widget.conversation = selectedConversation;
     *   widget.conversationId = selectedConversation.id;
     * }
     * ```
     *
     * @property {String} [conversationId='']
     */
    conversationId: {
      set(value) {
        if (value && value.indexOf('layer:///conversations') !== 0 && value.indexOf('layer:///channels') !== 0) this.properties.conversationId = '';
        if (this.client) {
          if (this.conversationId) {
            if (this.client.isReady && !this.client.isDestroyed) {
              this.conversation = this.client.getObject(this.conversationId, true);
            } else {
              this.client.once('ready', () => {
                if (this.conversationId) this.conversation = this.client.getObject(this.conversationId, true);
              });
            }
          } else {
            this.conversation = null;
          }
        }
      },
    },

    /**
     * If you have an initial conversation id, but what this property to be otherwise ignored.
     *
     * When to use this? You have set your Conversation Panel to `listen-to` your Conversation List,
     * but you still want to be able to set an initial conversation.  Any changes to this property
     * will be ignored.
     *
     * @property {String} initialConversationId
     */
    initialConversationId: {
      set(value) {
        if (!this.properties._internalState.onAfterCreateCalled) {
          this.conversationId = value;
        }
      },
    },

    /**
     * The Conversation being shown by this panel.
     *
     * This Conversation ID specifies what conversation to render and interact with.
     * This property needs to be changed any time you change to view a different Conversation.
     *
     * Alternative: See layer.UI.components.LayerConversation.conversationId property for an easier property to use
     * within html templates.
     *
     * ```
     * function selectConversation(selectedConversation) {
     *   // These two lines are equivalent:
     *   widget.conversationId = selectedConversation.id;
     *   widget.conversation = selectedConversation;
     * }
     * ```
     *
     * @property {layer.Container}
     */
    conversation: {
      set(value) {
        if (value && !(value instanceof Core.Conversation || value instanceof Core.Channel)) this.properties.conversation = null;
        if (this.client) this._setupConversation();
      },
    },

    // Docs in mixins/has-query.js; new behavior here is that any change to hasGeneratedQuery means
    // that now THIS component is responsible for managing the query predicate; call _setupConversation to see that done.
    hasGeneratedQuery: {
      set(value) {
        if (value && this.conversationId && this.client) this._setupConversation();
      },
      type: Boolean,
    },

    /**
     * Refocus on the Conversation Panel any time the Conversation ID changes.
     *
     * So, the user clicked on a Conversation in a Conversation List, and focus is no longer on this widget?
     * Automatically refocus on it.
     *
     * Possible values:
     *
     * * always
     * * desktop-only
     * * never
     *
     * Note that the definition we'd like to have for desktop-only is any device that automatically opens
     * an on-screen keyboard.  There are no good techniques for that.  But if we detect your on an Android device
     * we're going to assume it uses an on-screen keyboard.
     *
     * @property {String} [autoFocusConversation=desktop-only]
     */
    autoFocusConversation: {
      value: 'desktop-only',
    },

    // Docs in mixins/main-component.js
    client: {
      set(value) {
        if (value) {
          if (!this.conversation && this.conversationId) this.conversation = value.getObject(this.conversationId, true);
          if (this.conversation) this._setupConversation();
        }
      },
    },

    /**
     * Function allows for additional dom nodes to be generated and inserted before/after messages
     *
     * ```
     * conversationPanel.onRenderListItem = function(widget, messages) {
     *   var message = widget.item;
     *   if (message.sentAt.toDateString() !== messages[index - 1].sentAt.toDateString()) {
     *     widget.customNodeAbove = document.createElement('hr');
     *     widget.customNodeBelow = document.createElement('hr');
     *   }
     *  });
     * ```
     *
     * @property {Function} onRenderListItem
     * @property {layer.UI.components.MessagesListPanel.Item} onRenderListItem.widget
     *    One row of the list
     * @property {layer.Message[]} onRenderListItem.items
     *    full set of messages in the list
     * @property {Number} onRenderListItem.index
     *    index of the message in the items array
     * @property {Boolean} onRenderListItem.isTopItemNew
     *    If the top item is index 0, and its newly added rather than just affected by changes
     *    around it, this is often useful to know.
     */
    onRenderListItem: {
      type: Function,
      set(value) {
        this.nodes.list.onRenderListItem = value;
      },
      get() {
        return this.nodes.list.onRenderListItem;
      },
    },

    /**
     * Provide property to override the function used to render a date for each Message Item.
     *
     * Note that changing this will not rerender the list.
     *
     * ```javascript
     * conversationPanel.dateRenderer = function(date) {
     *    return date.toISOString();
     * };
     * ```
     *
     * @property {Function} [dateRenderer=null]
     */
    dateRenderer: {
      type: Function,
      set(value) {
        this.nodes.list.dateRenderer = value;
      },
    },

    /**
     * Provide property to override the function used to render a date for each Message Item.
     *
     * Note that changing this will not rerender the list.
     *
     * ```javascript
     * conversationPanel.messageStatusRenderer = function(message) {
     *    return message.readStatus === layer.Constants.RECIPIENT_STATE.ALL ? 'read' : 'processing...';
     * };
     * ```
     *
     * See layer.Message for more information on the properties available to determine a message's status.
     *
     * @property {Function} [messageStatusRenderer=null]
     */
    messageStatusRenderer: {
      type: Function,
      set(value) {
        this.nodes.list.messageStatusRenderer = value;
      },
    },

    /**
     * A dom node to render when there are no messages in the list.
     *
     * Could just be a message "Empty Conversation".  Or you can add interactive widgets.
     *
     * ```
     * var div = document.createElement('div');
     * div.innerHTML = 'Empty Conversation';
     * widget.emptyMessageListNode = div;
     * ```
     *
     * @property {HTMLElement} [emptyMessageListNode=null]
     * @removed
     */

    /**
     * A dom node to render when there are no more messages in the Message List.
     *
     * Could just be a message "Top of Conversation".
     *
     * ```
     * var div = document.createElement('div');
     * div.innerHTML = 'Top of Conversation';
     * widget.endOfMessagesNode = div;
     * ```
     *
     * Note that this node is *not* rendered when the list has no messages; see
     * emptyMessageListNode instead.
     *
     * Note that using the default template, this widget may be wrapped in a div with CSS class `layer-header-toggle`,
     * you should insure that they height of this toggle does not change when your custom node is shown.  Set the
     * style height to be at least as tall as your custom node.
     *
     * @property {HTMLElement} [emptyMessageListNode=null]
     * @removed
     */


    /**
     * Provide a function that returns the menu items for the given Conversation.
     *
     * Note that this is called each time the user clicks on a menu button to open the menu,
     * but is not dynamic in that it will regenerate the list as the Conversation's properties change.
     *
     * Format is:
     *
     * ```
     * widget.getMenuOptions = function(message) {
     *   return [
     *     {text: "label1", method: method1},
     *     {text: "label2", method: method2},
     *     {text: "label3", method: method3}
     *   ];
     * }
     * ```
     *
     * @property {Function} getMenuOptions
     * @property {layer.Message} getMenuOptions.message
     * @property {Object[]} getMenuOptions.returns
     */
    getMenuOptions: {
      type: Function,
      value: function getMenuOptions(message) {
        return [
          {
            text: 'delete',
            method() {
              message.delete(Constants.DELETION_MODE.ALL);
            },
          },
        ];
      },
      set(value) {
        this.nodes.list.getMenuOptions = value;
      }
    },
    /**
     * This iteration of this property is not dynamic; it will be applied to all future Conversation Items,
     * but not to the currently generated items.
     *
     * Use this to configure how dates are rendered.
     * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString for details
     * on the parameters that are supported by `toLocaleString`.
     *
     * There are four supported inputs
     *
     * * `today`: How to render dates that are today
     * * `week`: How to render dates that are not today, but within a 6 of today (note if today is
     *   wednesday, 1 week ago is also wednesday, and rendering `wednesday` would be confusing, so its 6 rather than 7 days.
     * * `default`: The default format to use
     * * `older`: The format to use for dates that are in a different year and more than 6 months in the past
     *
     * Example:
     *
     * ```
     * widget.dateFormat = {
     *    today: {"hour": "numeric", "minute": "numeric"},
     *    week: {"weekday": "short"},
     *    default: {"month": "short", "day": "2-digit"},
     *    older: {"month": "short", "year": "numeric"}
     * }
     * ```
     *
     * @property {Object}
     */
    dateFormat: {
      set() {
        this.nodes.list.dateFormat = this.dateFormat;
      },
    },

    /**
     * An array of buttons (dom nodes) to be added to the Compose bar, right side.
     *
     * ```
     * widget.composeButtons = [
     *     document.createElement('button'),
     *     document.createElement('button')
     * ];
     * ```
     *
     * @property {HTMLElement[]} [composeButtons=[]]
     * @removed
     */

    /**
     * An array of buttons (dom nodes) to be added to the Compose bar, left side.
     *
     * ```
     * widget.composeButtonsLeft = [
     *     document.createElement('button'),
     *     document.createElement('button')
     * ];
     * ```
     *
     * @property {HTMLElement[]} [composeButtonsLeft=[]]
     * @removed
     */

    /**
     * Use this to get/set the text in the Compose bar.
     *
     * ```
     * widget.composeText = 'This text will appear in the editor within the compose bar';
     * var message = conversation.createMessage(widget.composeText);
     * ```
     *
     * @property {String} [composeText='']
     */
    composeText: {
      get() {
        return this.nodes.composer.value;
      },
      set(value) {
        this.nodes.composer.value = value;
      },
    },

    /**
     * Use this to get/set the text in the Compose bar.
     *
     * ```
     * widget.composePlaceholder = 'Enter a message. Or dont. It really doesnt matter.';
     * ```
     *
     * @property {String} [composePlaceholder='']
     */
    composePlaceholder: {
      get() {
        return this.nodes.composer.placeholder;
      },
      set(value) {
        this.nodes.composer.placeholder = value;
      },
    },

    /**
     * Disable the widget to disable read receipts and other behaviors that may occur while the widget is hidden.
     *
     * ```
     * widget.disable = true;
     * ```
     *
     * @property {Boolean}
     */
    disable: {
      type: Boolean,
      set(value) {
        this.nodes.list.disable = value;
      },
    },

    /**
     * The model to generate a Query for if a Query is not provided.
     *
     * @readonly
     * @private
     * @property {String} [_queryModel=layer.Core.Query.Message]
     */
    _queryModel: {
      value: Core.Query.Message,
    },

    width: {
      set(newValue, oldValue) {
        this.toggleClass('layer-conversation-view-width-small', newValue < 460);
        this.toggleClass('layer-conversation-view-width-medium', newValue >= 460 && newValue < 600);
        this.toggleClass('layer-conversation-view-width-large', newValue >= 600);
      },
    },
  },
  methods: {
    onCreate() {
      this.properties._handleResize = this._handleResize.bind(this);
      window.addEventListener('resize', this.properties._handleResize);
    },

    onAttach() {
      this.width = this.clientWidth;
    },

    onDestroy() {
      window.removeEventListener('resize', this.properties._handleResize);
    },

    _handleResize() {
      this.width = this.clientWidth;
    },

    /**
     * When a key is pressed and text is not focused, focus on the composer
     *
     * @method onKeyDown
     */
    onKeyDown() {
      this.focusText();
    },

    /**
     * Place focus on the text editor in the Compose bar.
     *
     * ```
     * widget.focusText();
     * ```
     *
     * @method
     */
    focusText() {
      this.nodes.composer.focus();
    },

    /**
     * Send the Message that the user has typed in... or that you have specified.
     *
     * ```
     * widget.composeText = "Hello world";
     * widget.send(); // send the current text in the textarea
     * ```
     *
     * ```
     * widget.send(parts); // send custom message parts but NOT the text in the textarea
     * ```
     *
     * @method
     * @param {layer.MessagePart[]} optionalParts
     */
    send(optionalParts) {
      const args = optionalParts ? [optionalParts] : [];
      this.nodes.composer.send(...args);
    },

    /**
     * Given a Conversation ID and a Client, setup the Composer and Typing Indicator
     *
     * @method _setupConversation
     * @private
     */
    _setupConversation() {
      const conversation = this.properties.conversation;

      // Client not ready yet? retry once authenticated.
      if (this.client && !this.client.isReady) {
        this.client.once('ready', this._setupConversation.bind(this));
        return;
      } else if (!this.client) {
        return;
      }

      this.nodes.list.conversation = conversation;
      this.nodes.composer.conversation = conversation;
      this.nodes.typingIndicators.conversation = conversation;
      if (this.hasGeneratedQuery) {
        if (conversation instanceof Core.Conversation) {
          this.query.update({
            predicate: `conversation.id = "${conversation.id}"`,
          });
        } else if (conversation instanceof Core.Channel) {
          this.query.update({
            predicate: `channel.id = "${conversation.id}"`,
          });
        } else {
          this.query.update({
            predicate: '',
          });
        }
      }
      if (this.shouldAutoFocusConversation(navigator)) this.focusText();
    },
    shouldAutoFocusConversation({ userAgent = '', maxTouchPoints }) {
      switch (this.autoFocusConversation) {
        case 'always':
          return true;
        case 'desktop-only':
          if (maxTouchPoints !== undefined && maxTouchPoints > 0) return false;
          return !(userAgent.match(/(mobile|android|phone)/i));
        case 'never':
          return false;
      }
    },
  },
  listeners: {
    'layer-conversation-selected': function conversationSelected(evt) {
      this.conversation = evt.detail.item;
    },
    'layer-notification-click': function notificationClick(evt) {
      const message = evt.detail.item;
      const conversation = message.getConversation();
      if (conversation !== this.conversation) this.conversation = conversation;
    },
    'layer-message-notification': function messageNotification(evt) {
      // If the notification is not background, and we have toast notifications enabled, and message isn't in the selected conversation,
      // to a toast notify
      if (!evt.detail.isBackground && evt.detail.item.conversationId === this.conversation.id && evt.target.notifyInForeground === 'toast') {
        evt.preventDefault();
      }
    },
  },
});
