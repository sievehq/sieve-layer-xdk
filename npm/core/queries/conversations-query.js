/**
 * Query class for running a Query on Conversations.
 *
 *
 *      var conversationsQuery = client.createQuery({
 *        model: Layer.Core.Query.Conversation,
 *        sortBy: [{'createdAt': 'desc'}]
 *      });
 *
 *
 * You can change the `paginationWindow` and `sortBy` properties at any time using:
 *
 *      query.update({
 *        paginationWindow: 200
 *      });
 *
 * You can release data held in memory by your queries when done with them:
 *
 *      query.destroy();
 *
 * #### sortBy
 *
 * Note that the `sortBy` property is only supported for Conversations at this time and only
 * supports "createdAt" and "lastMessage.sentAt" as sort fields, and only supports `desc` sort direction.
 *
 *      query.update({
 *        sortBy: [{'lastMessage.sentAt': 'desc'}]
 *      });
 *
 *
 * @class  Layer.Core.ConversationsQuery
 * @extends Layer.Core.Query
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _settings = require('../../settings');

var _namespace = require('../namespace');

var _namespace2 = _interopRequireDefault(_namespace);

var _root = require('../root');

var _root2 = _interopRequireDefault(_root);

var _utils = require('../../utils');

var _utils2 = _interopRequireDefault(_utils);

var _constants = require('../../constants');

var _query = require('./query');

var _query2 = _interopRequireDefault(_query);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } 


var ConversationsQuery = function (_Query) {
  _inherits(ConversationsQuery, _Query);

  function ConversationsQuery() {
    _classCallCheck(this, ConversationsQuery);

    return _possibleConstructorReturn(this, (ConversationsQuery.__proto__ || Object.getPrototypeOf(ConversationsQuery)).apply(this, arguments));
  }

  _createClass(ConversationsQuery, [{
    key: '_fetchData',
    value: function _fetchData(pageSize) {
      var _this2 = this;

      var sortBy = this._getSortField();

      if (_settings.client.dbManager) {
        _settings.client.dbManager.loadConversations(sortBy, this._nextDBFromId, pageSize, function (conversations) {
          if (conversations.length) _this2._appendResults({ data: conversations }, true);
        });
      }

      var newRequest = 'conversations?sort_by=' + sortBy + '&page_size=' + pageSize + (this._nextServerFromId ? '&from_id=' + this._nextServerFromId : '');

      if (newRequest !== this._firingRequest) {
        this.isFiring = true;
        this._firingRequest = newRequest;
        _settings.client.xhr({
          telemetry: {
            name: 'conversation_query_time'
          },
          url: this._firingRequest,
          method: 'GET',
          sync: false
        }, function (results) {
          return _this2._processRunResults(results, newRequest, pageSize);
        });
      }
    }
  }, {
    key: '_getSortField',
    value: function _getSortField() {
      if (this.sortBy && this.sortBy[0] && this.sortBy[0]['lastMessage.sentAt']) {
        return 'last_message';
      } else {
        return 'created_at';
      }
    }
  }, {
    key: '_getItem',
    value: function _getItem(id) {
      switch (_utils2.default.typeFromID(id)) {
        case 'messages':
          for (var index = 0; index < this.data.length; index++) {
            var conversation = this.data[index];
            if (conversation.lastMessage && conversation.lastMessage.id === id) return conversation.lastMessage;
          }
          return null;
        case 'conversations':
          return _get(ConversationsQuery.prototype.__proto__ || Object.getPrototypeOf(ConversationsQuery.prototype), '_getItem', this).call(this, id);
      }
    }
  }, {
    key: '_handleEvents',
    value: function _handleEvents(eventName, evt) {
      switch (eventName) {

        // If a Conversation's property has changed, and the Conversation is in this
        // Query's data, then update it.
        case 'conversations:change':
          this._handleChangeEvent('conversations', evt);
          break;

        // If a Conversation is added, and it isn't already in the Query,
        // add it and trigger an event
        case 'conversations:add':
          this._handleAddEvent('conversations', evt);
          break;

        // If a Conversation is deleted, and its still in our data,
        // remove it and trigger an event.
        case 'conversations:remove':
          this._handleRemoveEvent('conversations', evt);
          break;
      }
    }

    // TODO WEB-968: Refactor this into functions for instance, object, sortBy createdAt, sortBy lastMessage

  }, {
    key: '_handleChangeEvent',
    value: function _handleChangeEvent(name, evt) {
      var index = this._getIndex(evt.target.id);

      // If its an ID change (matching Distinct Conversation returned by server) make sure to update our data.
      // If dataType is an instance, its been updated for us.
      if (this.dataType === _query2.default.ObjectDataType) {
        var idChanges = evt.getChangesFor('id');
        if (idChanges.length) {
          index = this._getIndex(idChanges[0].oldValue);
        }
      }

      // If dataType is "object" then update the object and our array;
      // else the object is already updated.
      // Ignore results that aren't already in our data; Results are added via
      // conversations:add events.  Websocket Manager automatically loads anything that receives an event
      // for which we have no object, so we'll get the add event at that time.
      if (index !== -1) {
        var sortField = this._getSortField();
        // Do not reorder when lastMessage changes to null as we are just waiting for a new Last Message, and UI will be jerky.
        // If its the last message is deleted, and no more exist on server, well... just keep current sort order.
        var reorder = evt.hasProperty('lastMessage') && evt.target.lastMessage && sortField === 'last_message';
        var newIndex = void 0;

        if (this.dataType === _query2.default.ObjectDataType) {
          if (!reorder) {
            // Replace the changed Conversation with a new immutable object
            this.data = [].concat(_toConsumableArray(this.data.slice(0, index)), [evt.target.toObject()], _toConsumableArray(this.data.slice(index + 1)));
          } else {
            newIndex = this._getInsertIndex(evt.target, this.data);
            this.data.splice(index, 1);
            this.data.splice(newIndex, 0, this._getData(evt.target));
            this.data = this.data.concat([]);
          }
        }

        // Else dataType is instance not object
        else if (reorder) {
            newIndex = this._getInsertIndex(evt.target, this.data);
            if (newIndex !== index) {
              this.data.splice(index, 1);
              this.data.splice(newIndex, 0, evt.target);
            }
          }

        // Trigger a 'property' event
        this._triggerChange({
          type: 'property',
          target: this._getData(evt.target),
          query: this,
          isChange: true,
          changes: evt.changes
        });

        if (reorder && newIndex !== index) {
          this._triggerChange({
            type: 'move',
            target: this._getData(evt.target),
            query: this,
            isChange: false,
            fromIndex: index,
            toIndex: newIndex
          });
        }
      }
    }
  }, {
    key: '_getInsertIndex',
    value: function _getInsertIndex(conversation, data) {
      if (!conversation.isSaved()) return 0;
      var sortField = this._getSortField();
      var index = void 0;
      if (sortField === 'created_at') {
        for (index = 0; index < data.length; index++) {
          var item = data[index];
          if (item.syncState === _constants.SYNC_STATE.NEW || item.syncState === _constants.SYNC_STATE.SAVING) {
            // No-op do not insert server data before new and unsaved data
          } else if (conversation.createdAt >= item.createdAt) {
            break;
          }
        }
        return index;
      } else {
        var oldIndex = -1;
        var d1 = conversation.lastMessage ? conversation.lastMessage.sentAt : conversation.createdAt;
        for (index = 0; index < data.length; index++) {
          var _item = data[index];
          if (_item.id === conversation.id) {
            oldIndex = index;
          } else if (_item.syncState === _constants.SYNC_STATE.NEW || _item.syncState === _constants.SYNC_STATE.SAVING) {
            // No-op do not insert server data before new and unsaved data
          } else {
            var d2 = _item.lastMessage ? _item.lastMessage.sentAt : _item.createdAt;
            if (d1 >= d2) break;
          }
        }
        return oldIndex === -1 || oldIndex > index ? index : index - 1;
      }
    }
  }, {
    key: '_handleAddEvent',
    value: function _handleAddEvent(name, evt) {
      var _this3 = this;

      // Filter out any Conversations already in our data
      var list = evt[name].filter(function (conversation) {
        return _this3._getIndex(conversation.id) === -1;
      }).filter(function (obj) {
        return !_this3.filter || _this3.filter(obj);
      });

      if (list.length) {
        var data = this.data;

        // typically bulk inserts happen via _appendResults(); so this array typically iterates over an array of length 1
        list.forEach(function (conversation) {
          var newIndex = _this3._getInsertIndex(conversation, data);
          data.splice(newIndex, 0, _this3._getData(conversation));

          if (_this3.dataType === _query2.default.ObjectDataType) {
            _this3.data = [].concat(data);
          }
          _this3.totalSize += 1;

          var item = _this3._getData(conversation);
          _this3._triggerChange({
            type: 'insert',
            index: newIndex,
            target: item,
            query: _this3
          });
        });
      }
    }
  }, {
    key: '_handleRemoveEvent',
    value: function _handleRemoveEvent(name, evt) {
      var _this4 = this;

      var removed = [];
      evt[name].forEach(function (conversation) {
        var index = _this4._getIndex(conversation.id);
        if (index !== -1) {
          if (conversation.id === _this4._nextDBFromId) _this4._nextDBFromId = _this4._updateNextFromId(index);
          if (conversation.id === _this4._nextServerFromId) _this4._nextServerFromId = _this4._updateNextFromId(index);
          removed.push({
            data: conversation,
            index: index
          });
          if (_this4.dataType === _query2.default.ObjectDataType) {
            _this4.data = [].concat(_toConsumableArray(_this4.data.slice(0, index)), _toConsumableArray(_this4.data.slice(index + 1)));
          } else {
            _this4.data.splice(index, 1);
          }
        }
      });

      this.totalSize -= removed.length;
      removed.forEach(function (removedObj) {
        _this4._triggerChange({
          type: 'remove',
          index: removedObj.index,
          target: _this4._getData(removedObj.data),
          query: _this4
        });
      });
    }
  }]);

  return ConversationsQuery;
}(_query2.default);

ConversationsQuery._supportedEvents = [].concat(_query2.default._supportedEvents);

ConversationsQuery.MaxPageSize = 100;

ConversationsQuery.prototype.model = _query2.default.Conversation;

_root2.default.initClass.apply(ConversationsQuery, [ConversationsQuery, 'ConversationsQuery', _namespace2.default.Query]);

module.exports = ConversationsQuery;