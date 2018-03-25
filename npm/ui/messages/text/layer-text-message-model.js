/**
 * Text Message Model is used to represent a Text Message.
 *
 * A Text Message represents standard communications between participants via text:
 *
 * ```
 * TextModel = Layer.Core.Client.getMessageTypeModelClass('TextModel')
 * model = new TextModel({ text: "hello world" }).send({ conversation });
 * ```
 *
 * The Text Message can also represent a more formal and structured message with
 * titles, subtitles, authors, etc...:
 *
 * ```
 * TextModel = Layer.Core.Client.getMessageTypeModelClass('TextModel')
 * model = new TextModel({
 *    text: "'License' shall mean the terms and conditions for use, reproduction, and distribution as defined by Sections 1 through 9 of this document.  'Licensor' shall mean the copyright owner or entity authorized by the copyright owner that is granting the License.",
 *    title: 'Apache Licence 2.0',
 *    subtitle: 'Please note our licensing',
 *    author: 'The Apache Software Foundation'
 * }).send({ conversation });
 * ```
 *
 * A Text Message should be sent by instantiating a Text Message Model, calling `generateMessage()`
 * and sending the generated message.
 *
 * ### Importing
 *
 * Included with the standard build. For custom build, Import with either:
 *
 * ```
 * import '@layerhq/web-xdk/ui/messages/text/layer-text-message-view';
 * import '@layerhq/web-xdk/ui/messages/text/layer-text-message-model';
 * ```
 *
 * @class Layer.UI.messages.TextMessageModel
 * @extends Layer.Core.MessageTypeModel
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _core = require('../../../core');

var _core2 = _interopRequireDefault(_core);

var _messageHandlers = require('../../handlers/message/message-handlers');

var _constants = require('../../../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } 


var TextModel = function (_MessageTypeModel) {
  _inherits(TextModel, _MessageTypeModel);

  function TextModel() {
    _classCallCheck(this, TextModel);

    return _possibleConstructorReturn(this, (TextModel.__proto__ || Object.getPrototypeOf(TextModel)).apply(this, arguments));
  }

  _createClass(TextModel, [{
    key: 'generateParts',

    /**
     * Generate all of the Layer.Core.MessagePart needed to represent this Model.
     *
     * Used for Sending the Text Message.
     *
     * @method generateParts
     * @param {Function} callback
     * @param {Layer.Core.MessagePart[]} callback.parts
     * @private
     */
    value: function generateParts(callback) {
      var body = this.initBodyWithMetadata(['text', 'author', 'summary', 'title', 'subtitle']);

      this.part = new _core.MessagePart({
        mimeType: this.constructor.MIMEType,
        body: JSON.stringify(body)
      });
      callback([this.part]);
    }

    // Used by Layer.UI.messages.StandardMessageViewContainer

  }, {
    key: 'getDescription',
    value: function getDescription() {
      return this.subtitle;
    }
  }, {
    key: 'getFooter',
    value: function getFooter() {
      return this.author;
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      _get(TextModel.prototype.__proto__ || Object.getPrototypeOf(TextModel.prototype), 'destroy', this).call(this);
    }
  }]);

  return TextModel;
}(_core.MessageTypeModel);

/**
 * The text of the Text Message.
 *
 * @property {String}
 */


TextModel.prototype.text = '';

/**
 * Not yet supported
 *
 * @property {String}
 */
TextModel.prototype.summary = '';

/**
 * The author of the Text Message; used as the Footer in the
 * Layer.UI.messages.StandardMessageViewContainer.
 *
 * @property {String}
 */
TextModel.prototype.author = '';

/**
 * The title to show under the text of the Text Message.
 *
 * @property {String}
 */
TextModel.prototype.title = '';

/**
 * Subtitle for the Text Message, used as the Description by
 * Layer.UI.messages.StandardMessageViewContainer.
 *
 * @property {String}
 */
TextModel.prototype.subtitle = '';

/**
 * Not yet supported
 *
 * @property {String}
 */
TextModel.prototype.mimeType = 'text/plain';

/**
 * Standard concise representation of this Message Type
 *
 * @static
 * @property {String} [SummaryTemplate=${text}]
 */
TextModel.SummaryTemplate = '${text}'; // eslint-disable-line no-template-curly-in-string

/**
 * One instance of this type
 *
 * @static
 * @property {String} [LabelSingular=Text]
 */
TextModel.LabelSingular = 'Text';

/**
 * One instance of this type
 *
 * @static
 * @property {String} [LabelPlural=Texts]
 */
TextModel.LabelPlural = 'Texts';

/**
 * The MIME Type recognized by and used by the Text Model.
 *
 * @static
 * @property {String} [MIMEType=application/vnd.layer.text+json]
 */
TextModel.MIMEType = _constants.STANDARD_MIME_TYPES.TEXT;

/**
 * The UI Component to render the Text Model.
 *
 * @static
 * @property {String} [messageRenderer=layer-text-message-view]
 */
TextModel.messageRenderer = 'layer-text-message-view';

// Finish setting up the Class
_core.Root.initClass.apply(TextModel, [TextModel, 'TextModel']);

// Register the Message Model Class with the Client
_core2.default.Client.registerMessageTypeModelClass(TextModel, 'TextModel');

/*
 * This Message Handler is NOT the main "layer-message-viewer" Message Handler;
 * rather, this Viewer detects text/plain messages, converts them to
 * Text Cards, and THEN lets the <layer-message-viewer /> component handle it from there
 */
(0, _messageHandlers.register)({
  tagName: 'layer-message-viewer',
  handlesMessage: function handlesMessage(message, container) {
    var isCard = Boolean(message.getPartsMatchingAttribute({ role: 'root' })[0]);
    var textPlainPart = message.filterParts(function (part) {
      return part.mimeType === 'text/plain';
    })[0];
    if (!isCard && textPlainPart) {
      textPlainPart.body = '{"text": "' + textPlainPart.body + '"}';
      textPlainPart.mimeType = TextModel.MIMEType + '; role=root';
      message._addToMimeAttributesMap(textPlainPart);
      return true;
    }
  }
});

module.exports = TextModel;