/**
 * The Image Message is typically used to send just a photo, but it can also be used
 * to send a photo with title, description, etc... perhaps as a simplified way to preview
 * a Product.
 *
 * A basic Image Message can be created with:
 *
 * ```
 * ImageModel = Layer.Core.Client.getMessageTypeModelClass('ImageModel')
 * model = new ImageModel({
 *    sourceUrl: "http://l7.alamy.com/zooms/e33f19042cbe4ec1807bba7f3720ba62/executive-in-a-strait-jacket-aakafp.jpg",
 *    title: "My new jacket",
 *    subtitle: "The right choice for special occasions with your crazed inlaws.  This will make you feel like you at last belong.",
 *    artist: "Anonymous"
 * });
 * model.send({ conversation });
 * ```
 *
 *
 * An Image Message can have a separate preview and source image; preview is rendered
 * within the Message List, and source is opened when the user clicks for more detail:
 *
 * ```
 * ImageModel = Layer.Core.Client.getMessageTypeModelClass('ImageModel')
 * model = new ImageModel({
 *    sourceUrl: "http://l7.alamy.com/zooms/e33f19042cbe4ec1807bba7f3720ba62/executive-in-a-strait-jacket-aakafp.jpg",
 *    previewUrl: "http://l7.alamy.com/zooms/e33f19042cbe4ec1807bba7f3720ba62/executive-in-a-strait-jacket-aakafp.jpg",
 * });
 * model.send({ conversation });
 * ```
 *
 * The ImageModel may also use the `source` and `preview` properties instead of `sourceUrl` and `previewUrl`.
 * This occurs when the Image is stored as part of a MessagePart's data, in which case, `source`
 * and `preview` refer to the MessagePart with the data:
 *
 * ```
 * ImageModel = Layer.Core.Client.getMessageTypeModelClass('ImageModel')
 * model = new ImageModel({
 *    source: blob1,
 *    preview: blob2,
 * });
 * model.send({ conversation });
 * ```
 *
 * ### Importing
 *
 * Included with the standard build. For custom build, import with:
 *
 * ```
 * import '@layerhq/web-xdk/ui/messages/image/layer-image-message-view';
 * import '@layerhq/web-xdk/ui/messages/image/layer-image-message-model';
 * ```
 *
 * @class Layer.UI.messages.ImageMessageModel
 * @extends Layer.Core.MessageTypeModel
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _loadImage = require('blueimp-load-image/js/load-image');

var _loadImage2 = _interopRequireDefault(_loadImage);

require('blueimp-load-image/js/load-image-orientation');

require('blueimp-load-image/js/load-image-meta');

require('blueimp-load-image/js/load-image-exif');

var _uiUtils = require('../../ui-utils');

var _messageHandlers = require('../../handlers/message/message-handlers');

var _core = require('../../../core');

var _core2 = _interopRequireDefault(_core);

var _utils = require('../../../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } 


var ImageModel = function (_MessageTypeModel) {
  _inherits(ImageModel, _MessageTypeModel);

  function ImageModel() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, ImageModel);

    if (options.source && !(options.source instanceof _core.MessagePart)) {
      options.source = new _core.MessagePart(options.source);
    }
    if (options.preview && !(options.preview instanceof _core.MessagePart)) {
      options.preview = new _core.MessagePart(options.preview);
    }
    return _possibleConstructorReturn(this, (ImageModel.__proto__ || Object.getPrototypeOf(ImageModel)).call(this, options));
  }

  /**
   * Does the work of generateParts but allows us to asynchronously call it if needed.
   *
   * @method _generateParts2
   * @private
   */


  _createClass(ImageModel, [{
    key: '_generateParts2',
    value: function _generateParts2() {
      // Generate the MessagePart body
      var body = this.initBodyWithMetadata(['sourceUrl', 'previewUrl', 'artist', 'fileName', 'orientation', 'width', 'height', 'previewWidth', 'previewHeight', 'title', 'subtitle']);

      // Generate the MessagePart with the body
      this.part = new _core.MessagePart({
        mimeType: this.constructor.MIMEType,
        body: JSON.stringify(body)
      });
      var parts = [this.part];

      // If there is a source part, add it to the parts array and add it to the Message Part
      // Node Heirarchy
      if (this.source) {
        parts.push(this.source);
        this.addChildPart(this.source, 'source');
      }

      // If there is a preview part, add it to the parts array and add it to the Message Part
      // Node Heirarchy
      if (this.preview) {
        parts.push(this.preview);
        this.addChildPart(this.preview, 'preview');
      }

      return parts;
    }

    /**
     * Generate the Message Parts representing this model so that the Message can be sent.
     *
     * If a `source` MessagePart is provided, but not a `preview` MessagePart, then we
     * need to generate the `preview` which is an async task.  Much of the work to generate the
     * Message Parts is therefore async called after the preview is generated.
     *
     * @method generateParts
     * @protected
     * @param {Function} callback
     * @param {Layer.Core.MessagePart[]} callback.parts
     */

  }, {
    key: 'generateParts',
    value: function generateParts(callback) {
      var _this2 = this;

      if (this.source && !this.mimeType) this.mimeType = this.source.type;

      if (this.source && !this.fileName) this.fileName = this.source.name;

      if (this.source && !this.preview && !this.previewUrl) {
        // We need to generate the preview; first gather orientation and sizing data
        this._gatherMetadataFromEXIF(this.source.body, function () {
          // Generate a smaller version of the image
          _this2._generatePreview(_this2.source.body, function () {
            // Finish the standard generateParts task
            var parts = _this2._generateParts2();
            callback(parts);
          });
        });
      } else {
        // Finish the standard generateParts task
        var parts = this._generateParts2();
        callback(parts);
      }
    }

    /**
     * Given a Layer.Core.Message, initialize this Image Model.
     *
     * `parseModelChildParts` is called for intialization, and is also recalled
     * whenever the Message itself is modified.
     *
     * @method parseModelChildParts
     * @protected
     * @param {Object} payload    Metadata describing the Image Message
     */

  }, {
    key: 'parseModelChildParts',
    value: function parseModelChildParts(_ref) {
      var _this3 = this;

      var _ref$changes = _ref.changes,
          changes = _ref$changes === undefined ? [] : _ref$changes,
          _ref$isEdit = _ref.isEdit,
          isEdit = _ref$isEdit === undefined ? false : _ref$isEdit;

      _get(ImageModel.prototype.__proto__ || Object.getPrototypeOf(ImageModel.prototype), 'parseModelChildParts', this).call(this, { changes: changes, isEdit: isEdit });

      // Iterate over each part, copying suitable parts into the associated property.
      // Change events occur when fetching external content for these MessageParts and
      // triggers change events so that UIs can rerender with all image data.
      this.childParts.forEach(function (part) {
        switch (part.mimeAttributes.role) {
          case 'source':
            {
              _this3.source = part;
              var oldUrl = part.url;
              part.on('url-loaded', function () {
                _this3._triggerAsync('message-type-model:change', {
                  property: 'source',
                  oldValue: oldUrl,
                  newValue: part.url
                });
              }, _this3);
              break;
            }
          case 'preview':
            _this3.preview = part;
            if (!part.body) {
              part.on('content-loaded', function () {
                _this3._triggerAsync('message-type-model:change', {
                  property: 'preview',
                  oldValue: null,
                  newValue: part.body
                });
              }, _this3);
            }
            break;
        }
      });
    }

    /**
     * Get a Blob that can be used to render an Image preview.
     *
     * @method getPreviewBlob
     * @param {Function} callback
     * @param {Blob} callback.data
     */

  }, {
    key: 'getPreviewBlob',
    value: function getPreviewBlob(callback) {
      if (this.preview) {
        if (this.preview.body) return callback(this.preview.body);
        this.preview.fetchContent(function (data) {
          return callback(data);
        });
      } else if (this.source) {
        if (this.source.body) return callback(this.source.body);
        this.source.fetchContent(function (data) {
          return callback(data);
        });
      } else if (this.previewUrl || this.sourceUrl) {
        (0, _utils.xhr)({
          url: this.previewUrl || this.sourceUrl,
          responseType: 'blob'
        }, function (result) {
          if (result.success) {
            callback(result.data);
          }
        });
      }
    }

    /**
     * Parse the Image Blob/File for EXIF metadata and copy them into the model's properties.
     *
     * @method _gatherMetadataFromEXIF
     * @private
     * @param {Blob} file
     * @param {Function} callback
     */

  }, {
    key: '_gatherMetadataFromEXIF',
    value: function _gatherMetadataFromEXIF(file, callback) {
      _loadImage2.default.parseMetaData(file, onParseMetadata.bind(this));

      function onParseMetadata(data) {

        if (data.imageHead && data.exif) {
          this.orientation = data.exif.get('Orientation');
          this.width = data.exif.get('ImageWidth');
          this.height = data.exif.get('ImageHeight');
          this.artist = data.exif.get('Artist');
          this.description = data.exif.get('ImageDescription') || data.exif.get('UserComment');
        }
        callback();
      }
    }

    /**
     * Given an input Image Blob, create an output MessagePart with an ImageBlob `body` property.
     *
     * > *Note*
     * >
     * > Will not generate a preview if the source image is small enough; will simply call the callback
     * > without any parameters.
     *
     * @method _generatePreview
     * @private
     * @param {Blob} file
     * @param {Function} callback
     * @param {Layer.Core.MessagePart} [callback.previewPart]
     */

  }, {
    key: '_generatePreview',
    value: function _generatePreview(file, callback) {
      var _this4 = this;

      var options = {
        canvas: true
      };

      (0, _loadImage2.default)(file, function (srcCanvas) {
        // Note that the EXIF parser already set these... but these values are more reliable,
        // and there isn't always EXIF data.
        _this4.width = srcCanvas.width;
        _this4.height = srcCanvas.height;

        // If the source image is small, don't waste time generating a preview
        if (srcCanvas.width > ImageModel.MaxPreviewDimension || srcCanvas.height > ImageModel.MaxPreviewDimension) {
          var blob = _this4._postGeneratePreview(srcCanvas);
          _this4.preview = new _core.MessagePart(blob);
          callback(_this4.preview);
        } else {
          callback();
        }
      }, options);
    }

    /**
     * Does the actual processing to create the Preview Image from a Canvas rendering the Source Image.
     *
     * @method _postGeneratePreview
     * @private
     * @param {Canvas} srcCanvas
     * @returns {Blob} previewBlob
     */

  }, {
    key: '_postGeneratePreview',
    value: function _postGeneratePreview(srcCanvas) {

      var size = (0, _uiUtils.normalizeSize)({ width: this.width, height: this.height }, { width: ImageModel.MaxPreviewDimension, height: ImageModel.MaxPreviewDimension });
      var canvas = document.createElement('canvas');
      this.previewWidth = canvas.width = size.width;
      this.previewHeight = canvas.height = size.height;
      var context = canvas.getContext('2d');

      context.fillStyle = context.strokeStyle = 'white';
      context.fillRect(0, 0, size.width, size.height);
      context.drawImage(srcCanvas, 0, 0, size.width, size.height);

      // Turn the canvas into a jpeg image for our Preview Image
      var binStr = atob(canvas.toDataURL('image/jpeg', ImageModel.PreviewQuality).split(',')[1]);
      var len = binStr.length;
      var arr = new Uint8Array(len);

      for (var i = 0; i < len; i++) {
        arr[i] = binStr.charCodeAt(i);
      }
      return new Blob([arr], { type: 'image/jpeg' });
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
      return this.artist;
    }
  }, {
    key: 'fetchUrl',
    value: function fetchUrl(callback) {
      if (this.source && this.source.url) callback(this.source.url);else if (this.source) this.source.fetchStream(callback);else if (this.preview && this.preview.url) callback(this.preview.url);else if (this.preview) this.preview.fetchStream(callback);
    }

    // See the url property definition below

  }, {
    key: '__getUrl',
    value: function __getUrl() {
      if (this.source) {
        return this.source.url; // doesn't handle expiring content yet
      } else if (this.sourceUrl) {
        return this.sourceUrl;
      } else if (this.preview) {
        return this.preview.url; // doesn't handle expiring content yet
      } else if (this.previewUrl) {
        return this.previewUrl;
      }
    }
  }]);

  return ImageModel;
}(_core.MessageTypeModel);

