/**
 * The TypingPublisher's job is:
 *
 *  1. Send state changes to the server
 *  2. Insure that the server is not flooded with repeated state changes of the same value
 *  3. Automatically transition states when no new states or old states are requested.
 *
 * Who is the Typing Publisher for?  Its used by the Layer.Core.TypingIndicators.TypingListener; if your using
 * the TypingListener, you don't need this.  If you want to provide your own logic for when to send typing
 * states, then you need the TypingPublisher.
 *
 * Create an instance using:
 *
 *        var publisher = client.createTypingPublisher();
 *
 * To tell the Publisher which Conversation its reporting activity on, use:
 *
 *        publisher.setConversation(mySelectedConversation);
 *
 * To then use the instance:
 *
 *        publisher.setState(Layer.Core.TypingIndicators.STARTED);
 *        publisher.setState(Layer.Core.TypingIndicators.PAUSED);
 *        publisher.setState(Layer.Core.TypingIndicators.FINISHED);
 *
 * Note that the `STARTED` state only lasts for 2.5 seconds, so you
 * must repeatedly call setState for as long as this state should continue.
 * This is typically done by simply calling `setState(STARTED)` every time a user hits
 * a key.
 *
 * A few rules for how the *publisher* works internally:
 *
 *  - it maintains an indicator state for the current conversation
 *  - if app calls  `setState(Layer.Core.TypingIndicators.STARTED);` publisher sends the event immediately
 *  - if app calls the same method under _2.5 seconds_ with the same typing indicator state (`started`), publisher waits
 *    for those 2.5 seconds to pass and then publishes the ephemeral event
 *  - if app calls the same methods multiple times within _2.5 seconds_ with the same value,
 *    publisher waits until end of 2.5 second period and sends the state only once.
 *  - if app calls the same method under _2.5 seconds_ with a different typing indicator state (say `paused`),
 *    publisher immediately sends the event
 *  - if 2.5 seconds passes without any events, state transitions from 'started' to 'paused'
 *  - if 2.5 seconds passes without any events, state transitions from 'paused' to 'finished'
 *
 * @class Layer.Core.TypingIndicators.TypingPublisher
 * @protected
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); 


var _settings = require('../../settings');

var _namespace = require('../namespace');

var _namespace2 = _interopRequireDefault(_namespace);

var _typingIndicators = require('./typing-indicators');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var INTERVAL = 2500;

var TypingPublisher = function () {

  /**
   * Create a Typing Publisher.  See Layer.Core.Client.createTypingPublisher.
   *
   * The TypingPublisher needs
   * to know what Conversation its publishing changes for...
   * but it does not require that parameter during initialization.
   *
   * @method constructor
   * @param {Object} args
   * @param {Object} [conversation=null] - The Conversation Object or Instance that messages are being typed to.
   */
  function TypingPublisher(args) {
    _classCallCheck(this, TypingPublisher);

    if (args.conversation) this.conversation = _settings.client.getObject(args.conversation.id);
    this.state = _typingIndicators.FINISHED;
    this._lastMessageTime = 0;
  }

  /**
   * Set which Conversation we are reporting on state changes for.
   *
   * If this instance managed a previous Conversation,
   * its state is immediately transitioned to "finished".
   *
   * @method setConversation
   * @param  {Object} conv - Conversation Object or Instance
   */


  _createClass(TypingPublisher, [{
    key: 'setConversation',
    value: function setConversation(conv) {
      this.setState(_typingIndicators.FINISHED);
      this.conversation = conv ? _settings.client.getObject(conv.id) : null;
      this.state = _typingIndicators.FINISHED;
    }

    /**
     * Sets the state and either sends the state to the server or schedules it to be sent.
     *
     * @method setState
     * @param  {string} state - One of
     * * Layer.Core.TypingIndicators.STARTED
     * * Layer.Core.TypingIndicators.PAUSED
     * * Layer.Core.TypingIndicators.FINISHED
     */

  }, {
    key: 'setState',
    value: function setState(state) {
      // We have a fresh state; whatever our pauseLoop was doing
      // can be canceled... and restarted later.
      if (this._pauseLoopId) {
        clearInterval(this._pauseLoopId);
        this._pauseLoopId = 0;
      }
      if (!this.conversation) return;

      // If its a new state, send it immediately.
      if (this.state !== state) {
        this.state = state;
        this._send(state);
      }

      // No need to resend 'finished' state
      else if (state === _typingIndicators.FINISHED) {
          return;
        }

        // If its an existing state that hasn't been sent in the
        // last 2.5 seconds, send it immediately.
        else if (Date.now() > this._lastMessageTime + INTERVAL) {
            this._send(state);
          }

          // Else schedule it to be sent.
          else {
              this._scheduleNextMessage(state);
            }

      // Start test to automatically transition if 2.5 seconds without any setState calls
      if (this.state !== _typingIndicators.FINISHED) this._startPauseLoop();
    }

    /**
     * Start loop to automatically change to next state.
     *
     * Any time we are set to 'started' or 'paused' we should transition
     * to the next state after 2.5 seconds of no setState calls.
     *
     * The 2.5 second setTimeout is canceled/restarted every call to setState()
     *
     * @method _startPauseLoop
     * @private
     */

  }, {
    key: '_startPauseLoop',
    value: function _startPauseLoop() {
      var _this = this;

      if (this._pauseLoopId) return;

      // Note that this interval is canceled every call to setState.
      this._pauseLoopId = window.setInterval(function () {
        if (_this.state === _typingIndicators.PAUSED) {
          _this.setState(_typingIndicators.FINISHED);
        } else if (_this.state === _typingIndicators.STARTED) {
          _this.setState(_typingIndicators.PAUSED);
        }
      }, INTERVAL);
    }

    /**
     * Schedule the next state refresh message.
     *
     * It should be at least INTERVAL ms after
     * the last state message of the same state
     *
     * @method _scheduleNextMessage
     * @private
     * @param  {string} state - One of
     * * Layer.Core.TypingIndicators.STARTED
     * * Layer.Core.TypingIndicators.PAUSED
     * * Layer.Core.TypingIndicators.FINISHED
     */

  }, {
    key: '_scheduleNextMessage',
    value: function _scheduleNextMessage(state) {
      var _this2 = this;

      if (this._scheduleId) clearTimeout(this._scheduleId);
      var delay = INTERVAL - Math.min(Date.now() - this._lastMessageTime, INTERVAL);
      this._scheduleId = setTimeout(function () {
        _this2._scheduleId = 0;
        // If the state didn't change while waiting...
        if (_this2.state === state) _this2._send(state);
      }, delay);
    }

    /**
     * Send a state change to the server.
     *
     * @method send
     * @private
     * @param  {string} state - One of
     * * Layer.Core.TypingIndicators.STARTED
     * * Layer.Core.TypingIndicators.PAUSED
     * * Layer.Core.TypingIndicators.FINISHED
     */

  }, {
    key: '_send',
    value: function _send(state) {
      if (!this.conversation.isSaved()) return;
      this._lastMessageTime = Date.now();
      var ws = _settings.client.socketManager;
      ws.sendSignal({
        type: 'typing_indicator',
        object: {
          id: this.conversation.id
        },
        data: {
          action: state
        }
      });
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      delete this.conversation;
      this.isDestroyed = true;
      clearTimeout(this._scheduleId);
      clearInterval(this._pauseLoopId);
    }
  }]);

  return TypingPublisher;
}();

module.exports = _namespace2.default.TypingIndicators.TypingPublisher = TypingPublisher;