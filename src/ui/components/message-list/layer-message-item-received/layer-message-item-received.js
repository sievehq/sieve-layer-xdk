import { registerComponent } from '../../../components/component';
import ListItem from '../../../mixins/list-item';
import MessageItemMixin from '../layer-message-item-mixin';
import '../../layer-avatar/layer-avatar';
import '../../layer-date/layer-date';

registerComponent('layer-message-item-received', {
  mixins: [ListItem, MessageItemMixin],
});