/**
 * The title of the Image Message
 *
 * @property {String} title
 */


ImageModel.prototype.title = '';

/**
 * File Name of the image in this Message.
 *
 * > *Note*
 * >
 * > Adding this to the model is not according to spec, but allows us to
 * > preserve this info when a user uploads a file without it forcing it to
 * > render metadata that isn't important.
 *
 * @property {String} fileName
 */
ImageModel.prototype.fileName = '';

/**
 * Subtitle for the Image Message
 *
 * @property {String} subtitle
 */
ImageModel.prototype.subtitle = '';

/**
 * URL to the image.
 *
 * Not needed if providing a Layer.UI.messages.ImageMessageModel.source property.
 *
 * @property {String} sourceUrl
 */
ImageModel.prototype.sourceUrl = '';

/**
 * URL to the preview image.
 *
 * Not needed if providing a Layer.UI.messages.ImageMessageModel.preview property.
 *
 * @property {String} previewUrl
 */
ImageModel.prototype.previewUrl = '';

/**
 * Orientation number to use for orienting the Image.
 *
 * Orientation number is defined according to how the EXIF orientation number is defined.
 *
 * @property {Number} orientation
 */
ImageModel.prototype.orientation = null;

/**
 * Artist who created the Image
 *
 * @property {String} artist
 */
