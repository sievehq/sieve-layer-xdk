/**
 * This widget renders any message received by this user within the Message List.
 *
 * @class Layer.UI.components.MessageListPanel.ReceivedItem
 * @extends Layer.UI.Component
 * @mixin Layer.UI.components.MessageListPanel.Item
 */
import { registerComponent } from '../../../components/component';
import MessageItemMixin from '../layer-message-item-mixin';
import '../../layer-avatar/layer-avatar';
import '../../layer-date/layer-date';

registerComponent('layer-message-item-received', {
  mixins: [MessageItemMixin],
});
