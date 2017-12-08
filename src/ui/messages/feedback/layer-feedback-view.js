/**
 *
 *
 *
 * @class Layer.UI.messages.FeedbackMessageView
 * @mixin Layer.UI.messages.MessageViewMixin
 * @mixin Layer.UI.messages.Clickable
 * @extends Layer.UI.components.Component
 */
import { registerComponent } from '../../components/component';
import { statusMimeTypes } from '../../base';
import FeedbackModel from './layer-feedback-model';
import MessageViewMixin from '../message-view-mixin';
import Clickable from '../../mixins/clickable';

registerComponent('layer-feedback-view', {
  mixins: [MessageViewMixin, Clickable],

  style: `
  layer-feedback-view {
    display: flex;
    flex-direction: row;
  }
  `,
  properties: {
    messageViewContainerTagName: {
      noGetterFromSetter: true,
      value: 'layer-titled-display-container',
    },
    widthType: {
      value: 'flex-width',
    },
  },
  methods: {

    getIconClass() {
      return 'layer-feedback-view-icon';
    },
    getTitle() {
      return this.model.title;
    },

    onCreate() {
      this.addClickHandler('pre-rating', this, this._onClick.bind(this));
      this.classList.add('layer-feedback-view-ratings');
    },

    onRerender() {
      const rating = this.model.isEditable() ? 0 : this.model.rating;
      this.messageViewer.toggleClass('layer-feedback-enabled', this.model.isEditable());
      let text = '';
      for (let i = 1; i <= 5; i++) {
        text += '<span>' + ((i <= rating) ? '\u2605' : '\u2606') + '</span>';
      }
      this.innerHTML = text;
    },

    _onClick(evt) {
      if (!this.model.isEditable()) return;
      let target = evt.target;
      if (target.tagName !== 'SPAN') target = target.parentNode;
      if (target.tagName === 'SPAN') {
        const spans = Array.prototype.slice.call(this.childNodes);
        const index = spans.indexOf(target);
        if (index !== -1) {
          this.model.rating = index + 1;
        }
      }
    },
  },
});

statusMimeTypes.push(FeedbackModel.MIMEType);