ImageModel.prototype.artist = '';

/**
 * Preview Image Message Part
 *
 * Image data in an Image Message Part is typcially accessed with:
 *
 * ```
 * if (!model.preview.body) {
 *    model.preview.fetchContent(function(blob) {
 *        // process blob here
 *    });
 * } else {
 *    // process model.preview.body blob here
 * }
 * ```
 *
 * See Layer.Core.MessagePart.fetchContent and Layer.Core.MessagePart.fetchStream
 * for more details.
 *
 * @property {Layer.Core.MessagePart} preview
 */
ImageModel.prototype.preview = null;

/**
 * Image Message Part
 *
 * Image data in an Image Message Part is typcially accessed with:
 *
 * ```
 * if (!model.preview.body) {
 *    model.preview.fetchContent(function(blob) {
 *        // process blob here
 *    });
 * } else {
 *    // process model.preview.body blob here
 * }
 * ```
 *
 * See Layer.Core.MessagePart.fetchContent and Layer.Core.MessagePart.fetchStream
 * for more details.
 *
 * @property {Layer.Core.MessagePart} source
 */
ImageModel.prototype.source = null;

/**
 * Width of the Image in the Message; applies to the source/sourceUrl image.
 *
 * @property {Number} width
 */
ImageModel.prototype.width = null;

