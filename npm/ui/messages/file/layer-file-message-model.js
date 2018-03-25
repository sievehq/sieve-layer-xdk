/**
 * The File Message is used to share files such as PDF or other documents.
 *
 * A basic File Message can be created with:
 *
 * ```
 * FileModel = Layer.Core.Client.getMessageTypeModelClass('FileModel')
 * model = new FileModel({
 *    sourceUrl: "http://l7.alamy.com/zooms/e33f19042cbe4ec1807bba7f3720ba62/executive-in-a-strait-jacket-aakafp.jpg",
 *    title: "My new jacket",
 *    author: "Anonymous"
 * });
 * model.send({ conversation });
 * ```
 *
 *
 * A File Model can also be created with a message from your local file system using the
 * Layer.UI.messages.FileMessageModel.source property:
 *
 * ```
 * FileModel = Layer.Core.Client.getMessageTypeModelClass('FileModel')
 * model = new FileModel({
 *    source: FileBlob
 * });
 * model.send({ conversation });
 * ```
 *
 * ### Importing
 *
 * Not included with the standard build. Import using either:
 *
 * ```
 * import '@layerhq/web-xdk/ui/messages/file/layer-file-message-view';
 * import '@layerhq/web-xdk/ui/messages/file/layer-file-message-model';
 * ```
 *
 * @class Layer.UI.messages.FileMessageModel
 * @extends Layer.Core.MessageTypeModel
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _core = require('../../../core');

var _core2 = _interopRequireDefault(_core);

var _utils = require('../../../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } 

var FileModel = function (_MessageTypeModel) {
  _inherits(FileModel, _MessageTypeModel);

  function FileModel() {
    _classCallCheck(this, FileModel);

    return _possibleConstructorReturn(this, (FileModel.__proto__ || Object.getPrototypeOf(FileModel)).apply(this, arguments));
  }

  _createClass(FileModel, [{
    key: 'generateParts',


    /**
     * Generate the Message Parts representing this model so that the File Message can be sent.
     *
     * @method generateParts
     * @protected
     * @param {Function} callback
     * @param {Layer.Core.MessagePart[]} callback.parts
     */
    value: function generateParts(callback) {
      var source = this.source;
      var sourcePart = void 0;

      // Intialize metadata from the Blob
      if (source) {
        if (!this.title && source.name) this.title = source.name;
        if (!this.size) this.size = source.size;
        if (!this.mimeType) this.mimeType = source.type;
        this.size = source.size;
      }

      // Setup the MessagePart
      var body = this.initBodyWithMetadata(['sourceUrl', 'author', 'size', 'title', 'mimeType']);
      this.part = new _core.MessagePart({
        mimeType: this.constructor.MIMEType,
        body: JSON.stringify(body)
      });

      // Create the source Message Part
      if (source) {
        sourcePart = new _core.MessagePart(this.source);
        this.addChildPart(sourcePart, 'source');
        this.childParts.push(sourcePart);
      }

      callback(this.source ? [this.part, sourcePart] : [this.part]);
    }

    // See parent class

  }, {
    key: 'parseModelPart',
    value: function parseModelPart(_ref) {
      var payload = _ref.payload,
          isEdit = _ref.isEdit;

      _get(FileModel.prototype.__proto__ || Object.getPrototypeOf(FileModel.prototype), 'parseModelPart', this).call(this, { payload: payload, isEdit: isEdit });

      // Initialize the mimeType property if available
      if (!this.mimeType && this.source) this.mimeType = this.source.mimeType;
    }
  }, {
    key: 'parseModelChildParts',
    value: function parseModelChildParts(_ref2) {
      var _ref2$changes = _ref2.changes,
          changes = _ref2$changes === undefined ? [] : _ref2$changes,
          _ref2$isEdit = _ref2.isEdit,
          isEdit = _ref2$isEdit === undefined ? false : _ref2$isEdit;

      _get(FileModel.prototype.__proto__ || Object.getPrototypeOf(FileModel.prototype), 'parseModelChildParts', this).call(this, { changes: changes, isEdit: isEdit });
      this.source = this.childParts.filter(function (part) {
        return part.role === 'source';
      })[0] || null;
    }

    /**
     * Get the sourceUrl to use for fetching the File.
     *
     * ```
     * fileModel.getSourceUrl(url => window.open(url));
     * ```
     *
     * @method getSourceUrl
     * @param {Function} callback
     * @param {String} callback.url
     */

  }, {
    key: 'getSourceUrl',
    value: function getSourceUrl(callback) {
      if (this.sourceUrl) {
        callback(this.sourceUrl);
      } else if (this.source) {
        if (this.source.url) {
          callback(this.source.url);
        } else {
          this.source.fetchStream(function (url) {
            return callback(url);
          });
        }
      } else {
        callback('');
      }
    }

    /**
     * Get the raw file data in a non-expiring form; this does involve download costs not paid using {@link #getSourceUrl}
     *
     * ```
     * fileModel.getSourceBody(body => (this.innerHTML = body));
     * ```
     *
     * @method getSourceBody
     * @param {Function} callback
     * @param {String} callback.body
     */

  }, {
    key: 'getSourceBody',
    value: function getSourceBody(callback) {
      if (this.source && this.source.body) {
        callback(this.source.body);
      } else if (this.source) {
        this.source.fetchContent(function (body) {
          return callback(body);
        });
      } else if (this.sourceUrl) {
        (0, _utils.xhr)({
          method: 'GET',
          url: this.sourceUrl
        }, function (body) {
          return callback(body);
        });
      } else {
        callback('');
      }
    }

    // See title property below

  }, {
    key: '__getTitle',
    value: function __getTitle() {
      if (this.__title) return this.__title;
      // if (this.source && this.source.mimeAttributes.name) return this.source.mimeAttributes.name;
      if (this.__sourceUrl) return this._sourceUrl.replace(/.*\/(.*)$/, '$1');
      return '';
    }

    // Used by Layer.UI.messages.StandardMessageViewContainer

  }, {
    key: 'getTitle',
    value: function getTitle() {
      return this.title.replace(/\..{2,5}$/, '');
    }
  }, {
    key: 'getDescription',
    value: function getDescription() {
      return this.author;
    }
  }, {
    key: 'getFooter',
    value: function getFooter() {
      if (!this.size) return '';
      return Math.floor(this.size / 1000).toLocaleString() + 'K';
    }
  }]);

  return FileModel;
}(_core.MessageTypeModel);

