/**
 * Query class for running a Query on Identities
 *
 *      var identityQuery = client.createQuery({
 *        model: Layer.Core.Query.Identity
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
 * @class  Layer.Core.IdentitiesQuery
 * @extends Layer.Core.Query
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _settings = require('../../settings');

var _namespace = require('../namespace');

var _namespace2 = _interopRequireDefault(_namespace);

var _root = require('../root');

var _root2 = _interopRequireDefault(_root);

var _query = require('./query');

var _query2 = _interopRequireDefault(_query);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } 


var IdentitiesQuery = function (_Query) {
  _inherits(IdentitiesQuery, _Query);

  function IdentitiesQuery() {
    _classCallCheck(this, IdentitiesQuery);

    return _possibleConstructorReturn(this, (IdentitiesQuery.__proto__ || Object.getPrototypeOf(IdentitiesQuery)).apply(this, arguments));
  }

  _createClass(IdentitiesQuery, [{
    key: '_fetchData',
    value: function _fetchData(pageSize) {
      var _this2 = this;

      // There is not yet support for paging Identities;  as all identities are loaded,
      // if there is a _nextDBFromId, we no longer need to get any more from the database
      if (!this._nextDBFromId && _settings.client.dbManager) {
        _settings.client.dbManager.loadIdentities(function (identities) {
          if (identities.length) _this2._appendResults({ data: identities }, true);
        });
      }

      var newRequest = 'identities?page_size=' + pageSize + (this._nextServerFromId ? '&from_id=' + this._nextServerFromId : '');

      // Don't repeat still firing queries
      if (newRequest !== this._firingRequest) {
        this.isFiring = true;
        this._firingRequest = newRequest;
        _settings.client.xhr({
          telemetry: {
            name: 'identity_query_time'
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

        // If a Identity has changed and its in our result set, replace
        // it with a new immutable object
        case 'identities:change':
          this._handleChangeEvent('identities', evt);
          break;

        // If Identities are added, and they aren't already in our result set
        // add them.
        case 'identities:add':
          this._handleAddEvent('identities', evt);
          break;

        // If a Identity is deleted and its in our result set, remove it
        // and trigger an event
        case 'identities:remove':
          this._handleRemoveEvent('identities', evt);
          break;
      }
    }
  }]);

  return IdentitiesQuery;
}(_query2.default);

IdentitiesQuery._supportedEvents = [].concat(_query2.default._supportedEvents);

IdentitiesQuery.MaxPageSize = 500;

IdentitiesQuery.prototype.model = _query2.default.Identity;

_root2.default.initClass.apply(IdentitiesQuery, [IdentitiesQuery, 'IdentitiesQuery', _namespace2.default.Query]);

module.exports = IdentitiesQuery;