/**
 * Height of the Image in the Message; applies to the source/sourceUrl image.
 *
 * @property {Number} height
 */
ImageModel.prototype.height = null;

/**
 * Width of the Preview Image in the Message; applies to the preview/previewUrl image.
 *
 * @property {Number} previewWidth
 */
ImageModel.prototype.previewWidth = null;

/**
 * Height of the Preview Image in the Message; applies to the preview/previewUrl image.
 *
 * @property {Number} previewHeight
 */
ImageModel.prototype.previewHeight = null;

/**
 * The `open-url` action needs a url property in order to determine what to open.
 *
 * Provide a property getter for `url` that finds a suitable url and returns it.
 *
 * @property {String} url
 */
ImageModel.prototype.url = '';

/**
 * Maximum width/height for a Preview Image.
 *
 * If width/height of an image we are sending is greater than this, we create a preview at this size.
 *
 * @static
 * @property {Number} {MaxPreviewDimesion=768}
 */
ImageModel.MaxPreviewDimension = 768;

/**
 * Preview Image JPEG Quality
 *
 * When generating preview images, what quality of jpeg compression to use?
 *
 * * 100%: Full quality
 * * 50%: Much compression
 * * 0%: I have not dared to try this
 *
 * @static
 * @property {Number} {PreviewQuality=0.5}
 */