/**
 * MessagePart with the file to be shared.
 *
 * The File Model may instead use `sourceUrl`; use the `getSourceUrl()` method
 * to abstract these concepts.
 *
 * @property {Layer.Core.MessagePart} source
 */


FileModel.prototype.source = null;

/**
 * URL to the file to be shared
 *
 * The File Model may instead use `source`; use the `getSourceUrl()` method
 * to abstract these concepts.
 *
 * @property {String} sourceUrl
 */
FileModel.prototype.sourceUrl = '';

/**
 * Author of the file; typically shown as the Message description.
 *
 * @property {String} author
 */
FileModel.prototype.author = '';

/**
 * Title/file-name of the file; typically shown as the Message Title.
 *
 * @property {String} title
 */
FileModel.prototype.title = '';

/**
 * Size of the file in bytes
 *
 * @property {Number} size
 */
FileModel.prototype.size = '';

/**
 * MIME Type of the file.
 *
 * @property {String} mimeType
 */
FileModel.prototype.mimeType = '';

/**
 * One instance of this type
 *
 * @static
 * @property {String} [LabelSingular=File]
 */
FileModel.LabelSingular = 'File';

/**
 * One instance of this type
 *
 * @static
 * @property {String} [LabelPlural=Files]
 */
FileModel.LabelPlural = 'Files';

/**
 * Standard concise representation of this Message Type
 *
 * @static
 * @property {String} [SummaryTemplate=]
 */
FileModel.SummaryTemplate = '';

/**
 * The default action when selecting this Message is to trigger an `open-file` and view the File.
 *
 * @static
 * @property {String} [defaultAction=open-file]
 */
FileModel.defaultAction = 'open-file';

/**
 * The MIME Type recognized by and used by the File Model.
 *
 * @static
 * @property {String} [MIMEType=application/vnd.layer.file+json]
 */
FileModel.MIMEType = 'application/vnd.layer.file+json';

/**
 * The UI Component to render the File Model.
 *
 * @static
 * @property {String} [messageRenderer=layer-file-message-view]
 */
FileModel.messageRenderer = 'layer-file-message-view';

// Init the class
_core.Root.initClass.apply(FileModel, [FileModel, 'FileModel']);

// Register the Message Model Class with the Client
_core2.default.Client.registerMessageTypeModelClass(FileModel, 'FileModel');

module.exports = FileModel;