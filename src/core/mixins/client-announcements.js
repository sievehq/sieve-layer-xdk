/**
 * Adds Message handling to the Layer.Core.Client.
 *
 * @class Layer.Core.mixins.ClientAnnouncements
 */

import Announcements from '../models/announcement';
import AnnouncementsQuery from '../queries/announcements-query';
import Core from '../namespace';

module.exports = {
  methods: {
    _createAnnouncementFromServer(obj) {
      return Announcements._createFromServer(obj, this);
    },
    _createAnnouncementsQuery(options) {
      return new AnnouncementsQuery(options);
    },
  },
};

Core.mixins.Client.push(module.exports);
