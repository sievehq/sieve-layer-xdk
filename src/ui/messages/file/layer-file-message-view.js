/**
 * UI for a File Message
 *
 * @class Layer.UI.messages.FileMessageView
 * @mixin Layer.UI.messages.MessageViewMixin
 * @extends Layer.UI.Component
 */
import { registerComponent } from '../../components/component';
import MessageViewMixin from '../message-view-mixin';
import { Constants } from '../../base';

registerComponent('layer-file-message-view', {
  mixins: [MessageViewMixin],

  // Adapated from github.com/picturepan2/fileicon.css
  style: `
  layer-file-message-view {
    display: block;
    width: 100%;
  }
`,

  properties: {
    // See parent class
    widthType: {
      value: Constants.WIDTH.FLEX,
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
     * @property {String} [messageViewContainerTagName=layer-standard-message-view-container]
     */
    messageViewContainerTagName: {
      noGetterFromSetter: true,
      value: 'layer-standard-message-view-container',
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
