/**
 * The Layer Composer widget provides the textarea for layer.UI.components.ConversationPanel.
 *
 * It provides a self-resizing text area that resizes to the size of the entered text, and sends typing indicators as the user types.
 *
 * Special behaviors to know about:
 *
 * * CSS Class `layer-compose-bar-one-line-of-text`: If there is only a single line's worth of text, then this CSS class is applied to
 *   help center the text
 * * Event `layer-file-selected`: This widget listens for this event, and if it receives it, uses that event to retrieve a file to send in
 *   the Conversation.  Event comes from layer.UI.components.FileUploadButton or from your custom widgets.
 * * Keyboard Handling: ENTER: Sends message unless its accompanied by a modifier key.  TAB: Enters a \t character unless you
 *   set `layerUI.settings.disableTabAsWhiteSpace` to true
 *
 * @class layer.UI.components.Composer
 * @extends layer.UI.components.Component
 */
import Layer from '../../../core';
import { registerComponent } from '../component';
import { settings } from '../../base';

const ENTER = 13;
const TAB = 9;

registerComponent('layer-compose-bar', {
  properties: {

    /**
     * Specify which Conversation we are sending messages and typing indicators to.
     *
     * @property {layer.Conversation} [conversation=null]
     */
    conversation: {
      set(value) {
        if (value) this.client = value.getClient();
        this._setTypingListenerConversation();
        if (this.manageDisabledState) this.disabled = !Boolean(value);
      },
    },

    /**
     * The Client are we using to communicate.
     *
     * @property {layer.Client} [client=null]
     */
    client: {
      set(value) {
        if (!this.nodes.input) console.error('NO INPUT FOR COMPOSER');
        if (value) {
          this.properties.typingListener = this.properties.client.createTypingListener(this.nodes.input);
          this._setTypingListenerConversation();
        }
      },
    },

    /**
     * Custom buttons to put in the panel, on the right side.
     *
     * @property {HTMLElement[]} [buttons=[]]
     * @removed
     */


    /**
     * Custom buttons to put in the panel, on the left side.
     *
     * @property {HTMLElement[]} [buttonsLeft=[]]
     * @removed
     */

    /**
     * The text shown in the editor; this is the editor's value.
     *
     * @property {String} [value='']
     */
    value: {
      set(value) {
        const oldValue = this.nodes.input.value;
        this.nodes.input.value = value;
        this.onRender();
        this._triggerChange(value, oldValue);
      },
      get() {
        return this.nodes.input.value;
      },
    },
    /**
     * The text shown in the editor; this is the editor's placeholder.
     *
     * @property {String} [placeholder='']
     */
    placeholder: {
      set(value) {
        this.nodes.input.placeholder = value;
        this.onRender();
      },
      get() {
        return this.nodes.input.placeholder;
      },
    },

    isEmpty: {
      value: true,
      type: Boolean,
      set(value) {
        this.toggleClass('layer-is-empty', value);
      },
    },

    disabled: {
      type: Boolean,
      value: false,
      set(value) {
        this.toggleClass('layer-is-disabled', value);
        this.nodes.input.disabled = value;
      },
    },

    manageDisabledState: {
      type: Boolean,
      value: true,
    },
  },

  methods: {
    /**
     * Constructor.
     *
     * @method onCreate
     * @private
     */
    onCreate() {
      this.classList.add('layer-compose-bar-one-line-of-text');

      // Setting this in the template causes errors in IE 11.
      this.nodes.input.placeholder = 'Enter a message';
      this.nodes.input.addEventListener('keydown', this._onKeyDown.bind(this));
      this.nodes.input.addEventListener('input', this._onInput.bind(this));

      // Event handlers
      this.addEventListener('layer-file-selected', this._handleAttachments.bind(this));
      this.addEventListener('layer-send-click', this.send.bind(this, null));
    },

    /**
     * Whenever the value changes, trigger a `layer-compose-bar-change-value` event.
     *
     * @method
     * @private
     * @param {String} value      The current value
     * @param {String} oldValue   The prior value
     */
    _triggerChange(value, oldValue) {
      if (value === oldValue) return;
      this.properties.value = value;

      /**
       * This event is triggered whenever the composer value changes.
       *
       * This is not a cancelable event.
       *
       * ```javascript
       * document.body.addEventListener('layer-compose-bar-change-value', function(evt) {
       *   this.setState({composerValue: evt.detail.value});
       * }
       * ```
       *
       * @event layer-compose-bar-change-value
       * @param {Event} evt
       * @param {Object} evt.detail
       * @param {String} evt.detail.value
       * @param {String} evt.detail.oldValue
       */
      this.trigger('layer-compose-bar-change-value', { value, oldValue });

      this.isEmpty = !Boolean(this.value);
    },

    /**
     * Focus on the textarea so keyboard actions enter text into it.
     *
     * @method
     */
    focus() {
      this.nodes.input.focus();
    },

    /**
     * Update the Typing Listener's `conversation` property so that it reports typing activity
     * to the correct Conversation.
     *
     * @method
     * @private
     */
    _setTypingListenerConversation() {
      this.properties.typingListener.setConversation(this.conversation);
    },

    /**
     * Send the Message that the user has typed in.
     *
     * This is called automatically when the user hits `ENTER`.
     *
     * This can also be called directly:
     *
     * ```
     * widget.send(); // send the current text in the textarea
     * ```
     *
     * ```
     * widget.send(parts); // send custom message parts but NOT the text in the textarea
     * ```
     *
     * @method
     * @param {layer.CardModels[]} optionalModels
     */
    send(optionalModels) {

      if (optionalModels) {
        if (optionalModels.length === 1) {
          optionalModels[0].generateMessage(this.conversation, message => this._send(message, message.parts));
        } else {
          const CarouselModel = Layer.Client.getMessageTypeModelClass('CarouselModel');
          const model = new CarouselModel({
            items: optionalModels,
          });
          if (this.conversation) {
            model.generateMessage(this.conversation, message => this._send(message, message.parts));
          } else {
            model._generateParts(parts => this._send(null, parts));
          }
        }
      } else if (this.nodes.input.value) {
        const TextModel = Layer.Client.getMessageTypeModelClass('TextModel');
        const model = new TextModel({
          text: this.nodes.input.value,
        });
        if (this.conversation) {
          model.generateMessage(this.conversation, message => this._send(message, message.parts));
        } else {
          model._generateParts(parts => this._send(null, parts));
        }
        this.nodes.input.value = '';
        this._onInput({});
      }
    },
    _send(message, parts) {
      if (parts.length === 0) return;

      /**
       * This event is triggered before any Message is sent; used to control notifications and override sending.
       *
       * You can use this event to control the notifications by modifying the `evt.detail.notification` object.
       * Note that you should modify the object but not try to replace the object.
       *
       * ```javascript
       * document.body.addEventListener('layer-send-message', function(evt) {
       *   var message = evt.detail.item;
       *   var notification = evt.detail.notification;
       *   notification.title = 'You have a new Message from ' + message.sender.displayName;
       *   notification.sound = 'sneeze.aiff';
       *   if (message.parts[0].mimeType === 'text/plain') {
       *     notification.text = evt.detail.item.parts[0].body;
       *   } else {
       *     notification.text = 'You have received a file';
       *   }
       * }
       * ```
       *
       * You can also use this event to provide your own logic for sending the Message.
       *
       * ```javascript
       * document.body.addEventListener('layer-send-message', function(evt) {
       *   var message = evt.detail.item;
       *   evt.preventDefault();
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
       * @param {layer.MessagePart[]} evt.detail.parts   The array of message parts that will be sent
       * @param {layer.Message} evt.detail.item          The message that was created from the parts; null if no Conversation property is set
       * @param {layer.Conversation} evt.detail.conversation  The conversation that the message was created on; may be null if no conversation has been set.
       * @param {Object} evt.detail.notification
       * @param {String} evt.detail.notification.text
       * @param {String} evt.detail.notification.title
       * @param {String} evt.detail.notification.sound
       */
      let textPart = parts.filter(part => part.mimeType === 'text/plain')[0];
      let textValue;
      if (textPart) {
        textValue = textPart.body;
      } else {
        let textModel = parts.filter(part => part.mimeAttributes.role === 'root')
          .map(part => this.client.getMessageTypeModel(part.id))
          .filter(model => model.text && !model.getTitle() && !model.getFooter());
        if (textModel) textValue = textModel.text;
      }
      const notification = {
        text: textPart ? textValue : 'File received',
        title: `New Message from ${this.client.user.displayName}`,
      };

      if (this.trigger('layer-send-message', {
        parts,
        notification,
        item: message,
        conversation: this.conversation,
      })) {
        if (!this.conversation) {
          console.error('Unable to send message without a conversationId');
        } else if (this.conversation instanceof Layer.Channel) {
          this.onSend(message);
          message.send();
        } else {
          this.onSend(message, notification);
          message.send(notification);
        }
      }
    },

    /**
     * MIXIN HOOK: Called just before sending a message.
     *
     * @method
     * @param {layer.Message} message
     * @param {Object} notification   See layer.Message.send for details on the notification object
     */
    onSend(message, notification) {
      // No-op
    },

    /**
     * On ENTER call `send()`; on TAB enter some spacing rather than leaving the text area.
     *
     * @method
     * @private
     */
    _onKeyDown(event) {
      if (event.keyCode === ENTER) {
        if (!event.shiftKey && !event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          this.send();
        } else {
          event.target.value += '\n';
          this._onInput(event);
        }
      } else if (!settings.disableTabAsWhiteSpace && event.keyCode === TAB && !event.shiftKey) {
        event.preventDefault();
        event.target.value += '\t  ';
        this._onInput(event);
      }
    },

    _onInput(event) {
      this.onRender();
      this._triggerChange(this.nodes.input.value, this.properties.value);
    },

    /**
     * On any change in value, recalculate our height and lineHeight to fit the input text.
     *
     * @method
     * @private
     */
    onRender() {
      setTimeout(() => {
        this.nodes.resizer.innerHTML = this.nodes.input.value.replace(/\n/g, '<br/>') || '&nbsp;';
        this.nodes.lineHeighter.innerHTML = this.nodes.input.value.replace(/\n/g, '<br/>') || '&nbsp;';
        const willBeOneLine = !this.nodes.input.value.match(/\n/) && (this.nodes.resizer.clientHeight - this.nodes.lineHeighter.clientHeight < 10);

        // Prevent scrollbar flickering in and then out
        if (willBeOneLine) {
          this.nodes.input.style.overflow = 'hidden';
          setTimeout(() => { this.nodes.input.style.overflow = ''; }, 1);
        }

        // Note that classList.toggle doesn't work right in IE11
        this.classList[willBeOneLine ? 'add' : 'remove']('layer-compose-bar-one-line-of-text');
      }, 10);
    },

    /**
     * If a file event was detected, send some attachments.
     *
     * @method
     * @private
     */
    _handleAttachments(evt) {
      this.send(evt.detail.models);
    },
  },
});


