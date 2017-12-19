/**
 * UI for a Image Message
 *
 * @class Layer.UI.messages.ImageMessageView
 * @mixin Layer.UI.messages.MessageViewMixin
 * @extends Layer.UI.Component
 */
import { registerComponent } from '../../components/component';
import { settings as UISettings } from '../../index';
import { Constants } from '../../base';
import MessageViewMixin from '../message-view-mixin';

import ImageManager from 'blueimp-load-image/js/load-image';
import 'blueimp-load-image/js/load-image-orientation';
import 'blueimp-load-image/js/load-image-meta';
import 'blueimp-load-image/js/load-image-exif';

import normalizeSize from '../../utils/sizing';

registerComponent('layer-image-message-view', {
  mixins: [MessageViewMixin],
  style: `layer-image-message-view {
      display: block;
      overflow: hidden;
    }
    layer-image-message-view canvas, layer-image-message-view img {
      display: block;
    }
    layer-message-viewer.layer-image-message-view > * {
      cursor: pointer;
    }
 `,
  properties: {

    // definied in component.js; any time this is changed, rerender as sizing information may have changed.
    parentComponent: {
      set() {
        this.onRerender();
      },
    },

    // See parent class; uses an any-width style width if there is no metadata.
    widthType: {
      get() {
        return this.parentComponent.isShowingMetadata ? Constants.WIDTH.FLEX : Constants.WIDTH.ANY;
      },
    },

    /**
     * Fix the maximum image height.
     *
     * This can be changed, but needs to be changed at intiialization time, not runtime.
     *
     * @property {Nuber} [maxHeight=300]
     */
    maxHeight: {
      value: 300,
    },

    /**
     * Use a Standard Display Container to render this UI.
     *
     * @property {String} [messageViewContainerTagName=layer-standard-message-view-container]
     */
    messageViewContainerTagName: {
      noGetterFromSetter: true,
      value: 'layer-standard-message-view-container',
    },
  },
  methods: {
    // See parent component for definition
    onCreate() {
      // Image Message heights aren't known until the metadata has been parsed; default to false.
      this.isHeightAllocated = false;
    },

    // See parent component for definition
    onAttach: {
      mode: registerComponent.MODES.AFTER,
      value() {
        // Any time the widget is re-added to the DOM, update its dimensions and rerender
        this.onRerender();
      },
    },

    /**
     * Every time the model changes, or after initialization, rerender the image.
     *
     * TODO: Currently uses an img tag for sourceUrl/previewUrl and a canvas for
     * source/preview. This should consistently use a canvas.
     *
     * @method onRerender
     */
    onRerender() {
      // wait until the parentComponent is a Message Display Container
      if (!this.properties._internalState.onAttachCalled) return;

      // Determine the maximum width for this Image in its current space.
      const maxCardWidth = this._getMaxMessageWidth();

      // Get the blob and render as a canvas
      if (this.model.source || this.model.preview) {
        this.model.getPreviewBlob(blob => this._renderCanvas(blob, maxCardWidth));
      } else {

        // Else get the imageUrl/previewUrl and stick it in the image src property.
        // TODO: Re-assess if we should just use Canvas for consistency.
        while (this.firstChild) this.removeChild(this.firstChild);
        const img = this.createElement('img', {
          parentNode: this,
        });
        img.addEventListener('load', evt => this._imageLoaded(evt.target));
        img.src = this.model.previewUrl || this.model.sourceUrl;
        img.style.maxWidth = maxCardWidth + 'px';
        img.style.maxHeight = this.maxHeight + 'px';
      }
    },

    /**
     * Called when the image has finished loading via `sourceUrl` or `previewUrl`.
     *
     * Set the `isHeightAllocated` property to `true` as its height is now fixed and known.
     *
     * Set the width if the width is too great.
     *
     * @param {HTMLElement} img
     */
    _imageLoaded(img) {
      this.isHeightAllocated = true;
      const minWidth = this.parentComponent.getPreferredMinWidth();
      // maxWidth has already been used to constrain img.width and can be ignored for this calculation
      if (img.width > minWidth) this.messageViewer.style.width = (img.width + 2) + 'px';
    },

    /**
     * Lookup the maximum allowed width for this Image.
     *
     * If its NOT a Root Model, then its width should fill all available space in the parent.
     *
     * If it IS a Root Model, then we execute upon rules that use 60% of available width or 80% of width
     * based on the total available width.
     *
     * Note that even if there is a large amount of available width, there is still a maximum allowed height
     * that may prevent us from using the full width.
     *
     * method _getMaxMessageWidth
     * @private
     */
    _getMaxMessageWidth() {
      if (this.messageViewer.classList.contains('layer-root-viewer')) {
        const parent = this.messageViewer.parentNode;
        if (!parent || !parent.clientWidth) return 0;

        // Enforcing the 60%/80% rules is pretty arbitrary; alternate calculations should be looked at;
        // Location View may have implemented improvements on this
        let width = parent.clientWidth;
        if (width > 600) width = width * 0.6;
        else width = width * 0.8;
        return width;
      } else {
        return this.messageViewer.parentNode.clientWidth;
      }
    },


    /**
     * Generate a Canvas to render our image.
     *
     * Rendering Rules:
     *
     * * Images whose height is less than width and width is less than 192px are scaled to 192px
     * * Images whose height is greater than width and width is less than 192px are scaled to height 192px?
     * * Images whose width and height are equal, and less than 192px should be scaled up to 192px
     * * Images between 192-350 are sized as-is
     * * However, if there is metadata, scale images up to 350px
     *
     * @method _renderCanvas
     * @private
     * @param {Blob} blob
     */
    _renderCanvas(blob, maxCardWidth) {
      let width = this.model.previewWidth || this.model.width || maxCardWidth;
      let height = this.model.previewHeight || this.model.height || this.maxHeight;
      const minWidth = this.parentComponent.getPreferredMinWidth();
      const minHeight = this.parentComponent.getPreferredMinHeight();
      const maxHeight = this.parentComponent.getPreferredMaxHeight();

      // Read the EXIF data
      ImageManager.parseMetaData(
        blob, (data) => {
          const options = {
            canvas: true,
            orientation: this.model.orientation,
          };

          if (data.imageHead && data.exif) {
            options.orientation = data.exif.get('Orientation') || 1;
          }
          options.maxWidth = maxCardWidth;
          options.maxHeight = maxHeight;

          // Write the image to a canvas with the specified orientation
          ImageManager(blob, (canvas) => {
            if (canvas instanceof HTMLElement) {
            /*  if (width < minWidth && height < minHeight) {
                if (width > height) {
                  canvas = ImageManager.scale(canvas, { minWidth });
                } else {
                  canvas = ImageManager.scale(canvas, { minHeight });
                }
              }
*/
              while (this.firstChild) this.removeChild(this.firstChild);
              this.appendChild(canvas);
              if (canvas.width >= minWidth) this.parentComponent.style.width = canvas.width + 'px';
              this.isHeightAllocated = true;
            } else {
              console.error(canvas);
            }
          }, options);
        },
      );
    },
  },
});
