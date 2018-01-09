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
 * ### Importing
 *
 * Included with the standard build. If creating a custom build, import:
 *
 * ```
 * import '@layerhq/web-xdk/lib/ui/components/layer-message-list/layer-message-item-status';
 * ```
 *
 * @class Layer.UI.components.MessageListPanel.StatusItem
 * @extends Layer.UI.Component
 * @mixin Layer.UI.components.MessageListPanel.Item
 */
import { registerComponent } from '../component';
import MessageItemMixin from './layer-message-item-mixin';

registerComponent('layer-message-item-status', {
  mixins: [MessageItemMixin],
  template: `
    <div class='layer-list-item' layer-id='innerNode'>
        <layer-message-viewer layer-id='messageViewer' class='layer-message-item-main'></layer-message-viewer>
    </div>
  `,
  style: `
    layer-message-item-status {
      display: flex;
      flex-direction: column;
      align-content: stretch;
    }

    layer-message-item-status .layer-list-item {
      display: flex;
      flex-direction: row;
      align-items: stretch;
    }

    layer-message-item-status  .layer-message-item-main {
      overflow: hidden;
    }
  `,
});

