/**
 * Query class for running a Query on Announcements
 *
 *      var announcementQuery = client.createQuery({
 *        model: Layer.Core.Query.Announcement
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
 * @class  Layer.Core.AnnouncementsQuery
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

var _messagesQuery = require('./messages-query');

var _messagesQuery2 = _interopRequireDefault(_messagesQuery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } 


var AnnouncementsQuery = function (_MessagesQuery) {
  _inherits(AnnouncementsQuery, _MessagesQuery);

  function AnnouncementsQuery() {
    _classCallCheck(this, AnnouncementsQuery);

    return _possibleConstructorReturn(this, (AnnouncementsQuery.__proto__ || Object.getPrototypeOf(AnnouncementsQuery)).apply(this, arguments));
  }

  _createClass(AnnouncementsQuery, [{
    key: '_fixPredicate',
    value: function _fixPredicate(inValue) {
      return _query2.default.prototype._fixPredicate.apply(this, [inValue]);
    }
  }, {
    key: '_fetchData',
    value: function _fetchData(pageSize) {
      var _this2 = this;

      // Retrieve data from db cache in parallel with loading data from server
      if (_settings.client.dbManager) {
        _settings.client.dbManager.loadAnnouncements(this._nextDBFromId, pageSize, function (messages) {
          if (messages.length) _this2._appendResults({ data: messages }, true);
        });
      }

      var newRequest = 'announcements?page_size=' + pageSize + (this._nextServerFromId ? '&from_id=' + this._nextServerFromId : '');

      // Don't repeat still firing queries
      if (newRequest !== this._firingRequest) {
        this.isFiring = true;
        this._firingRequest = newRequest;
        _settings.client.xhr({
          telemetry: {
            name: 'announcement_query_time'
          },
          url: newRequest,
          method: 'GET',
          sync: false
        }, function (results) {
          return _this2._processRunResults(results, newRequest, pageSize);
        });
      }
    }
  }]);

  return AnnouncementsQuery;
}(_messagesQuery2.default);

AnnouncementsQuery._supportedEvents = [].concat(_messagesQuery2.default._supportedEvents);

AnnouncementsQuery.MaxPageSize = 100;

AnnouncementsQuery.prototype.model = _query2.default.Announcement;

_root2.default.initClass.apply(AnnouncementsQuery, [AnnouncementsQuery, 'AnnouncementsQuery', _namespace2.default]);

module.exports = AnnouncementsQuery;