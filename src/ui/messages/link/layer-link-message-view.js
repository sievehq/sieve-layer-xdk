/**
 * UI for a Link Message
 *
 * @class Layer.UI.messages.LinkMessageView
 * @mixin Layer.UI.messages.MessageViewMixin
 * @extends Layer.UI.components.Component
 */

import { registerComponent } from '../../components/component';
import MessageViewMixin from '../message-view-mixin';
import { registerMessageActionHandler } from '../../base';
import Util from '../../../util';

registerComponent('layer-link-message-view', {
  mixins: [MessageViewMixin],

  style: `
  layer-message-viewer.layer-link-message-view layer-standard-message-view-container {
    cursor: pointer;
    display: block;
  }
  layer-link-message-view img[src=''] {
    display: none;
  }
  layer-link-message-view img {
    width: 100%;
    display: block;
  }
  .layer-card-width-flex-width layer-link-message-view a {
    display: none;
  }
  layer-message-viewer.layer-link-message-view .layer-card-footer a,
  layer-message-viewer.layer-link-message-view .layer-card-footer a:visited,
  layer-message-viewer.layer-link-message-view .layer-card-footer a:hover {
    color: inherit;
    text-decoration: none;
  `,

  template: '<img layer-id="image" class="layer-link-message-view-image" /><a target="_blank" layer-id="link"></a>',
  properties: {
    widthType: {
      get() {
        // Use a chat bubble if there is no metadata nor image to show, else render this as a normal card-like message
        return this.model.imageUrl || this.parentComponent.isShowingMetadata ? 'flex-width' : 'chat-bubble';
      },
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

      this.nodes.image.addEventListener('load', () => (this.isHeightAllocated = true));
      this.nodes.image.addEventListener('error', () => {
        if (this.model.imageUrl) this.isHeightAllocated = true;
      });
    },

    onAfterCreate() {
      // If the part doesn't have a body, its got external content that is still loading and not yet ready
      if (!this.model.imageUrl && this.model.part.body) {
        this.isHeightAllocated = true;
      } else if (!this.model.part.body) {
        // Once the external content has loaded, update isHeightAllocated
        this.model.on('change', () => {
          // If there is an imageUrl, then the image load event handler above will update isHeightAllocated later.
          if (this.model.part.body && !this.model.imageUrl) {
            this.isHeightAllocated = true;
          }
        });
      }
    },


    /**
     * Whenever a the model changes or is created, rerender basic properties.
     *
     * @method onRerender
     */
    onRerender() {
      this.nodes.image.src = this.model.imageUrl || '';
      this.nodes.link.src = this.model.url;
      this.nodes.link.innerHTML = this.model.url;
    },

    /**
     * As part of the Message UI lifecycle, this is called to update the <layer-standard-message-view-container /> CSS classes.
     *
     * Adds an optional "Next Arrow" to the metadata, and optionally hides itself.
     *
     * @method _setupContainerClasses
     * @protected
     */
    _setupContainerClasses() {
      if (this.widthType) {
        const isLinkOnly = this.widthType === 'chat-bubble';
        const op = isLinkOnly || this.model.imageUrl ? 'remove' : 'add';
        this.parentComponent.classList[op]('layer-arrow-next-container');
        this.parentComponent.classList[this.model.imageUrl || isLinkOnly ? 'remove' : 'add']('layer-no-core-ui');
      }
    },
  },
});

registerMessageActionHandler('open-url', function openUrlHandler(customData) {
  const url = customData.url || this.model.url;
  this.showFullScreen(url);
});
