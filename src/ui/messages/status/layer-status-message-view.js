/**
 * UI for a Status Message
 *
 * A Status Message is any message rendered as though it does not come from any given user, and instead
 * shown as a centered informational message that doesn't look like a message sent by anyone.
 *
 * @class Layer.UI.messages.StatusMessageView
 * @mixin Layer.UI.messages.MessageViewMixin
 * @extends Layer.UI.components.Component
 */
import { registerComponent } from '../../components/component';
import MessageViewMixin from '../message-view-mixin';
import LayerUI, { Constants } from '../../base';

registerComponent('layer-status-message-view', {
  style: `layer-status-message-view {
    display: block;
  }
  .layer-root-card.layer-status-message-view > * > .layer-card-top {
    display: block;
  }
  `,
  mixins: [MessageViewMixin],
  properties: {
    widthType: {
      value: Constants.WIDTH.ANY,
    },
    messageViewContainerTagName: {
      value: '',
    },
  },
  methods: {
    onRerender() {
      this.innerHTML = LayerUI.processText(this.model.text);
    },
  },
});
