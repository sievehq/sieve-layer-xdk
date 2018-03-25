/**
 * Query class for running a Query on Channel Members
 *
 *      var membersQuery = client.createQuery({
 *        model: Layer.Core.Query.Membership,
 *        predicate: 'channel.id = "layer:///channels/UUID"'
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
 * Note that the `predicate` property is only supported for Messages and Membership, and only supports
 * querying by Channel.
 *
 * @class  Layer.Core.MembersQuery
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

var _query = require('./query');

var _query2 = _interopRequireDefault(_query);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } 


var findChannelIdRegex = new RegExp(/^channel.id\s*=\s*['"]((layer:\/\/\/channels\/)?.{8}-.{4}-.{4}-.{4}-.{12})['"]$/);

var MembersQuery = function (_Query) {
  _inherits(MembersQuery, _Query);

  function MembersQuery() {
    _classCallCheck(this, MembersQuery);

    return _possibleConstructorReturn(this, (MembersQuery.__proto__ || Object.getPrototypeOf(MembersQuery)).apply(this, arguments));
  }

  _createClass(MembersQuery, [{
    key: '_fixPredicate',
    value: function _fixPredicate(inValue) {
      if (inValue === '') return '';
      if (inValue.indexOf('channel.id') !== -1) {
        var channelId = inValue.match(findChannelIdRegex) ? inValue.replace(findChannelIdRegex, '$1') : null;
        if (!channelId) throw new Error(_layerError.ErrorDictionary.invalidPredicate);
        if (channelId.indexOf('layer:///channels/') !== 0) channelId = 'layer:///channels/' + channelId;
        return 'channel.id = \'' + channelId + '\'';
      } else {
        throw new Error(_layerError.ErrorDictionary.invalidPredicate);
      }
    }

    /**
     * Get the Channel UUID from the predicate property.
     *
     * Extract the Channel's UUID from the predicate... or returned the cached value.
     *
     * @method _getChannelPredicateIds
     * @private
     */

  }, {
    key: '_getChannelPredicateIds',
    value: function _getChannelPredicateIds() {
      if (this.predicate.match(findChannelIdRegex)) {
        var channelId = this.predicate.replace(findChannelIdRegex, '$1');

        // We will already have a this._predicate if we are paging; else we need to extract the UUID from
        // the channelId.
        var uuid = (this._predicate || channelId).replace(/^layer:\/\/\/channels\//, '');
        if (uuid) {
          return {
            uuid: uuid,
            id: channelId,
            type: _query2.default.Channel
          };
        }
      }
    }
  }, {
    key: '_fetchData',
    value: function _fetchData(pageSize) {
      var _this2 = this;

      var predicateIds = this._getChannelPredicateIds();

      // Do nothing if we don't have a conversation to query on
      if (!predicateIds) {
        if (this.predicate && !this.predicate.match(/['"]/)) {
          _utils.logger.error('This query may need to quote its value');
        }
        return;
      }

      var channelId = 'layer:///channels/' + predicateIds.uuid;
      if (!this._predicate) this._predicate = predicateIds.id;
      var channel = _settings.client.getChannel(channelId);

      var newRequest = 'channels/' + predicateIds.uuid + '/members?page_size=' + pageSize + (this._nextServerFromId ? '&from_id=' + this._nextServerFromId : '');

      // Don't query on unsaved channels, nor repeat still firing queries
      if ((!channel || channel.isSaved()) && newRequest !== this._firingRequest) {
        this.isFiring = true;
        this._firingRequest = newRequest;
        _settings.client.xhr({
          telemetry: {
            name: 'member_query_time'
          },
          url: newRequest,
          method: 'GET',
          sync: false
        }, function (results) {
          return _this2._processRunResults(results, newRequest, pageSize);
        });
      }
    }
  }, {
    key: '_handleEvents',
    value: function _handleEvents(eventName, evt) {
      switch (eventName) {

        // If a member has changed and its in our result set, replace
        // it with a new immutable object
        case 'members:change':
          this._handleChangeEvent('members', evt);
          break;

        // If members are added, and they aren't already in our result set
        // add them.
        case 'members:add':
          this._handleAddEvent('members', evt);
          break;

        // If a Identity is deleted and its in our result set, remove it
        // and trigger an event
        case 'members:remove':
          this._handleRemoveEvent('members', evt);
          break;
      }
    }
  }]);

  return MembersQuery;
}(_query2.default);

MembersQuery._supportedEvents = [].concat(_query2.default._supportedEvents);

MembersQuery.MaxPageSize = 500;

MembersQuery.prototype.model = _query2.default.Membership;

_root2.default.initClass.apply(MembersQuery, [MembersQuery, 'MembersQuery', _namespace2.default.Query]);

module.exports = MembersQuery;