/**
 * Adds Channel Membership handling to the Layer.Core.Client.
 *
 * @class Layer.Core.mixins.ClientMembership
 */
'use strict';

var _syncable = require('../models/syncable');

var _syncable2 = _interopRequireDefault(_syncable);

var _membership = require('../models/membership');

var _membership2 = _interopRequireDefault(_membership);

var _membersQuery = require('../queries/members-query');

var _membersQuery2 = _interopRequireDefault(_membersQuery);

var _layerError = require('../layer-error');

var _namespace = require('../namespace');

var _namespace2 = _interopRequireDefault(_namespace);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  events: [
  /**
   * A call to Layer.Core.Membership.load has completed successfully
   *
   * @event
   * @param {Layer.Core.LayerEvent} evt
   * @param {Layer.Core.Membership} evt.target
   */
  'members:loaded',

  /**
   * An Identity has had a change in its properties.
   *
   * Changes occur when new data arrives from the server.
   *
   *      client.on('members:change', function(evt) {
   *          var displayNameChanges = evt.getChangesFor('displayName');
   *          if (displayNameChanges.length) {
   *              myView.renderStatus(evt.target);
   *          }
   *      });
   *
   * @event
   * @param {Layer.Core.LayerEvent} evt
   * @param {Layer.Core.Membership} evt.target
   * @param {Object[]} evt.changes
   * @param {Mixed} evt.changes.newValue
   * @param {Mixed} evt.changes.oldValue
   * @param {string} evt.changes.property - Name of the property that has changed
   */
  'members:change',

  /**
   * A new Member has been added to the Client.
   *
   * This event is triggered whenever a new Layer.Core.Membership
   * has been received by the Client.
   *
          client.on('members:add', function(evt) {
              evt.membership.forEach(function(member) {
                  myView.addMember(member);
              });
          });
  *
  * @event
  * @param {Layer.Core.LayerEvent} evt
  * @param {Layer.Core.Membership[]} evt.membership
  */
  'members:add',

  /**
   * A Member has been removed from the Client.
   *
   * This does not typically occur.
   *
          client.on('members:remove', function(evt) {
              evt.membership.forEach(function(member) {
                  myView.addMember(member);
              });
          });
  *
  * @event
  * @param {Layer.Core.LayerEvent} evt
  * @param {Layer.Core.Membership[]} evt.membership
  */
  'members:remove'],
  lifecycle: {
    constructor: function constructor(options) {
      this._models.members = {};
    },
    cleanup: function cleanup() {
      var _this = this;

      Object.keys(this._models.members || {}).forEach(function (id) {
        var member = _this._models.members[id];
        if (member && !member.isDestroyed) {
          member.destroy();
        }
      });
      this._models.members = null;
    },
    reset: function reset() {
      this._models.members = {};
    }
  },
  methods: {
    /**
     * Retrieve the membership info by ID.
     *
     * Not for use in typical apps.
     *
     * @method getMember
     * @param  {string} id               - layer:///channels/uuid/members/user_id
     * @param  {boolean} [canLoad=false] - Pass true to allow loading a member from the server if not found
     * @return {Layer.Core.Membership}
     */
    getMember: function getMember(id, canLoad) {
      var result = null;
      if (typeof id !== 'string') throw new Error(_layerError.ErrorDictionary.idParamRequired);

      if (this._models.members[id]) {
        result = this._models.members[id];
      } else if (canLoad) {
        if (!this.isReady) throw new Error(_layerError.ErrorDictionary.clientMustBeReady);
        result = _syncable2.default.load(id);
      }
      if (canLoad) result._loadType = 'fetched';
      return result;
    },


    /**
     * Report that a new Membership has been added.
     *
     * @method _addMembership
     * @protected
     * @param  {Layer.Core.Membership} member
     *
     */
    _addMembership: function _addMembership(member) {
      if (!this._models.members[member.id]) {
        this._models.members[member.id] = member;
        this._triggerAsync('members:add', { members: [member] });
        this._scheduleCheckAndPurgeCache(member);
      }
    },


    /**
     * Report that a member has been removed from the client.
     *
     * @method _removeMembership
     * @protected
     * @param  {Layer.Core.Membership} member
     */
    _removeMembership: function _removeMembership(member) {
      var id = typeof member === 'string' ? member : member.id;
      member = this._models.members[id];
      if (member) {
        delete this._models.members[id];
        if (!this._inCleanup) {
          member.off(null, null, this);
          this._triggerAsync('members:remove', { members: [member] });
        }
      }
    },
    _createMembershipFromServer: function _createMembershipFromServer(obj) {
      return _membership2.default._createFromServer(obj);
    },
    _createMembersQuery: function _createMembersQuery(options) {
      return new _membersQuery2.default(options);
    }
  }
}; 

_namespace2.default.mixins.Client.push(module.exports);