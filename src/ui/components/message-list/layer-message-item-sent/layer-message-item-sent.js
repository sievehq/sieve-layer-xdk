import { registerComponent } from '../../component';
import ListItem from '../../../mixins/list-item';
import MessageItemMixin from '../layer-message-item-mixin';
import '../../layer-avatar/layer-avatar';
import '../../layer-date/layer-date';
import '../../layer-message-status/layer-message-status';

registerComponent('layer-message-item-sent', {
  mixins: [ListItem, MessageItemMixin],
});
