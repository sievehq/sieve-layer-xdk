/**
 * UI for a Response Message
 *
 * A Response Message is a Message sent indicating that a user has interacted with a Message and changed
 * its state in a manner that is shared with all users and persisted.  See the Response Model for more details.
 * The Response View simply renders any renderable part of the Response Message.
 *
 * @class Layer.UI.messages.ResponseMessageView
 * @mixin Layer.UI.messages.MessageViewMixin
 * @extends Layer.UI.Component
 */
import { registerComponent } from '../../components/component';
import MessageViewMixin from '../message-view-mixin';
import { Constants } from '../../base';

registerComponent('layer-response-message-view', {
  mixins: [MessageViewMixin],
  style: 'layer-message-viewer.layer-response-message-view {}',
  properties: {

    // widthType is derived from the Response's contentView if there is one
    widthType: {
      get() {
        return this.properties.contentView ? this.properties.contentView.widthType : Constants.WIDTH.FLEX;
      },
    },
  },
  methods: {

    /**
     * After creating this component and setting its model, generate a Message Viewer for its displayable portion.
     *
     * @method onAfterCreate
     */
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
