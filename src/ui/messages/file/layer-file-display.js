/**
 * TODO: Verify that custom handling of "open-file" events are possible and documented
 * @class layerUI.handlers.message.messageViewer
 * @extends layerUI.components.Component
 */
import { registerComponent } from '../../components/component';
import MessageDisplayMixin from '../message-display-mixin';
import { registerMessageActionHandler } from '../../base';

registerComponent('layer-file-display', {
  mixins: [MessageDisplayMixin],

  // Adapated from github.com/picturepan2/fileicon.css
  style: `
  layer-file-display {
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
    window.open(customData.url);
  } else {
    this.model.getSourceUrl(url => window.open(url));
  }
});
