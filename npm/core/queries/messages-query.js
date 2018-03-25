/**
 * Query class for running a Query on Messages
 *
 *      var messageQuery = client.createQuery({
 *        model: Layer.Core.Query.Message,
 *        predicate: 'conversation.id = "layer:///conversations/UUID"'
 *      });
 *
 * You can change the data selected by your query any time you want using:
 *
 *      query.update({
 *        predicate: 'channel.id = "layer:///channels/UUID2"'
 *      });
 *
 * You can release data held in memory by your queries when done with them:
 *
 *      query.destroy();
 *
 * #### predicate
 *
 * Note that the `predicate` property is only supported for Messages and Layer.Core.Membership, and only supports
 * querying by Conversation or Channel:
 *
 * * `conversation.id = 'layer:///conversations/UUIUD'`
 * * `channel.id = 'layer:///channels/UUIUD'`
 *
 * @class  Layer.Core.MessagesQuery
 * @extends Layer.Core.Query
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _settings = require('../../settings');

var _namespace = require('../namespace');

var _namespace2 = _interopRequireDefault(_namespace);

var _root = require('../root');

var _root2 = _interopRequireDefault(_root);

var _layerError = require('../layer-error');

var _utils = require('../../utils');

var _utils2 = _interopRequireDefault(_utils);

var _query = require('./query');

var _query2 = _interopRequireDefault(_query);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } 


var findConvIdRegex = new RegExp(/^conversation.id\s*=\s*['"]((layer:\/\/\/conversations\/)?.{8}-.{4}-.{4}-.{4}-.{12})['"]$/);
var findChannelIdRegex = new RegExp(/^channel.id\s*=\s*['"]((layer:\/\/\/channels\/)?.{8}-.{4}-.{4}-.{4}-.{12})['"]$/);

var MessagesQuery = function (_Query) {
  _inherits(MessagesQuery, _Query);

  function MessagesQuery() {
    _classCallCheck(this, MessagesQuery);

    return _possibleConstructorReturn(this, (MessagesQuery.__proto__ || Object.getPrototypeOf(MessagesQuery)).apply(this, arguments));
  }

  _createClass(MessagesQuery, [{
    key: '_fixPredicate',
    value: function _fixPredicate(inValue) {
      if (inValue === '') return '';
      if (inValue.indexOf('conversation.id') !== -1) {
        var conversationId = inValue.match(findConvIdRegex) ? inValue.replace(findConvIdRegex, '$1') : null;
        if (!conversationId) throw new Error(_layerError.ErrorDictionary.invalidPredicate);
        if (conversationId.indexOf('layer:///conversations/') !== 0) conversationId = 'layer:///conversations/' + conversationId;
        return 'conversation.id = \'' + conversationId + '\'';
      } else if (inValue.indexOf('channel.id') !== -1) {
        var channelId = inValue.match(findChannelIdRegex) ? inValue.replace(findChannelIdRegex, '$1') : null;
        if (!channelId) throw new Error(_layerError.ErrorDictionary.invalidPredicate);
        if (channelId.indexOf('layer:///channels/') !== 0) channelId = 'layer:///channels/' + channelId;
        return 'channel.id = \'' + channelId + '\'';
      } else {
        throw new Error(_layerError.ErrorDictionary.invalidPredicate);
      }
    }
  }, {
    key: '_fetchData',
    value: function _fetchData(pageSize) {
      var predicateIds = this._getConversationPredicateIds();

      // Do nothing if we don't have a conversation to query on
      if (!predicateIds) {
        if (this.predicate && !this.predicate.match(/['"]/)) {
          _utils.logger.error('This query may need to quote its value');
        }
        return;
      }

      switch (predicateIds.type) {
        case _query2.default.Conversation:
          this._fetchConversationMessages(pageSize, predicateIds);
          break;
        case _query2.default.Channel:
          this._fetchChannelMessages(pageSize, predicateIds);
          break;
      }
    }
  }, {
    key: '_getSortField',
    value: function _getSortField() {
      return 'position';
    }

    /**
     * Get the Conversation UUID from the predicate property.
     *
     * Extract the Conversation's UUID from the predicate... or returned the cached value.
     *
     * @method _getConversationPredicateIds
     * @private
     */

  }, {
    key: '_getConversationPredicateIds',
    value: function _getConversationPredicateIds() {
      if (this.predicate.indexOf('conversation.id') !== -1) {
        if (this.predicate.match(findConvIdRegex)) {
          var conversationId = this.predicate.replace(findConvIdRegex, '$1');

          // We will already have a this._predicate if we are paging; else we need to extract the UUID from
          // the conversationId.
          var uuid = (this._predicate || conversationId).replace(/^layer:\/\/\/conversations\//, '');
          if (uuid) {
            return {
              uuid: uuid,
              id: conversationId,
              type: _query2.default.Conversation
            };
          }
        }
      } else if (this.predicate.indexOf('channel.id') !== -1) {
        if (this.predicate.match(findChannelIdRegex)) {
          var channelId = this.predicate.replace(findChannelIdRegex, '$1');

          // We will already have a this._predicate if we are paging; else we need to extract the UUID from
          // the channelId.
          var _uuid = (this._predicate || channelId).replace(/^layer:\/\/\/channels\//, '');
          if (_uuid) {
            return {
              uuid: _uuid,
              id: channelId,
              type: _query2.default.Channel
            };
          }
        }
      }
    }
  }, {
    key: '_fetchConversationMessages',
    value: function _fetchConversationMessages(pageSize, predicateIds) {
      var _this2 = this;

      var conversationId = 'layer:///conversations/' + predicateIds.uuid;
      if (!this._predicate) this._predicate = predicateIds.id;
      var conversation = _settings.client.getConversation(conversationId);

      // Retrieve data from db cache in parallel with loading data from server
      if (_settings.client.dbManager) {
        _settings.client.dbManager.loadMessages(conversationId, this._nextDBFromId, pageSize, function (messages) {
          if (messages.length) _this2._appendResults({ data: messages }, true);
        });
      }

      var newRequest = 'conversations/' + predicateIds.uuid + '/messages?page_size=' + pageSize + (this._nextServerFromId ? '&from_id=' + this._nextServerFromId : '');

      // Don't query on unsaved conversations, nor repeat still firing queries
      // If we have a conversation ID but no conversation object, try the query anyways.
      if ((!conversation || conversation.isSaved()) && newRequest !== this._firingRequest) {
        this.isFiring = true;
        this._firingRequest = newRequest;
        _settings.client.xhr({
          telemetry: {
            name: 'message_query_time'
          },
          url: newRequest,
          method: 'GET',
          sync: false
        }, function (results) {
          return _this2._processRunResults(results, newRequest, pageSize);
        });
      }

      if (conversation && !conversation.isSaved()) {
        this.pagedToEnd = true;
      }

      // If there are no results, then its a new query; automatically populate it with the Conversation's lastMessage.
      if (this.data.length === 0) {
        if (conversation && conversation.lastMessage) {
          this.data = [this._getData(conversation.lastMessage)];
          // Trigger the change event
          this._triggerChange({
            type: 'data',
            data: [this._getData(conversation.lastMessage)],
            query: this,
            target: _settings.client
          });
        }
      }
    }
  }, {
    key: '_fetchChannelMessages',
    value: function _fetchChannelMessages(pageSize, predicateIds) {
      var _this3 = this;

      var channelId = 'layer:///channels/' + predicateIds.uuid;
      if (!this._predicate) this._predicate = predicateIds.id;
      var channel = _settings.client.getChannel(channelId);

      // Retrieve data from db cache in parallel with loading data from server
      if (_settings.client.dbManager) {
        _settings.client.dbManager.loadMessages(channelId, this._nextDBFromId, pageSize, function (messages) {
          if (messages.length) _this3._appendResults({ data: messages }, true);
        });
      }

      var newRequest = 'channels/' + predicateIds.uuid + '/messages?page_size=' + pageSize + (this._nextServerFromId ? '&from_id=' + this._nextServerFromId : '');

      // Don't query on unsaved channels, nor repeat still firing queries
      if ((!channel || channel.isSaved()) && newRequest !== this._firingRequest) {
        this.isFiring = true;
        this._firingRequest = newRequest;
        _settings.client.xhr({
          url: newRequest,
          method: 'GET',
          sync: false
        }, function (results) {
          return _this3._processRunResults(results, newRequest, pageSize);
        });
      }

      if (channel && !channel.isSaved()) {
        this.pagedToEnd = true;
      }
    }

    // TODO: Is this as efficient as it could be? Should index start at the end of the list?

  }, {
    key: '_getInsertIndex',
    value: function _getInsertIndex(message, data) {
      var index = void 0;
      for (index = 0; index < data.length; index++) {
        if (message.position > data[index].position) {
          break;
        }
      }
      return index;
    }
  }, {
    key: '_handleEvents',
    value: function _handleEvents(eventName, evt) {
      switch (eventName) {

        // If a Conversation's ID has changed, check our predicate, and update it automatically if needed.
        case 'conversations:change':
          this._handleConvIdChangeEvent(evt);
          break;

        // If a Message has changed and its in our result set, replace
        // it with a new immutable object
        case 'messages:change':
        case 'messages:read':
          this._handleChangeEvent('messages', evt);
          break;

        // If Messages are added, and they aren't already in our result set
        // add them.
        case 'messages:add':
          this._handleAddEvent('messages', evt);
          break;

        // If a Message is deleted and its in our result set, remove it
        // and trigger an event
        case 'messages:remove':
          this._handleRemoveEvent('messages', evt);
          break;
      }
    }

    /**
     * A Conversation or Channel ID changes if a matching Distinct Conversation or named Channel was found on the server.
     *
     * If this Query's Conversation's ID has changed, update the predicate.
     *
     * @method _handleConvIdChangeEvent
     * @param {Layer.Core.LayerEvent} evt - A Message Change Event
     * @private
     */

  }, {
    key: '_handleConvIdChangeEvent',
    value: function _handleConvIdChangeEvent(evt) {
      var cidChanges = evt.getChangesFor('id');
      if (cidChanges.length) {
        if (this._predicate === cidChanges[0].oldValue) {
          this._predicate = cidChanges[0].newValue;
          this.predicate = "conversation.id = '" + this._predicate + "'";
          this._run();
        }
      }
    }

    /**
     * If the ID of the message has changed, then the position property has likely changed as well.
     *
     * This method tests to see if changes to the position property have impacted the message's position in the
     * data array... and updates the array if it has.
     *
     * @method _handlePositionChange
     * @private
     * @param {Layer.Core.LayerEvent} evt  A Message Change event
     * @param {number} index  Index of the message in the current data array
     * @return {boolean} True if a data was changed and a change event was emitted
     */

  }, {
    key: '_handlePositionChange',
    value: function _handlePositionChange(evt, index) {
      // If the message is not in the current data, then there is no change to our query results.
      if (index === -1) return false;

      // Create an array without our data item and then find out where the data item Should be inserted.
      // Note: we could just lookup the position in our current data array, but its too easy to introduce
      // errors where comparing this message to itself may yield index or index + 1.
      var newData = [].concat(_toConsumableArray(this.data.slice(0, index)), _toConsumableArray(this.data.slice(index + 1)));
      var newIndex = this._getInsertIndex(evt.target, newData);

      // If the data item goes in the same index as before, then there is no change to be handled here;
      // else insert the item at the right index, update this.data and fire a change event
      if (newIndex !== index) {
        newData.splice(newIndex, 0, this._getData(evt.target));
        this.data = newData;
        this._triggerChange({
          type: 'property',
          target: this._getData(evt.target),
          query: this,
          isChange: true,
          changes: evt.changes
        });
        return true;
      }
      return false;
    }
  }, {
    key: '_handleChangeEvent',
    value: function _handleChangeEvent(name, evt) {
      var index = this._getIndex(evt.target.id);
      var positionChanges = evt.getChangesFor('position');

      // If there are position changes, handle them.  If all the changes are position changes,
      // exit when done.
      if (positionChanges.length) {
        if (this._handlePositionChange(evt, index)) {
          if (positionChanges.length === evt.changes.length) return;
          index = this._getIndex(evt.target.id); // Get the updated position
        }
      }

      if (index !== -1) {
        if (this.dataType === _query2.default.ObjectDataType) {
          this.data = [].concat(_toConsumableArray(this.data.slice(0, index)), [evt.target.toObject()], _toConsumableArray(this.data.slice(index + 1)));
        }
        this._triggerChange({
          type: 'property',
          target: this._getData(evt.target),
          query: this,
          isChange: true,
          changes: evt.changes
        });
      }
    }

    /*
     * Note: Earlier versions of this iterated over each item, inserted it and when all items were inserted,
     * triggered events indicating the index at which they were inserted.
     *
     * This caused the following problem:
     *
     * 1. Insert messages newest message at position 0 and second newest message at position 1
     * 2. Trigger events in the order they arrive: second newest gets inserted at index 1, newest gets inserted at index 0
     * 3. UI on receiving the second newest event does yet have the newest event, and on inserting it at position 1
     *    is actually inserting it at the wrong place because position 0 is occupied by an older message at this time.
     *
     * Solution: We must iterate over all items, and process them entirely one at a time.
     * Drawback: After an Event.replay we may get a lot of add events, we may need a way to do an event that inserts a set of messages
     * instead of triggering lots of individual rendering-causing events
     */

  }, {
    key: '_handleAddEvent',
    value: function _handleAddEvent(name, evt) {
      var _this4 = this;

      // Only use added messages that are part of this Conversation
      // and not already in our result set
      var list = evt[name]
      // Filter so that we only see Messages if doing a Messages query or Announcements if doing an Announcements Query.
      .filter(function (message) {
        var type = _utils2.default.typeFromID(message.id);
        return type === 'messages' && _this4.model === _query2.default.Message || type === 'announcements' && _this4.model === _query2.default.Announcement;
      })
      // Filter out Messages that aren't part of this Conversation
      .filter(function (message) {
        var type = _utils2.default.typeFromID(message.id);
        return type === 'announcements' || message.conversationId === _this4._predicate;
      })
      // Filter out Messages that are already in our data set
      .filter(function (message) {
        return _this4._getIndex(message.id) === -1;
      }).map(function (message) {
        return _this4._getData(message);
      }).filter(function (message) {
        return !_this4.filter || _this4.filter(message);
      });

      // Add them to our result set and trigger an event for each one
      if (list.length) {
        var data = this.data = this.dataType === _query2.default.ObjectDataType ? [].concat(this.data) : this.data;
        list.forEach(function (item) {
          var index = _this4._getInsertIndex(item, data);
          data.splice(index, 0, item);
          if (index !== 0) {
            _utils.logger.warn('Index of ' + item.id + ' is ' + index + '; position is ' + item.position + '; compared to ' + data[0].position);
          }

          _this4.totalSize += 1;

          _this4._triggerChange({
            type: 'insert',
            target: item,
            query: _this4,
            index: index
          });
        });
      }
    }
  }, {
    key: '_handleRemoveEvent',
    value: function _handleRemoveEvent(name, evt) {
      var _this5 = this;

      var removed = [];
      evt[name].forEach(function (message) {
        var index = _this5._getIndex(message.id);
        if (index !== -1) {
          if (message.id === _this5._nextDBFromId) _this5._nextDBFromId = _this5._updateNextFromId(index);
          if (message.id === _this5._nextServerFromId) _this5._nextServerFromId = _this5._updateNextFromId(index);
          removed.push({
            data: message,
            index: index
          });
          if (_this5.dataType === _query2.default.ObjectDataType) {
            _this5.data = [].concat(_toConsumableArray(_this5.data.slice(0, index)), _toConsumableArray(_this5.data.slice(index + 1)));
          } else {
            _this5.data.splice(index, 1);
          }
        }
      });

      this.totalSize -= removed.length;
      removed.forEach(function (removedObj) {
        _this5._triggerChange({
          type: 'remove',
          target: _this5._getData(removedObj.data),
          index: removedObj.index,
          query: _this5
        });
      });
    }
  }]);

  return MessagesQuery;
}(_query2.default);

MessagesQuery._supportedEvents = [].concat(_query2.default._supportedEvents);

MessagesQuery.MaxPageSize = 100;

MessagesQuery.prototype.model = _query2.default.Message;

_root2.default.initClass.apply(MessagesQuery, [MessagesQuery, 'MessagesQuery', _namespace2.default.Query]);

module.exports = MessagesQuery;