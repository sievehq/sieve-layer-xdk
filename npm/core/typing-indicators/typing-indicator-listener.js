/**
 * The TypingIndicatorListener receives Typing Indicator state
 * for other users via a websocket, and notifies
 * the client of the updated state.  Typical applications
 * do not access this component directly, but DO subscribe
 * to events produced by this component:
 *
 *      client.on('typing-indicator-change', function(evt) {
 *        if (evt.conversationId == conversationICareAbout) {
 *          console.log('The following users are typing: ' + evt.typing.join(', '));
 *          console.log('The following users are paused: ' + evt.paused.join(', '));
 *        }
 *      });
 *
 * @class Layer.Core.TypingIndicators.TypingIndicatorListener
 * @extends {Layer.Core.Root}
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _namespace = require('../namespace');

var _namespace2 = _interopRequireDefault(_namespace);

var _root = require('../root');

var _root2 = _interopRequireDefault(_root);

var _settings = require('../../settings');

var _typingIndicators = require('./typing-indicators');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } 


var TypingIndicatorListener = function (_Root) {
  _inherits(TypingIndicatorListener, _Root);

  /**
   * Creates a Typing Indicator Listener for this Client.
   *
   * @method constructor
   * @protected
   * @param  {Object} args
   */
  function TypingIndicatorListener(args) {
    _classCallCheck(this, TypingIndicatorListener);

    /**
     * Stores the state of all Conversations, indicating who is typing and who is paused.
     *
     * People who are stopped are removed from this state.
     * @property {Object} state
     */
    var _this = _possibleConstructorReturn(this, (TypingIndicatorListener.__proto__ || Object.getPrototypeOf(TypingIndicatorListener)).call(this, args));

    _this.state = {};
    _this._pollId = 0;
    _settings.client.on('ready', function () {
      return _this._clientReady();
    });
    return _this;
  }

  /**
   * Called when the client is ready
   *
   * @method _clientReady
   * @private
   */


  _createClass(TypingIndicatorListener, [{
    key: '_clientReady',
    value: function _clientReady() {
      this.user = _settings.client.user;
      var ws = _settings.client.socketManager;
      ws.on('message', this._handleSocketEvent, this);
      this._startPolling();
    }

    /**
     * Determines if this event is relevant to report on.
     * Must be a typing indicator signal that is reporting on
     * someone other than this user.
     *
     * @method _isRelevantEvent
     * @private
     * @param  {Object}  Websocket event data
     * @return {Boolean}
     */

  }, {
    key: '_isRelevantEvent',
    value: function _isRelevantEvent(evt) {
      return evt.type === 'signal' && evt.body.type === 'typing_indicator' && evt.body.data.sender.id !== this.user.id;
    }

    /**
     * This method receives websocket events and
     * if they are typing indicator events, updates its state.
     *
     * @method _handleSocketEvent
     * @private
     * @param {Layer.Core.LayerEvent} evtIn - All websocket events
     */

  }, {
    key: '_handleSocketEvent',
    value: function _handleSocketEvent(evtIn) {
      var evt = evtIn.data;

      if (this._isRelevantEvent(evt)) {
        // Could just do _createObject() but for ephemeral events, going through _createObject and updating
        // objects for every typing indicator seems a bit much.  Try getIdentity and only create if needed.
        var identity = _settings.client.getIdentity(evt.body.data.sender.id) || _settings.client._createObject(evt.body.data.sender);
        var state = evt.body.data.action;
        var conversationId = evt.body.object.id;
        var stateEntry = this.state[conversationId];
        if (!stateEntry) {
          stateEntry = this.state[conversationId] = {
            users: {},
            typing: [],
            paused: []
          };
        }
        stateEntry.users[identity.id] = {
          startTime: Date.now(),
          state: state,
          identity: identity
        };
        if (stateEntry.users[identity.id].state === _typingIndicators.FINISHED) {
          delete stateEntry.users[identity.id];
        }

        this._updateState(stateEntry, state, identity.id);

        this.trigger('typing-indicator-change', {
          conversationId: conversationId,
          typing: stateEntry.typing.map(function (id) {
            return stateEntry.users[id].identity.toObject();
          }),
          paused: stateEntry.paused.map(function (id) {
            return stateEntry.users[id].identity.toObject();
          })
        });
      }
    }

    /**
     * Get the current typing indicator state of a specified Conversation.
     *
     * Typically used to see if anyone is currently typing when first opening a Conversation.
     * Typically accessed via `client.getTypingState(conversationId)`
     *
     * @method getState
     * @param {String} conversationId
     */

  }, {
    key: 'getState',
    value: function getState(conversationId) {
      var stateEntry = this.state[conversationId];
      if (stateEntry) {
        return {
          typing: stateEntry.typing.map(function (id) {
            return stateEntry.users[id].identity.toObject();
          }),
          paused: stateEntry.paused.map(function (id) {
            return stateEntry.users[id].identity.toObject();
          })
        };
      } else {
        return {
          typing: [],
          paused: []
        };
      }
    }

    /**
     * Updates the state of a single stateEntry; a stateEntry
     * represents a single Conversation's typing indicator data.
     *
     * Updates typing and paused arrays following immutable strategies
     * in hope that this will help Flex based architectures.
     *
     * @method _updateState
     * @private
     * @param  {Object} stateEntry - A Conversation's typing indicator state
     * @param  {string} newState   - started, paused or finished
     * @param  {string} identityId     - ID of the user whose state has changed
     */

  }, {
    key: '_updateState',
    value: function _updateState(stateEntry, newState, identityId) {
      var typingIndex = stateEntry.typing.indexOf(identityId);
      if (newState !== _typingIndicators.STARTED && typingIndex !== -1) {
        stateEntry.typing = [].concat(_toConsumableArray(stateEntry.typing.slice(0, typingIndex)), _toConsumableArray(stateEntry.typing.slice(typingIndex + 1)));
      }
      var pausedIndex = stateEntry.paused.indexOf(identityId);
      if (newState !== _typingIndicators.PAUSED && pausedIndex !== -1) {
        stateEntry.paused = [].concat(_toConsumableArray(stateEntry.paused.slice(0, pausedIndex)), _toConsumableArray(stateEntry.paused.slice(pausedIndex + 1)));
      }

      if (newState === _typingIndicators.STARTED && typingIndex === -1) {
        stateEntry.typing = [].concat(_toConsumableArray(stateEntry.typing), [identityId]);
      } else if (newState === _typingIndicators.PAUSED && pausedIndex === -1) {
        stateEntry.paused = [].concat(_toConsumableArray(stateEntry.paused), [identityId]);
      }
    }

    /**
     * Any time a state change becomes more than 6 seconds stale,
     * assume that the user is 'finished'.
     *
     * In theory, we should
     * receive a new event every 2.5 seconds.  If the current user
     * has gone offline, lack of this code would cause the people
     * currently flagged as typing as still typing hours from now.
     *
     * For this first pass, we just mark the user as 'finished'
     * but a future pass may move from 'started' to 'paused'
     * and 'paused to 'finished'
     *
     * @method _startPolling
     * @private
     */

  }, {
    key: '_startPolling',
    value: function _startPolling() {
      var _this2 = this;

      if (this._pollId) return;
      this._pollId = setInterval(function () {
        return _this2._poll();
      }, 5000);
    }
  }, {
    key: '_poll',
    value: function _poll() {
      var _this3 = this;

      var conversationIds = Object.keys(this.state);

      conversationIds.forEach(function (id) {
        var state = _this3.state[id];
        Object.keys(state.users).forEach(function (identityId) {
          if (Date.now() >= state.users[identityId].startTime + 6000) {
            _this3._updateState(state, _typingIndicators.FINISHED, identityId);
            delete state.users[identityId];
            _this3.trigger('typing-indicator-change', {
              conversationId: id,
              typing: state.typing.map(function (aIdentityId) {
                return state.users[aIdentityId].identity.toObject();
              }),
              paused: state.paused.map(function (aIdentityId) {
                return state.users[aIdentityId].identity.toObject();
              })
            });
          }
        });
      });
    }
  }, {
    key: '_getBubbleEventsTo',
    value: function _getBubbleEventsTo() {
      return _settings.client;
    }
  }]);

  return TypingIndicatorListener;
}(_root2.default);

/**
 * setTimeout ID for polling for states to transition
 * @property {Number}
 * @private
 */


TypingIndicatorListener.prototype._pollId = 0;

TypingIndicatorListener._supportedEvents = [
/**
 * There has been a change in typing indicator state of other users.
 * @event change
 * @param {Layer.Core.LayerEvent} evt
 * @param {Layer.Core.Identity[]} evt.typing - Array of Identities of people who are typing
 * @param {Layer.Core.Identity[]} evt.paused - Array of Identities of people who are paused
 * @param {string} evt.conversationId - ID of the Conversation that has changed typing indicator state
 */
'typing-indicator-change'].concat(_root2.default._supportedEvents);

_root2.default.initClass.apply(TypingIndicatorListener, [TypingIndicatorListener, 'TypingIndicatorListener', _namespace2.default.TypingIndicators]);
module.exports = TypingIndicatorListener;