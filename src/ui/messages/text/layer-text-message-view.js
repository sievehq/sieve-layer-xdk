/**
 * UI for a Text Message
 *
 * @class Layer.UI.messages.TextMessageView
 * @mixin Layer.UI.messages.MessageViewMixin
 * @extends Layer.UI.Component
 */
import { registerComponent } from '../../components/component';
import MessageViewMixin from '../message-view-mixin';
import { Constants } from '../../base';
import { processText } from '../../handlers/text/text-handlers';

registerComponent('layer-text-message-view', {
  style: `layer-text-message-view {
    display: block;
  }
  .layer-root-viewer.layer-text-message-view > * > .layer-card-top {
    display: block;
  }
  `,
  mixins: [MessageViewMixin],
  // Note that there is also a message property managed by the MessageHandler mixin
  properties: {
    widthType: {
      get() {
        return this.parentComponent.isShowingMetadata ? Constants.WIDTH.FLEX : Constants.WIDTH.ANY;
      },
    },
    messageViewContainerTagName: {
      noGetterFromSetter: true,
      value: 'layer-standard-message-view-container',
    },
  },
  methods: {
    onRerender() {
      this.innerHTML = processText(this.model.text);
    },
  },
});
