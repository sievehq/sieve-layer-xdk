/**
 * A helper mixin for any widget that wants to be a drop target for files.
 *
 * Must be mixed in with a Component that defines a `conversation` property.
 *
 * @class Layer.UI.mixins.FileDropTarget
 */
'use strict';

var _layerImageMessageModel = require('../messages/image/layer-image-message-model');

var _layerImageMessageModel2 = _interopRequireDefault(_layerImageMessageModel);

var _layerFileMessageModel = require('../messages/file/layer-file-message-model');

var _layerFileMessageModel2 = _interopRequireDefault(_layerFileMessageModel);

var _layerCarouselMessageModel = require('../messages/carousel/layer-carousel-message-model');

var _layerCarouselMessageModel2 = _interopRequireDefault(_layerCarouselMessageModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  properties: {
    /**
     * By default, this widget supports dropping Files from your file system to send them as Messages.
     *
     * You can turn this off by setting this widget's `isDropTargetEnabled` to `false`:
     *
     * ```
     * widget.isDropTargetEnabled = false;
     * ```
     *
     * @property {Boolean} isDropTargetEnabled
     */
    isDropTargetEnabled: {
      type: Boolean,
      value: true
    }
  },
  methods: {
    // Wire up all of othe event handlers for being a drop target
    onCreate: function onCreate() {
      // TODO: this pattern sucks. Setup a utility that streamlines caching of these functions for later unsubscribing
      this.properties.onDragOverBound = this._onDragOver.bind(this);
      this.properties.onDragEndBound = this._onDragEnd.bind(this);
      this.properties.onFileDropBound = this.onFileDrop.bind(this); // public
      this.properties.ignoreDropBound = this._ignoreDrop.bind(this);

      // Tells the browser that we *can* drop on this target
      this.addEventListener('dragover', this.properties.onDragOverBound, false);
      this.addEventListener('dragenter', this.properties.onDragOverBound, false);

      this.addEventListener('dragend', this.properties.onDragEndBound, false);
      this.addEventListener('dragleave', this.properties.onDragEndBound, false);

      this.addEventListener('drop', this.properties.onFileDropBound, false);

      document.addEventListener('drop', this.properties.ignoreDropBound, false);
      document.addEventListener('dragenter', this.properties.ignoreDropBound, false);
      document.addEventListener('dragover', this.properties.ignoreDropBound, false);
    },


    // Remove all of the event handlers for being a drop target
    onDestroy: function onDestroy() {
      this.removeEventListener('dragover', this.properties.onDragOverBound, false);
      this.removeEventListener('dragenter', this.properties.onDragOverBound, false);

      this.removeEventListener('dragend', this.properties.onDragEndBound, false);
      this.removeEventListener('dragleave', this.properties.onDragEndBound, false);

      this.removeEventListener('drop', this.properties.onFileDropBound, false);

      if (!this.allowDocumentDrop) {
        document.removeEventListener('drop', this.properties.ignoreDropBound, false);
        document.removeEventListener('dragenter', this.properties.ignoreDropBound, false);
        document.removeEventListener('dragover', this.properties.ignoreDropBound, false);
      }
    },


    /**
     * Whatever it is that the browser wants to do by default with this file,
     * prevent it.  Why? Well, one of the more annoying thing it may do
     * is navigate away from your app to show this file.
     *
     * @method
     * @private
     */
    _ignoreDrop: function _ignoreDrop(evt) {
      if (!this.isDropTargetEnabled) return;
      if (evt.preventDefault) {
        evt.preventDefault();
        evt.stopPropagation();
      }
      return false;
    },


    /**
     * On hovering with a file, add a css class
     *
     * @method
     * @private
     */
    _onDragOver: function _onDragOver(evt) {
      if (!this.isDropTargetEnabled) return;
      this.classList.add('layer-file-drag-and-drop-hover');
      evt.preventDefault();
      return false;
    },


    /**
     * On un-hovering with a file, remove a css class
     *
     * @method
     * @private
     */
    _onDragEnd: function _onDragEnd(evt) {
      this.classList.remove('layer-file-drag-and-drop-hover');
    },


    /**
     * MIXIN HOOK: On file drop, generate a Layer.Core.MessageTypeModel to represent the file(s).
     *
     * Provide a mixin to replace this with your own file drop behaviors:
     *
     * ```
     * Layer.init({
     *   mixins: {
     *     'my-widget-with-file-drop-mixin': {
     *       methods: {
     *         onFileDrop: {
     *           mode: Layer.UI.registerComponent.MODES.OVERWRITE,
     *           value: function(evt) {
     *              if (!this.isDropTargetEnabled) return;
     *              this._onDragEnd();
     *
     *              // stops the browser from redirecting off to the image.
     *              evt.preventDefault();
     *              evt.stopPropagation();
     *
     *              const dt = evt.dataTransfer;
     *              const files = Array.prototype.filter.call(dt.files, file => file.type);
     *              const MyCustomMessageModel = Layer.Core.Client.getMessageTypeModelClass('MyCustomMessageModel')
     *              var model = new MyCustomMessageModel({ files: files });
     *              model.send({ conversation: this.conversation });
     *           }
     *         }
     *       }
     *     }
     *   }
     * });
     * ```
     *
     * @method onFileDrop
     * @param {Event} evt
     * @param {Function} [callback]   Provided mostly for unit tests
     */
    onFileDrop: function onFileDrop(evt, callback) {
      if (!this.isDropTargetEnabled) return;
      this._onDragEnd();

      // stops the browser from redirecting off to the image.
      evt.preventDefault();
      evt.stopPropagation();

      var dt = evt.dataTransfer;
      var files = Array.prototype.filter.call(dt.files, function (file) {
        return file.type;
      });

      if (files.length === 1) {
        var model = this._processAttachment(files[0]);
        model.send({ conversation: this.conversation, callback: callback });
      } else {
        var _model = this._processAttachments(files);
        _model.send({ conversation: this.conversation, callback: callback });
      }
      return false;
    },


    /**
     * Given an array of Files, generates a Carousel of File Messages or Image Messages.
     *
     * @method _processAttachments
     * @param {File} files    File Objects to turn into a carousel
     * @returns {Layer.Core.MessageTypeModel}
     * @private
     */
    _processAttachments: function _processAttachments(files) {
      var imageTypes = ['image/gif', 'image/png', 'image/jpeg', 'image/svg'];
      var nonImageParts = files.filter(function (file) {
        return imageTypes.indexOf(file.type) === -1;
      });
      var items = void 0;
      if (nonImageParts.length) {
        items = files.map(function (file) {
          return new _layerFileMessageModel2.default({ source: file, title: file.name });
        });
      } else {
        items = files.map(function (file) {
          return new _layerImageMessageModel2.default({ source: file, title: file.name });
        });
      }
      return new _layerCarouselMessageModel2.default({ items: items });
    },


    /**
     * Given an single File, generates a File Message or Image Message.
     *
     * @method _processAttachments
     * @param {File} files    File Objects to turn into a carousel
     * @returns {Layer.Core.MessageTypeModel}
     * @private
     */
    _processAttachment: function _processAttachment(file) {
      if (['image/gif', 'image/png', 'image/jpeg', 'image/svg'].indexOf(file.type) !== -1) {
        return new _layerImageMessageModel2.default({
          source: file
        });
      } else {
        return new _layerFileMessageModel2.default({
          source: file
        });
      }
    }
  }
}; 