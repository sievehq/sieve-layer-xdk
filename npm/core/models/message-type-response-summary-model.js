/**
 * The MessageTypeResponseSummaryModel represents a the Message Part that contains all user Responses to a given Message Part.
 *
 * Message Part has a MIME Type of application/vnd.layer.responsesummary+json
 *
 * @class  Layer.Core.MessageTypeResponseSummaryModel
 * @extends Layer.Core.Root
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _namespace = require('../namespace');

var _namespace2 = _interopRequireDefault(_namespace);

var _syncable = require('./syncable');

var _syncable2 = _interopRequireDefault(_syncable);

var _root = require('../root');

var _root2 = _interopRequireDefault(_root);

var _utils = require('../../utils');

var _utils2 = _interopRequireDefault(_utils);

var _identity = require('./identity');

var _identity2 = _interopRequireDefault(_identity);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }



var MessageTypeResponseSummaryModel = function (_Root) {
  _inherits(MessageTypeResponseSummaryModel, _Root);

  function MessageTypeResponseSummaryModel(options) {
    _classCallCheck(this, MessageTypeResponseSummaryModel);

    var _this = _possibleConstructorReturn(this, (MessageTypeResponseSummaryModel.__proto__ || Object.getPrototypeOf(MessageTypeResponseSummaryModel)).call(this, options));

    if (!_this._participantData) _this._participantData = {};
    return _this;
  }

  _createClass(MessageTypeResponseSummaryModel, [{
    key: 'reset',
    value: function reset() {
      this._participantData = {};
      this.part = null;
    }

    // TODO: Known issue: doesObjectMatch won't compare arrays.

  }, {
    key: 'parseResponsePart',
    value: function parseResponsePart(part) {
      this.part = part;
      var payload = JSON.parse(part.body);
      var participantData = payload.participant_data;
      if (!_utils2.default.doesObjectMatch(this._participantData, participantData)) {
        this._participantData = participantData;
        return true;
      }
    }
  }, {
    key: '_normalizeId',
    value: function _normalizeId(id) {
      if (id.indexOf(_identity2.default.prefixUUID) === 0) {
        return id.substring(_identity2.default.prefixUUID.length);
      } else {
        return id;
      }
    }

    /**
     * Get the Response Message value corresponding to the given `responseName` and `identityId`.
     *
     * @method getResponse
     * @param {String} responseName    Name of the response to lookup
     * @param {String} identityId         Identity ID of the user who made the response
     */

  }, {
    key: 'getResponse',
    value: function getResponse(responseName, identityId) {
      var responses = this._participantData[this._normalizeId(identityId)] || {};
      var result = responses[responseName];
      return result != null ? result : null;
    }

    /**
     * Get _All_ responses from all users that contain the specified `responseName`
     *
     * ```
     * var responses = model.responses.getResponses("selection");
     * responses.forEach(response => {
     *   const identity = client.getIdentity(response.identityId);
     *   console.log(`${identity.displayName} selected ${response.value}`);
     * }
     * ```
     *
     * This method returns an array of all responses from all users who have a `responseName`, where each element
     * in the array contains:
     *
     * * `identityId` of the user who sent that response
     * * `value` the value of the response
     *
     * Note that a user who has set a `responseName` and then later cleared it will still have a `responseName`
     * property whose value may be an empty string, null, or other empty values. These results are included in the
     * array.
     *
     * @method getResponses
     * @param {String} responseName
     * @param {String[]} [identityIds=null] Only include results from these authorized users (optional)
     * @returns {Object[]} responses
     */

  }, {
    key: 'getResponses',
    value: function getResponses(responseName, identityIds) {
      var _this2 = this;

      var ids = identityIds && identityIds.length ? identityIds.map(function (id) {
        return _this2._normalizeId(id);
      }) : null;
      return Object.keys(this._participantData).filter(function (identityId) {
        if (!(responseName in _this2._participantData[identityId])) return false;
        if (ids && ids.indexOf(identityId) === -1) return false;
        return true;
      }).map(function (identityId) {
        return {
          identityId: identityId,
          value: _this2._participantData[identityId][responseName]
        };
      });
    }
  }]);

  return MessageTypeResponseSummaryModel;
}(_root2.default);

/**
 * The full participant data object
 *
 * @private
 * @property {Object} _participantData
 */


MessageTypeResponseSummaryModel.prototype._participantData = null;

/**
 * The {@link Layer.Core.MessagePart} object that this model represents.
 *
 * @property {Layer.Core.MessagePart} part
 */
MessageTypeResponseSummaryModel.prototype.part = null;

MessageTypeResponseSummaryModel._supportedEvents = ['change'].concat(_root2.default._supportedEvents);

MessageTypeResponseSummaryModel.inObjectIgnore = _root2.default.inObjectIgnore;
_root2.default.initClass.apply(MessageTypeResponseSummaryModel, [MessageTypeResponseSummaryModel, 'MessageTypeResponseSummaryModel', _namespace2.default]);
_syncable2.default.subclasses.push(MessageTypeResponseSummaryModel);
module.exports = MessageTypeResponseSummaryModel;