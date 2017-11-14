/**
 * UI for a File Message
 *
 * @class Layer.UI.messages.FileView
 * @mixin Layer.UI.messages.MessageViewMixin
 * @extends Layer.UI.components.Component
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

  properties: {
    // See parent class
    widthType: {
      value: 'flex-width',
    },

    /**
     * Currently used only by the Carousel, establishes how much the Carousel can compress this width down to.
     *
     * @property {Number} [preferredMinWidth=250]
     */
    preferredMinWidth: {
      type: Number,
      value: 250,
    },

    /**
     * Use a Standard Display Container to render this UI.
     *
     * @property {String} [messageViewContainerTagName=layer-standard-display-container]
     */
    messageViewContainerTagName: {
      noGetterFromSetter: true,
      value: 'layer-standard-display-container',
    },
  },
  methods: {
    /**
     * Whenever this component is rendered/rerendered, update its CSS Class to reflect the file type.
     *
     * Adds "layer-file-mime-type" to the class.
     *
     * @method onRerender
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
