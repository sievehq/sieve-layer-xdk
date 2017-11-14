/**
 * UI for a Text Message
 *
 * @class Layer.UI.messages.TextView
 * @mixin Layer.UI.messages.MessageViewMixin
 * @extends Layer.UI.components.Component
 */
import { registerComponent } from '../../components/component';
import MessageViewMixin from '../message-view-mixin';
import Base from '../../base';

registerComponent('layer-text-view', {
  style: `layer-text-view {
    display: block;
  }
  .layer-root-card.layer-text-view > * > .layer-card-top {
    display: block;
  }
  `,
  mixins: [MessageViewMixin],
  // Note that there is also a message property managed by the MessageHandler mixin
  properties: {
    widthType: {
      get() {
        return this.parentComponent.isShowingMetadata ? 'flex-width' : 'chat-bubble';
      },
    },
    messageViewContainerTagName: {
      noGetterFromSetter: true,
      value: 'layer-standard-display-container',
    },
  },
  methods: {
    onRerender() {
      this.innerHTML = Base.processText(this.model.text);
    },
  },
});
