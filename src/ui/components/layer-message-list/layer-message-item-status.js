/**
 * This widget renders any status message  within the Message List.
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
 * import '@layerhq/web-xdk/ui/components/layer-message-list/layer-message-item-status';
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

  <!-- Header -->
  <layer-replaceable-content class='layer-message-header' name='messageStatusHeader'></layer-replaceable-content>

  <!-- Body -->
  <div class='layer-message-row' layer-id='messageRow'>

    <!-- Body: Left Side -->
    <layer-replaceable-content class='layer-message-left-side' name='messageStatusLeftSide'></layer-replaceable-content>

    <!-- Body: Message Contents -->
    <div class='layer-message-item-main'>
      <layer-message-viewer layer-id='messageViewer'></layer-message-viewer>
    </div>

    <!-- Body: Right Side -->
    <layer-replaceable-content
      class='layer-message-right-side'
      name='messageStatusRightSide'>
    </layer-replaceable-content>
  </div>

  <!-- Footer -->
  <layer-replaceable-content class='layer-message-footer' name='messageStatusFooter'></layer-replaceable-content>
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
      text-align: center;
    }
    layer-message-item-status .layer-message-item-main {
      flex-grow: 1;
      width: 100px; /* flexbox bug workaround */
    }
    layer-message-item-status.layer-message-item-hide-replaceable-content .layer-message-right-side,
    layer-message-item-status.layer-message-item-hide-replaceable-content .layer-message-left-side {
      display: none;
    }
  `,
});

