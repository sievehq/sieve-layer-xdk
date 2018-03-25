/**
 * The Status Message is used to send a Message that renders as a centered, anonymous message.
 *
 * That means it comes without a "From" or Avatar, and does not render a date.  Regardless of
 * Who sent it, it will show as though it were a status message reporting on an update to
 * someone's or something's state.
 *
 * ```
 * StatusModel = Layer.Core.Client.getMessageTypeModelClass('StatusModel')
 * model = new StatusModel({text: "Your brains have been eaten."})
 * model.send({ conversation });
 * ```
 *
 * ### Importing
 *
 * Not included with the standard build. Import with either:
 *
 * ```
 * import '@layerhq/web-xdk/ui/messages/status/layer-status-message-view';
 * import '@layerhq/web-xdk/ui/messages/status/layer-status-message-model';
 * ```
 *
 * @class Layer.UI.messages.StatusMessageModel
 * @extends Layer.Core.MessageTypeModel
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = require('../../../core');

var _core2 = _interopRequireDefault(_core);

var _uiUtils = require('../../ui-utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } 


var StatusModel = function (_MessageTypeModel) {
  _inherits(StatusModel, _MessageTypeModel);

  function StatusModel() {
    _classCallCheck(this, StatusModel);

    return _possibleConstructorReturn(this, (StatusModel.__proto__ || Object.getPrototypeOf(StatusModel)).apply(this, arguments));
  }

  _createClass(StatusModel, [{
    key: 'generateParts',


    /**
     * Generate all of the Layer.Core.MessagePart needed to represent this Model.
     *
     * Used for Sending the Status Message.
     *
     * @method generateParts
     * @private
     * @param {Function} callback
     * @param {Layer.Core.MessagePart[]} callback.parts
     */
    value: function generateParts(callback) {
      var body = this.initBodyWithMetadata(['text']);

      this.part = new _core.MessagePart({
        mimeType: this.constructor.MIMEType,
        body: JSON.stringify(body)
      });
      callback([this.part]);
    }
  }]);

  return StatusModel;
}(_core.MessageTypeModel);

/**
 * The text of the Status Message.
 *
 * @property {String}
 */


StatusModel.prototype.text = '';

/**
 * One instance of this type
 *
 * @static
 * @property {String} [LabelSingular=Status]
 */
StatusModel.LabelSingular = 'Status';

/**
 * One instance of this type
 *
 * @static
 * @property {String} [LabelPlural=Status]
 */
StatusModel.LabelPlural = 'Status';

/**
 * Standard concise representation of this Message Type
 *
 * @static
 * @property {String} [SummaryTemplate=${itemCount} ${label}]
 */
StatusModel.SummaryTemplate = '${text}'; // eslint-disable-line no-template-curly-in-string


/**
 * The MIME Type recognized by and used by the Status Model.
 *
 * @static
 * @property {String} [MIMEType=application/vnd.layer.status+json]
 */
StatusModel.MIMEType = 'application/vnd.layer.status+json';

/**
 * The UI Component to render the Status Model.
 *
 * @static
 * @property {String} [messageRenderer=layer-status-message-view]
 */
StatusModel.messageRenderer = 'layer-status-message-view';

// Finish setting up the Class
_core.Root.initClass.apply(StatusModel, [StatusModel, 'StatusModel']);

// Register the Message Model Class with the Client
_core2.default.Client.registerMessageTypeModelClass(StatusModel, 'StatusModel');

// Register this MIME Type to be handled as a Status Message
(0, _uiUtils.registerStatusModel)(StatusModel);

module.exports = StatusModel;