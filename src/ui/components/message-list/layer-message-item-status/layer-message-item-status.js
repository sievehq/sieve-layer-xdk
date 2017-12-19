/**
 * This widget renders any status message sent within the Message List.
 *
 * Status Messages are rendered as centered text without any "sender name", avatar, timestamp or status.
 *
 * A message is registered to be rendered as a Status Message using:
 *
 * ```
 * Layer.UI.statusMimeTypes.push(myMIMEType);
 * ```
 *
 * That MIME Type must correspond with the Root Message Part in your Message.
 *
 * @class Layer.UI.components.MessageListPanel.StatusItem
 * @extends Layer.UI.Component
 * @mixin Layer.UI.components.MessageListPanel.Item
 */
import { registerComponent } from '../../../components/component';
import MessageItemMixin from '../layer-message-item-mixin';

registerComponent('layer-message-item-status', {
  mixins: [MessageItemMixin],
});

