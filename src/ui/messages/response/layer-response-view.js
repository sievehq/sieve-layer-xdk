/**
 * UI for a Response Message
 *
 * A Response Message is a Message sent indicating that a user has interacted with a Message and changed
 * its state in a manner that is shared with all users and persisted.  See the Response Model for more details.
 * The Response View simply renders any renderable part of the Response Message.
 *
 * @class Layer.UI.messages.ResponseView
 * @mixin Layer.UI.messages.MessageViewMixin
 * @extends Layer.UI.components.Component
 */
import { registerComponent } from '../../components/component';
import MessageViewMixin from '../message-view-mixin';

registerComponent('layer-response-view', {
  mixins: [MessageViewMixin],
  style: `layer-message-viewer.layer-response-view {}`,
  properties: {

    // widthType is derived from the Response's contentView if there is one
    widthType: {
      get() {
        return this.properties.contentView ? this.properties.contentView.widthType : 'flex-width';
      },
    },
  },
  methods: {
    onAfterCreate() {
      // Generate the contentView from the displayModel
      if (this.model.displayModel) {
        this.properties.contentView = this.createElement('layer-message-viewer', {
          model: this.model.displayModel,
          parentNode: this,
          cardBorderStyle: 'none',
        });
      }
    },
  },
});
