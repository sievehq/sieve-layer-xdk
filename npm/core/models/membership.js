/**
 * The Membership class represents an Membership of a user within a channel.
 *
 * Identities are created by the System, never directly by apps.
 *
 * @class Layer.Core.Membership
 * @experimental This feature is incomplete, and available as Preview only.
 * @extends Layer.Core.Syncable
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _settings = require('../../settings');

var _namespace = require('../namespace');

var _namespace2 = _interopRequireDefault(_namespace);

var _syncable = require('./syncable');

var _syncable2 = _interopRequireDefault(_syncable);

var _root = require('../root');

var _root2 = _interopRequireDefault(_root);

var _constants = require('../../constants');

var _constants2 = _interopRequireDefault(_constants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } 


var Membership = function (_Syncable) {
  _inherits(Membership, _Syncable);

  function Membership() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Membership);

    // Make sure the ID from handle fromServer parameter is used by the Root.constructor
    if (options.fromServer) {
      options.id = options.fromServer.id;
    } else if (options.id && !options.userId) {
      options.userId = options.id.replace(/^.*\//, '');
    }

    var _this = _possibleConstructorReturn(this, (Membership.__proto__ || Object.getPrototypeOf(Membership)).call(this, options));

    _this.isInitializing = true;

    // If the options contains a full server definition of the object,
    // copy it in with _populateFromServer; this will add the Membership
    // to the Client as well.
    if (options && options.fromServer) {
      _this._populateFromServer(options.fromServer);
    }

    if (!_this.url && _this.id) {
      _this.url = _settings.client.url + '/' + _this.id.substring(9);
    } else if (!_this.url) {
      _this.url = '';
    }
    _settings.client._addMembership(_this);

    _this.isInitializing = false;
    return _this;
  }

  _createClass(Membership, [{
    key: 'destroy',
    value: function destroy() {
      if (_settings.client) _settings.client._removeMembership(this);
      _get(Membership.prototype.__proto__ || Object.getPrototypeOf(Membership.prototype), 'destroy', this).call(this);
    }
  }, {
    key: '_triggerAsync',
    value: function _triggerAsync(evtName, args) {
      this._clearObject();
      _get(Membership.prototype.__proto__ || Object.getPrototypeOf(Membership.prototype), '_triggerAsync', this).call(this, evtName, args);
    }
  }, {
    key: 'trigger',
    value: function trigger(evtName, args) {
      this._clearObject();
      _get(Membership.prototype.__proto__ || Object.getPrototypeOf(Membership.prototype), 'trigger', this).call(this, evtName, args);
    }

    /**
     * Populates this instance using server-data.
     *
     * Side effects add this to the Client.
     *
     * @method _populateFromServer
     * @private
     * @param  {Object} membership - Server representation of the membership
     */

  }, {
    key: '_populateFromServer',
    value: function _populateFromServer(membership) {
      var _this2 = this;

      // Disable events if creating a new Membership
      // We still want property change events for anything that DOES change
      this._disableEvents = this.syncState === _constants2.default.SYNC_STATE.NEW;

      this._setSynced();

      this.userId = membership.identity ? membership.identity.user_id || '' : _settings.client.user.userId;
      this.channelId = membership.channel.id;

      // this.role = client._createObject(membership.role);

      this.identity = membership.identity ? _settings.client._createObject(membership.identity) : _settings.client.user;
      this.identity.on('identities:change', function (evt) {
        _this2.trigger('members:change', {
          property: 'identity'
        });
      }, this);

      if (!this.url && this.id) {
        this.url = _settings.client.url + this.id.substring(8);
      }

      this._disableEvents = false;
    }

    /**
     * Update the property; trigger a change event, IF the value has changed.
     *
     * @method _updateValue
     * @private
     * @param {string} key - Property name
     * @param {Mixed} value - Property value
     */

  }, {
    key: '_updateValue',
    value: function _updateValue(key, value) {
      if (value === null || value === undefined) value = '';
      if (this[key] !== value) {
        if (!this.isInitializing) {
          this._triggerAsync('members:change', {
            property: key,
            oldValue: this[key],
            newValue: value
          });
        }
        this[key] = value;
      }
    }
  }, {
    key: '__getUserId',
    value: function __getUserId() {
      return this.identity ? this.identity.userId : '';
    }
  }, {
    key: '__updateIdentity',
    value: function __updateIdentity(newIdentity, oldIdentity) {
      if (oldIdentity) oldIdentity.off(null, null, this);
    }

    /**
     * Create a new Membership based on a Server description of the user.
     *
     * @method _createFromServer
     * @static
     * @param {Object} membership - Server Membership Object
     * @returns {Layer.Core.Membership}
     */

  }], [{
    key: '_createFromServer',
    value: function _createFromServer(membership) {
      return new Membership({
        fromServer: membership,
        _fromDB: membership._fromDB
      });
    }
  }]);

  return Membership;
}(_syncable2.default);

/**
 * User ID that the Membership describes.
 *
 * @property {string}
 */


Membership.prototype.userId = '';

/**
 * Channel ID that the membership describes.
 *
 * @property {string}
 */
Membership.prototype.channelId = '';

/**
 * The user's role within the channel
 *
 * @ignore
 * @property {Layer.Core.Role}
 */
Membership.prototype.role = null;

/**
 * Identity associated with the membership
 *
 * @property {Layer.Core.Identity}
 */
Membership.prototype.identity = '';

Membership.inObjectIgnore = _root2.default.inObjectIgnore;

Membership._supportedEvents = ['members:change', 'members:loaded', 'members:loaded-error'].concat(_syncable2.default._supportedEvents);

Membership.eventPrefix = 'members';
Membership.prefixUUID = '/members/';

_root2.default.initClass.apply(Membership, [Membership, 'Membership', _namespace2.default]);
_syncable2.default.subclasses.push(Membership);

module.exports = Membership;