/**
 * The Link Message is typically used to send information about an article
 * or other remote contents. Clicking on the Link Message opens that content.
 *
 * A basic Link Message can be created with:
 *
 * ```
 * LinkModel = Layer.Core.Client.getMessageTypeModelClass('LinkModel')
 * model = new LinkModel({
 *    url: "https://layer.com/introducing-the-layer-conversation-design-system/",
 *    title: "Introducing the Layer Conversation Design System",
 *    imageUrl: "https://layer.com/wp-content/uploads/2017/07/bezier-blog-header-2x.png",
 *    description: "The Layer Conversation Design System helps you imagine and design the perfect customer conversation across devices.",
 *    author: "layer.com"
 * });
 * model.send({ conversation });
 * ```
 *
 * All properties except the `url` are optional; if you don't want an image, just leave out the `imageUrl.
 *
 * A Link Message with some tracking can be done using:
 *
 * ```
 * LinkModel = Layer.Core.Client.getMessageTypeModelClass('LinkModel')
 * model = new LinkModel({
 *    url: "https://layer.com/introducing-the-layer-conversation-design-system/",
 *    title: "Introducing the Layer Conversation Design System",
 *    action: {
 *        data: {
 *            url: "https://layer.com/introducing-the-layer-conversation-design-system/?from_my_app"
 *        }
 *     }
 * });
 * model.send({ conversation });
 * ```
 *
 * In the above example, the LinkModel's url will be used if showing a URL.
 * The `action.data.url` if the user clicks on the Message.
 *
 * ### Importing
 *
 * Included with the standard build. For custom build, Import with:
 *
 * ```
 * import '@layerhq/web-xdk/ui/messages/link/layer-link-message-view';
 * import '@layerhq/web-xdk/ui/messages/link/layer-link-message-model';
 * ```
 *
 * @class Layer.UI.messages.LinkMessageModel
 * @extends Layer.Core.MessageTypeModel
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = require('../../../core');

var _core2 = _interopRequireDefault(_core);

var _utils = require('../../../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } 


var TitleRegEx = new RegExp(/<meta [^>]*property\s*=\s*['"]og:title['"].*?\/>/);
var DescriptionRegEx = new RegExp(/<meta [^>]*property\s*=\s*['"]og:description['"].*?\/>/);
var AuthorRegEx = new RegExp(/<meta [^>]*property\s*=\s*['"]og:author['"].*?\/>/);
var ImageRegEx = new RegExp(/<meta [^>]*property\s*=\s*['"]og:image['"].*?\/>/);

var LinkModel = function (_MessageTypeModel) {
  _inherits(LinkModel, _MessageTypeModel);

  function LinkModel() {
    _classCallCheck(this, LinkModel);

    return _possibleConstructorReturn(this, (LinkModel.__proto__ || Object.getPrototypeOf(LinkModel)).apply(this, arguments));
  }

  _createClass(LinkModel, [{
    key: 'generateParts',


    /**
     * Generate all of the Layer.Core.MessagePart needed to represent this Model.
     *
     * Used for Sending the Link Message.
     *
     * @method generateParts
     * @param {Function} callback
     * @param {Layer.Core.MessagePart[]} callback.parts
     * @private
     */
    value: function generateParts(callback) {
      var body = this.initBodyWithMetadata(['imageUrl', 'author', 'title', 'description', 'url']);

      this.part = new _core.MessagePart({
        mimeType: this.constructor.MIMEType,
        body: JSON.stringify(body)
      });
      callback([this.part]);
    }

    // Used by Layer.UI.messages.StandardMessageViewContainer

  }, {
    key: 'getFooter',
    value: function getFooter() {
      return this.author;
    }
  }, {
    key: 'getDescription',
    value: function getDescription() {
      return this.description;
    }

    /**
     * Before sending a Link Message you may want to load the article and populate this Model's proerties from it.
     *
     * ```
     * LinkModel = Layer.Core.Client.getMessageTypeModelClass('LinkModel')
     * model = new LinkModel({
     *     url: "http://www.cnn.com/2017/11/17/health/dog-owners-heart-disease-and-death/index.html",
     * });
     * model.gatherMetadata(function(isSuccess,resultObj) {
     *    model.send({ conversation });
     * })
     * ```
     *
     * Once the callback is called, the model's properties have been updated and is ready to send.
     * Unless of course `isSuccess` is `false`
     *
     * > *Note*
     * >
     * > The most common cause of failure for this operation is a CORS error; many webservers are
     * > not setup to support this type of request.
     *
     * @method gatherMetadata
     * @param {Function} callback
     * @param {Boolean} callback.isSuccess
     * @param {Object}  callback.result     This is the result object generated by Layer.Core.xhr
     */

  }, {
    key: 'gatherMetadata',
    value: function gatherMetadata(callback) {
      var _this2 = this;

      (0, _utils.xhr)({
        method: 'GET',
        url: this.url
      }, function (result) {
        if (result.success) {
          _this2.html = result.data;
          if (!_this2.title) {
            _this2.title = _this2._getArticleMeta(TitleRegEx);
            _this2._triggerAsync('message-type-model:change', {
              property: 'title',
              oldValue: '',
              newValue: _this2.title
            });
          }
          if (!_this2.description) {
            _this2.description = _this2._getArticleMeta(DescriptionRegEx);
            _this2._triggerAsync('message-type-model:change', {
              property: 'description',
              oldValue: '',
              newValue: _this2.description
            });
          }
          if (!_this2.imageUrl) {
            _this2.imageUrl = _this2._getArticleMeta(ImageRegEx);
            _this2._triggerAsync('message-type-model:change', {
              property: 'imageUrl',
              oldValue: '',
              newValue: _this2.imageUrl
            });
          }
          if (!_this2.author) {
            _this2.author = _this2._getArticleMeta(AuthorRegEx);
            _this2._triggerAsync('message-type-model:change', {
              property: 'author',
              oldValue: '',
              newValue: _this2.author
            });
          }
        }
        callback(result.success, result);
      });
    }

    /**
     * Parse the article for the requested metadata.
     *
     * @method _getArticleMeta
     * @private
     * @param {RegExp} regex
     * @returns {String}
     */

  }, {
    key: '_getArticleMeta',
    value: function _getArticleMeta(regex) {
      var matches = this.html.match(regex);
      if (matches) {
        var metatag = matches[0];
        if (metatag) {
          var contentMatches = metatag.match(/content\s*=\s*"(.*?[^/])"/);
          if (!contentMatches) contentMatches = metatag.match(/content\s*=\s*'(.*?[^/])'/);
          if (contentMatches) return contentMatches[1];
        }
      }
      return '';
    }
  }]);

  return LinkModel;
}(_core.MessageTypeModel);

