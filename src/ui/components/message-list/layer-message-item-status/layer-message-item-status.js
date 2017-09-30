import { registerComponent } from '../../../components/component';
import ListItem from '../../../mixins/list-item';
import MessageItemMixin from '../layer-message-item-mixin';

registerComponent('layer-message-item-status', {
  mixins: [ListItem, MessageItemMixin],
});

