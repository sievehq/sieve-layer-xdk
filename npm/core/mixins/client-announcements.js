/**
 * Adds Message handling to the Layer.Core.Client.
 *
 * @class Layer.Core.mixins.ClientAnnouncements
 */
'use strict';

var _announcement = require('../models/announcement');

var _announcement2 = _interopRequireDefault(_announcement);

var _announcementsQuery = require('../queries/announcements-query');

var _announcementsQuery2 = _interopRequireDefault(_announcementsQuery);

var _namespace = require('../namespace');

var _namespace2 = _interopRequireDefault(_namespace);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  methods: {
    _createAnnouncementFromServer: function _createAnnouncementFromServer(obj) {
      return _announcement2.default._createFromServer(obj);
    },
    _createAnnouncementsQuery: function _createAnnouncementsQuery(options) {
      return new _announcementsQuery2.default(options);
    }
  }
}; 

_namespace2.default.mixins.Client.push(module.exports);