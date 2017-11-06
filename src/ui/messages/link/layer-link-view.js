/**
 *
 * @class layer.UI.handlers.message.messageViewer
 * @extends layer.UI.components.Component
 */
import { registerComponent } from '../../components/component';
import MessageViewMixin from '../message-view-mixin';
import { registerMessageActionHandler } from '../../base';

registerComponent('layer-link-view', {
  mixins: [MessageViewMixin],

  // This style contains rules that impacts the container that contains the url card
  // This will not translate well to shadow-dom.
  style: `
  layer-message-viewer.layer-link-view layer-standard-display-container {
    cursor: pointer;
    display: block;
  }
  layer-link-view img[src=''] {
    display: none;
  }
  layer-link-view img {
    width: 100%;
  }
  .layer-card-width-flex-width layer-link-view a {
    display: none;
  }
  `,

  template: '<img layer-id="image" class="layer-link-view-image" /><a target="_blank" layer-id="link"></a>',
  properties: {
    widthType: {
      get() {
        return this.model.imageUrl || this.parentComponent.isShowingMetadata ? 'flex-width' : 'chat-bubble';
      },
    },
    messageViewContainerTagName: {
      noGetterFromSetter: true,
      value: 'layer-standard-display-container',
    },
  },
  methods: {

    onCreate() {

    },

    onRender() {
      this.onRerender();
    },

    /**
     *
     * @method
     */
    onRerender() {
      this.nodes.image.src = this.model.imageUrl || '';
      this.nodes.link.src = this.model.url;
      this.nodes.link.innerHTML = this.model.url;
    },
    setupContainerClasses() {
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
