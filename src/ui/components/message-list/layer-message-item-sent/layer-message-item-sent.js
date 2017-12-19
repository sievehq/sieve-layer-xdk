/**
 * This widget renders any message sent by this user within the Message List.
 *
 * @class Layer.UI.components.MessageListPanel.SentItem
 * @extends Layer.UI.Component
 * @mixin Layer.UI.components.MessageListPanel.Item
 */
import { registerComponent } from '../../component';
import MessageItemMixin from '../layer-message-item-mixin';
import '../../layer-avatar/layer-avatar';
import '../../layer-date/layer-date';
import '../../layer-message-status/layer-message-status';

registerComponent('layer-message-item-sent', {
  mixins: [MessageItemMixin],
});
