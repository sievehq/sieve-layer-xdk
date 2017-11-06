/**
 * TODO: Verify that custom handling of "open-file" events are possible and documented
 * @class layer.UI.handlers.message.messageViewer
 * @extends layer.UI.components.Component
 */
import { registerComponent } from '../../components/component';
import MessageViewMixin from '../message-view-mixin';
import { registerMessageActionHandler } from '../../base';

registerComponent('layer-file-view', {
  mixins: [MessageViewMixin],

  // Adapated from github.com/picturepan2/fileicon.css
  style: `
  layer-file-view {
    display: block;
    width: 100%;
  }
`,

  // Note that there is also a message property managed by the MessageHandler mixin
  properties: {
    widthType: {
      value: 'flex-width',
    },
    preferredMinWidth: {
      type: Number,
      value: 250,
    },
    messageViewContainerTagName: {
      noGetterFromSetter: true,
      value: 'layer-standard-display-container',
    },
  },
  methods: {
    /**
     *
     * @method
     */
    onRerender() {
      this.classList.add('layer-file-' + this.model.mimeType.replace(/[/+]/g, '-'));
    },
  },
});

/* Note that this runs with this === <layer-message-viewer /> */
registerMessageActionHandler('open-file', function openFileHandler(customData) {
  if (customData.url) {
    this.showFullScreen(customData.url);
  } else {
    this.model.getSourceUrl(url => this.showFullScreen(url));
  }
});
