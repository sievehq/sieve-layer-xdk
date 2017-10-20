/**
 *
 * @class layer.UI.handlers.message.messageViewer
 * @extends layer.UI.components.Component
 */
import { registerComponent } from '../../components/component';
import MessageViewMixin from '../message-view-mixin';

registerComponent('layer-response-view', {
  mixins: [MessageViewMixin],

  // Adapated from github.com/picturepan2/fileicon.css
  style: `layer-message-viewer.layer-response-view {
  }`,

  // Note that there is also a message property managed by the MessageHandler mixin
  properties: {
    model: {},
    cardBorderStyle: {
      value: 'none',
    },
    widthType: {
      get() {
        return this.properties.contentView ? this.properties.contentView.widthType : 'flex-width';
      },
    },
  },
  methods: {
    onAfterCreate() {
      if (this.model.displayModel) {
        this.properties.contentView = this.createElement('layer-message-viewer', {
          message: this.model.message,
          rootPart: this.model.displayModel.part,
          model: this.model.displayModel,
          parentNode: this,
          cardBorderStyle: 'none',
        });
      }
    },
  },
});