/**
 * The imageUrl is the url to an image to show within the Link Message View.
 *
 * @property {String} imageUrl
 */


LinkModel.prototype.imageUrl = '';

/**
 * The Author of the document linked to by the Link Message; typically shown in the Message Footer.
 *
 * @property {String} author
 */
LinkModel.prototype.author = '';

/**
 * The title of the document linked to by the Link Message
 *
 * @property {String} title
 */
LinkModel.prototype.title = '';

/**
 * The description of the document linked to by the Link Message
 *
 * @property {String} description
 */
LinkModel.prototype.description = '';

/**
 * The url of the document linked to by the Link Message.
 *
 * By default, this is the url opened when the user clicks on this Message.
 *
 * @property {String} url
 */
LinkModel.prototype.url = '';

/**
 * If calling Layer.UI.messages.LinkMessageModel.gatherMetadata, the article is stored
 * in this html property.
 *
 * Otherwise, this property is empty.
 *
 * @property {String} html
 */
LinkModel.prototype.html = '';

/**
 * Standard concise representation of this Message Type
 *
 * @static
 * @property {String} [SummaryTemplate=${url}]
 */
LinkModel.SummaryTemplate = '${url}'; // eslint-disable-line no-template-curly-in-string

/**
 * One instance of this type
 *
 * @static
 * @property {String} [LabelSingular=Link]
 */
LinkModel.LabelSingular = 'Link';

/**
 * One instance of this type
 *
 * @static
 * @property {String} [LabelPlural=Links]
 */
LinkModel.LabelPlural = 'Links';

/**
 * The default action when selecting this Message is to trigger an `open-url` and view the linked document/site.
 *
 * @static
 * @property {String} [defaultAction=open-url]
 */
LinkModel.defaultAction = 'open-url';

/**
 * The MIME Type recognized by and used by the Link Model.
 *
 * @static
 * @property {String} [MIMEType=application/vnd.layer.link+json]
 */
LinkModel.MIMEType = 'application/vnd.layer.link+json';

/**
 * The UI Component to render the Link Model.
 *
 * @static
 * @property {String} [messageRenderer=layer-link-message-view]
 */
LinkModel.messageRenderer = 'layer-link-message-view';

// Finish setting up the Class
_core.Root.initClass.apply(LinkModel, [LinkModel, 'LinkModel']);

// Register the Card Model Class with the Client
_core2.default.Client.registerMessageTypeModelClass(LinkModel, 'LinkModel');

module.exports = LinkModel;