ImageModel.PreviewQuality = 0.5;

/**
 * One instance of this type
 *
 * @static
 * @property {String} [LabelSingular=Image]
 */
ImageModel.LabelSingular = 'Image';

/**
 * One instance of this type
 *
 * @static
 * @property {String} [LabelPlural=Images]
 */
ImageModel.LabelPlural = 'Images';

/**
 * Standard concise representation of this Message Type
 *
 * @static
 * @property {String} [SummaryTemplate=]
 */
ImageModel.SummaryTemplate = '';

/**
 * The default action when selecting this Message is to trigger an `open-url` and view the Image.
 *
 * @static
 * @property {String} [defaultAction=open-url]
 */
ImageModel.defaultAction = 'open-url';

/**
 * The MIME Type recognized by and used by the Image Model.
 *
 * @static
 * @property {String} [MIMEType=application/vnd.layer.image+json]
 */
ImageModel.MIMEType = 'application/vnd.layer.image+json';

/**
 * The UI Component to render the Image Model.
 *
 * @static
 * @property {String} [messageRenderer=layer-image-message-view]
 */
ImageModel.messageRenderer = 'layer-image-message-view';

// Init the class
_core.Root.initClass.apply(ImageModel, [ImageModel, 'ImageModel']);

// Register the Message Model Class with the Client
_core2.default.Client.registerMessageTypeModelClass(ImageModel, 'ImageModel');

/*
 * This Message Handler is NOT the main "layer-message-viewer" Message Handler;
 * rather, this Viewer detects text/plain messages, converts them to
 * Text Cards, and THEN lets the <layer-message-viewer /> component handle it from there
 */
(0, _messageHandlers.register)({
  tagName: 'layer-message-viewer',
  handlesMessage: function handlesMessage(message, container) {
    var isCard = Boolean(message.getPartsMatchingAttribute({ role: 'root' })[0]);
    var source = message.filterParts(function (part) {
      return ['image/png', 'image/gif', 'image/jpeg'].indexOf(part.mimeType) !== -1;
    })[0];

    if (!isCard && source) {
      var preview = message.filterParts(function (part) {
        return part.mimeType === 'image/jpeg+preview';
      })[0];
      var metaPart = message.filterParts(function (part) {
        return part.mimeType === 'application/json+imageSize';
      })[0];
      var meta = metaPart ? JSON.parse(metaPart.body) : {};
      var model = new ImageModel({
        source: source,
        preview: preview
      });

      if (meta.width) model.width = meta.width;
      if (meta.height) model.height = meta.height;
      if (meta.orientation) model.orientation = meta.orientation;
      message._messageTypeModel = model;
      model.part = new Layer.Core.MessagePart({
        id: source.id,
        _message: message,
        mimeType: ImageModel.MIMEType,
        mimeAttributes: { role: 'root' },
        body: JSON.stringify(meta)
      });

      message._addToMimeAttributesMap(model.part);
      return true;
    }
  }
});

module.exports = ImageModel;