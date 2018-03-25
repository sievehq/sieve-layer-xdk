/**
 * Query class for running a Query on Channels
 *
 *      var channelQuery = client.createQuery({
 *        model: Layer.Core.Query.Channel
 *      });
 *
 *
 * You can change the `paginationWindow` property at any time using:
 *
 *      query.update({
 *        paginationWindow: 200
 *      });
 *
 * You can release data held in memory by your queries when done with them:
 *
 *      query.destroy();
 *
 * @class  Layer.Core.ChannelsQuery
 * @extends Layer.Core.Query
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _settings = require('../../settings');

var _constants = require('../../constants');

var _namespace = require('../namespace');

var _namespace2 = _interopRequireDefault(_namespace);

var _root = require('../root');

var _root2 = _interopRequireDefault(_root);

var _query = require('./query');

var _query2 = _interopRequireDefault(_query);

var _conversationsQuery = require('./conversations-query');

var _conversationsQuery2 = _interopRequireDefault(_conversationsQuery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } 


var ChannelsQuery = function (_ConversationsQuery) {
  _inherits(ChannelsQuery, _ConversationsQuery);

  function ChannelsQuery() {
    _classCallCheck(this, ChannelsQuery);

    return _possibleConstructorReturn(this, (ChannelsQuery.__proto__ || Object.getPrototypeOf(ChannelsQuery)).apply(this, arguments));
  }

  _createClass(ChannelsQuery, [{
    key: '_fetchData',
    value: function _fetchData(pageSize) {
      var _this2 = this;

      if (_settings.client.dbManager) {
        _settings.client.dbManager.loadChannels(this._nextDBFromId, pageSize, function (channels) {
          if (channels.length) _this2._appendResults({ data: channels }, true);
        });
      }

      var newRequest = 'channels?page_size=' + pageSize + (this._nextServerFromId ? '&from_id=' + this._nextServerFromId : '');

      if (newRequest !== this._firingRequest) {
        this.isFiring = true;
        this._firingRequest = newRequest;
        _settings.client.xhr({
          telemetry: {
            name: 'channel_query_time'
          },
          url: this._firingRequest,
          method: 'GET',
          sync: false
        }, function (results) {
          return _this2._processRunResults(results, _this2._firingRequest, pageSize);
        });
      }
    }
  }, {
    key: '_getSortField',
    value: function _getSortField() {
      return 'created_at';
    }
  }, {
    key: '_getItem',
    value: function _getItem(id) {
      return _query2.default.prototype._getItem.apply(this, [id]);
    }
  }, {
    key: '_handleEvents',
    value: function _handleEvents(eventName, evt) {
      switch (eventName) {

        // If a Conversation's property has changed, and the Conversation is in this
        // Query's data, then update it.
        case 'channels:change':
          this._handleChangeEvent('channels', evt);
          break;

        // If a Conversation is added, and it isn't already in the Query,
        // add it and trigger an event
        case 'channels:add':
          this._handleAddEvent('channels', evt);
          break;

        // If a Conversation is deleted, and its still in our data,
        // remove it and trigger an event.
        case 'channels:remove':
          this._handleRemoveEvent('channels', evt);
          break;
      }
    }
  }, {
    key: '_getInsertIndex',
    value: function _getInsertIndex(channel, data) {
      if (!channel.isSaved()) return 0;
      var index = void 0;
      for (index = 0; index < data.length; index++) {
        var item = data[index];
        if (item.syncState === _constants.SYNC_STATE.NEW || item.syncState === _constants.SYNC_STATE.SAVING) {
          // No-op do not insert server data before new and unsaved data
        } else if (channel.createdAt >= item.createdAt) {
          break;
        }
      }
      return index;
    }
  }, {
    key: '_handleChangeEvent',
    value: function _handleChangeEvent(name, evt) {
      var index = this._getIndex(evt.target.id);

      // If its an ID change (matching named channel returned by server) make sure to update our data.
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
      // channels:add events.  Websocket Manager automatically loads anything that receives an event
      // for which we have no object, so we'll get the add event at that time.
      if (index !== -1) {
        var sortField = this._getSortField();
        var reorder = evt.hasProperty('lastMessage') && sortField === 'last_message';
        var newIndex = void 0;

        if (this.dataType === _query2.default.ObjectDataType) {
          if (!reorder) {
            // Replace the changed Channel with a new immutable object
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
    key: '_handleAddEvent',
    value: function _handleAddEvent(name, evt) {
      var _this3 = this;

      // Filter out any Channels already in our data
      var list = evt[name].filter(function (channel) {
        return _this3._getIndex(channel.id) === -1;
      }).filter(function (obj) {
        return !_this3.filter || _this3.filter(obj);
      });

      if (list.length) {
        var data = this.data;

        // typically bulk inserts happen via _appendResults(); so this array typically iterates over an array of length 1
        list.forEach(function (channel) {
          var newIndex = _this3._getInsertIndex(channel, data);
          data.splice(newIndex, 0, _this3._getData(channel));

          // Typically this loop only iterates once; but each iteration is gaurenteed a unique object if needed
          if (_this3.dataType === _query2.default.ObjectDataType) {
            _this3.data = [].concat(data);
          }
          _this3.totalSize += 1;

          var item = _this3._getData(channel);
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
      evt[name].forEach(function (channel) {
        var index = _this4._getIndex(channel.id);
        if (index !== -1) {
          if (channel.id === _this4._nextDBFromId) _this4._nextDBFromId = _this4._updateNextFromId(index);
          if (channel.id === _this4._nextServerFromId) _this4._nextServerFromId = _this4._updateNextFromId(index);
          removed.push({
            data: channel,
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

  return ChannelsQuery;
}(_conversationsQuery2.default);

ChannelsQuery._supportedEvents = [].concat(_conversationsQuery2.default._supportedEvents);

ChannelsQuery.MaxPageSize = 100;

ChannelsQuery.prototype.model = _query2.default.Channel;

_root2.default.initClass.apply(ChannelsQuery, [ChannelsQuery, 'ChannelsQuery', _namespace2.default.Query]);

module.exports = ChannelsQuery;