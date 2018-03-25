/**
 * The Typing Listener Class listens to keyboard events on
 * your text field, and uses the layer.TypingPublisher to
 * send state based on keyboard behavior.
 *
 *      var typingListener = client.createTypingListener(document.getElementById('mytextarea'));
 *
 *  You change what Conversation
 *  the typing indicator reports your user to be typing
 *  in by calling:
 *
 *      typingListener.setConversation(mySelectedConversation);
 *
 * There are two ways of cleaning up all pointers to your input so it can be garbage collected:
 *
 * 1. Destroy the listener:
 *
 *        typingListener.destroy();
 *
 * 2. Remove or replace the input:
 *
 *        typingListener.setInput(null);
 *        typingListener.setInput(newInput);
 *
 * @class  Layer.Core.TypingIndicators.TypingListener
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _namespace = require('../namespace');

var _namespace2 = _interopRequireDefault(_namespace);

var _typingPublisher = require('./typing-publisher');

var _typingPublisher2 = _interopRequireDefault(_typingPublisher);

var _typingIndicators = require('./typing-indicators');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }


var TypingListener = function () {

  /**
   * Create a TypingListener that listens for the user's typing.
   *
   * The TypingListener needs
   * to know what Conversation the user is typing into... but it does not require that parameter during initialization.
   *
   * @method constructor
   * @param  {Object} args
   * @param {HTMLElement} [args.input=null] - A Text editor dom node that will have typing indicators
   * @param {Object} [args.conversation=null] - The Conversation Object or Instance that the input will send messages to
   */
  function TypingListener(args) {
    _classCallCheck(this, TypingListener);

    this.conversation = args.conversation;
    this.publisher = new _typingPublisher2.default({
      conversation: this.conversation
    });

    this.intervalId = 0;
    this.lastKeyId = 0;

    this._handleKeyPress = this._handleKeyPress.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this.setInput(args.input);
  }

  _createClass(TypingListener, [{
    key: 'destroy',
    value: function destroy() {
      this._removeInput(this.input);
      this.publisher.destroy();
    }

    /**
     * Change the input being tracked by your TypingListener.
     *
     * If you are removing your input from the DOM, you can simply call
     *
     *     typingListener.setInput(null);
     *
     * And all event handlers will be removed, allowing for garbage collection
     * to cleanup your input.
     *
     * You can also call setInput with a newly created input:
     *
     *     var input = document.createElement('input');
     *     typingListener.setInput(input);
     *
     * @method setInput
     * @param {HTMLElement} input - Textarea or text input
     */

  }, {
    key: 'setInput',
    value: function setInput(input) {
      if (input !== this.input) {
        this._removeInput(this.input);
        this.input = input;

        // Use keypress rather than keydown because the user hitting alt-tab to change
        // windows, and other meta keys should not result in typing indicators
        this.input.addEventListener('keypress', this._handleKeyPress);
        this.input.addEventListener('keydown', this._handleKeyDown);
      }
    }

    /**
     * Cleanup and remove all links and callbacks keeping input from being garbage collected.
     *
     * @method _removeInput
     * @private
     * @param {HTMLElement} input - Textarea or text input
     */

  }, {
    key: '_removeInput',
    value: function _removeInput(input) {
      if (input) {
        input.removeEventListener('keypress', this._handleKeyPress);
        input.removeEventListener('keydown', this._handleKeyDown);
        this.input = null;
      }
    }

    /**
     * Change the Conversation; this should set the state of the old Conversation to "finished".
     *
     * Use this when the user has changed Conversations and you want to report on typing to a new
     * Conversation.
     *
     * @method setConversation
     * @param  {Object} conv - The new Conversation Object or Instance
     */

  }, {
    key: 'setConversation',
    value: function setConversation(conv) {
      if (conv !== this.conversation) {
        this.conversation = conv;
        this.publisher.setConversation(conv);
      }
    }

    /**
     * Whenever the key is pressed, send a "started" or "finished" event.
     *
     * @method _handleKeyPress
     * @private
     * @param  {KeyboardEvent} evt
     */

  }, {
    key: '_handleKeyPress',
    value: function _handleKeyPress(evt) {
      var _this = this;

      if (this.lastKeyId) window.clearTimeout(this.lastKeyId);
      this.lastKeyId = window.setTimeout(function () {
        _this.lastKeyId = 0;
        var isEmpty = !_this.input.value;
        _this.send(isEmpty ? _typingIndicators.FINISHED : _typingIndicators.STARTED);
      }, 50);
    }

    /**
     * Handles keyboard keys not reported by on by keypress events.
     *
     * These keys can be detected with keyDown event handlers. The ones
     * currently handled here are backspace, delete and enter.
     * We may add more later.
     *
     * @method _handleKeyDown
     * @private
     * @param  {KeyboardEvent} evt
     */

  }, {
    key: '_handleKeyDown',
    value: function _handleKeyDown(evt) {
      if ([8, 46, 13].indexOf(evt.keyCode) !== -1) this._handleKeyPress();
    }

    /**
     * Send the state to the publisher.
     *
     * If your application requires
     * you to directly control the state, you can call this method;
     * however, as long as you use this TypingListener, keyboard
     * events will overwrite any state changes you send.
     *
     * Common use case for this: After a message is sent, you want to clear any typing indicators:
     *
     *      function send() {
     *        message.send();
     *        typingIndicators.send(Layer.Core.TypingIndicators.FINISHED);
     *      }
     *
     * @method send
     * @param  {string} state - One of "started", "paused", "finished"
     */

  }, {
    key: 'send',
    value: function send(state) {
      this.publisher.setState(state);
    }
  }]);

  return TypingListener;
}();

module.exports = _namespace2.default.TypingIndicators.TypingListener = TypingListener;