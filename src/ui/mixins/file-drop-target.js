import ImageManager from 'blueimp-load-image/js/load-image';
import 'blueimp-load-image/js/load-image-orientation';
import 'blueimp-load-image/js/load-image-meta';
import 'blueimp-load-image/js/load-image-exif';
import Layer, { MessagePart } from '../../core';
import { settings } from '../base';
import normalizeSize from '../utils/sizing';
import ImageModel from '../messages/image/layer-image-message-model';
import FileModel from '../messages/file/layer-file-message-model';
import CarouselModel from '../messages/carousel/layer-carousel-message-model';

const Files = {};
module.exports = Files;

window.loadImage = ImageManager;

/**
 * A helper mixin for any widget that wants to be a drop target for files.
 *
 * Must be mixed in with a Component that defines a `conversation` property.
 *
 *
 * @class layer.UI.mixins.FileDropTarget
 */
module.exports = {
  properties: {
    /**
     * By default, the Conversation View supports dropping Files from your file system to send them as Messages.
     *
     * You can turn this off by setting the Conversation View's `isDropTargetEnabled` to `false`.
     *
     * @property {Boolean}
     */
    isDropTargetEnabled: {
      type: Boolean,
      value: true,
    },
  },
  methods: {
    onCreate() {
      this.properties.onDragOverBound = this.onDragOver.bind(this);
      this.properties.onDragEndBound = this.onDragEnd.bind(this);
      this.properties.onFileDropBound = this.onFileDrop.bind(this);
      this.properties.ignoreDropBound = this.ignoreDrop.bind(this);

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

    /**
     * Destroy this component, in particular, remove any handling of any events.
     *
     * @method
     */
    onDestroy() {
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
    ignoreDrop(evt) {
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
    onDragOver(evt) {
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
    onDragEnd(evt) {
      this.classList.remove('layer-file-drag-and-drop-hover');
    },


    /**
     * On file drop, generate an array of Message Parts and pass it on to app.
     *
     * @method
     * @private
     */
    onFileDrop(evt) {
      if (!this.isDropTargetEnabled) return;
      this.onDragEnd();

      // stops the browser from redirecting off to the image.
      if (evt.preventDefault) {
        evt.preventDefault();
        evt.stopPropagation();
      }

      const dt = evt.dataTransfer;
      const files = Array.prototype.filter.call(dt.files, file => file.type);

      if (files.length === 1) {
        const model = this.processAttachment(files[0]);
        model.generateMessage(this.conversation, message => message.send({
          text: 'File received',
          title: `New Message from ${model.getClient().user.displayName}`,
        }));
      } else {
        const model = this.processAttachments(files);
        model.generateMessage(this.conversation, message => message.send({
          text: 'Carousel received',
          title: `New Message from ${model.getClient().user.displayName}`,
        }));
      }
      return false;
    },

    /**
     * Adds data to your message.
     *
     * Given an array of Message Parts, determines if it needs to generate image or video
     * previews and metadata message parts
     *
     * @method processAttachments
     * @param {layer.MessagePart[]} files    File Objects to turn into a carousel
     */
    processAttachments(files) {
      const imageTypes = ['image/gif', 'image/png', 'image/jpeg', 'image/svg'];
      const nonImageParts = files.filter(file => imageTypes.indexOf(file.type) === -1);
      return new CarouselModel({
        items: nonImageParts.length ? files.map(file => new FileModel({ source: file, title: file.name })) : files.map(file => new ImageModel({ source: file, title: file.name })),
      });
    },

    processAttachment(file) {
      if (['image/gif', 'image/png', 'image/jpeg', 'image/svg'].indexOf(file.type) !== -1) {
        return new ImageModel({
          source: file,
        });
      } else {
        return new FileModel({
          source: file,
        });
      }
    },
  },
};

