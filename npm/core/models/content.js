/**
 * The Content class represents Rich Content.
 *
 * Note that instances of this class will automatically be
 * generated for developers based on whether their message parts
 * require it.
 *
 * That means for the most part, you should never need to
 * instantiate one of these directly.
 *
 *      var content = new Layer.Core.Content({
 *          id: 'layer:///content/8c839735-5f95-439a-a867-30903c0133f2'
 *      });
 *
 * @class  Layer.Core.Content
 * @private
 * @extends Layer.Core.Root
 * @author Michael Kantor
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _settings = require('../../settings');

var _namespace = require('../namespace');

var _namespace2 = _interopRequireDefault(_namespace);

var _root = require('../root');

var _root2 = _interopRequireDefault(_root);

var _utils = require('../../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } 


var Content = function (_Root) {
  _inherits(Content, _Root);

  /**
   * Constructor
   *
   * @method constructor
   * @param  {Object} options
   * @param  {string} options.id - Identifier for the content
   * @param  {string} [options.downloadUrl=null] - Url to download the content from
   * @param  {Date} [options.expiration] - Expiration date for the url
   * @param  {string} [options.refreshUrl] - Url to access to get a new downloadUrl after it has expired
   *
   * @return {Layer.Core.Content}
   */
  function Content(options) {
    _classCallCheck(this, Content);

    if (typeof options === 'string') {
      options = { id: options };
    }
    return _possibleConstructorReturn(this, (Content.__proto__ || Object.getPrototypeOf(Content)).call(this, options));
  }

  /**
   * Loads the data from google's cloud storage.
   *
   * Data is provided via callback.
   *
   * Note that typically one should use Layer.Core.MessagePart.fetchContent() rather than Layer.Core.Content.loadContent()
   *
   * @method loadContent
   * @param {string} mimeType - Mime type for the Blob
   * @param {Function} callback
   * @param {Blob} callback.data - A Blob instance representing the data downloaded.  If Blob object is not available, then may use other format.
   */


  _createClass(Content, [{
    key: 'loadContent',
    value: function loadContent(mimeType, callback) {
      (0, _utils.xhr)({
        url: this.downloadUrl,
        responseType: 'arraybuffer'
      }, function (result) {
        if (result.success) {
          if (typeof Blob !== 'undefined') {
            var blob = new Blob([result.data], { type: mimeType });
            callback(null, blob);
          } else {
            // If the blob class isn't defined (nodejs) then just return the result as is
            callback(null, result.data);
          }
        } else {
          callback(result.data, null);
        }
      });
    }

    /**
     * Refreshes the URL, which updates the URL and resets the expiration time for the URL
     *
     * @method refreshContent
     * @param {Function} [callback]
     */

  }, {
    key: 'refreshContent',
    value: function refreshContent(callback) {
      var _this2 = this;

      _settings.client.xhr({
        url: this.refreshUrl,
        method: 'GET',
        sync: false
      }, function (result) {
        var data = result.data;

        _this2.expiration = new Date(data.expiration);
        _this2.downloadUrl = data.download_url;
        if (callback) callback(_this2.downloadUrl);
      });
    }

    /**
     * Is the download url expired or about to expire?
     * We can't be sure of the state of the device's internal clock,
     * so if its within 10 minutes of expiring, just treat it as expired.
     *
     * @method isExpired
     * @returns {Boolean}
     */

  }, {
    key: 'isExpired',
    value: function isExpired() {
      if (!this.expiration) return false;
      var expirationLeeway = 10 * 60 * 1000;
      return this.expiration.getTime() - expirationLeeway < Date.now();
    }

    /**
     * Creates a MessagePart from a server representation of the part
     *
     * @method _createFromServer
     * @private
     * @static
     * @param  {Object} part - Server representation of a part
     */

  }], [{
    key: '_createFromServer',
    value: function _createFromServer(part) {
      return new Content({
        id: part.id,
        downloadUrl: part.download_url,
        expiration: new Date(part.expiration),
        refreshUrl: part.refresh_url
      });
    }
  }]);

  return Content;
}(_root2.default);

/**
 * Server generated identifier
 * @property {string}
 */


Content.prototype.id = '';

/**
 * Server generated url for downloading the content
 * @property {string}
 */
Content.prototype.downloadUrl = '';

/**
 * Url for refreshing the downloadUrl after it has expired
 * @property {string}
 */
Content.prototype.refreshUrl = '';

/**
 * Size of the content.
 *
 * @property {number}
 */
Content.prototype.size = 0;

/**
 * Expiration date for the downloadUrl
 * @property {Date}
 */
Content.prototype.expiration = null;

_root2.default.initClass.apply(Content, [Content, 'Content', _namespace2.default]);
module.exports = Content;