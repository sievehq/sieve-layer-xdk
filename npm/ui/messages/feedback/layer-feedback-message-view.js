/**
 * Feedback message allows a user to request a rating and comment from another user.
 *
 * ### Importing
 *
 * Not included with the standard build. Import using:
 *
 * ```
 * import '@layerhq/web-xdk/ui/messages/choice/layer-feedback-message-view';
 * ```
 *
 *
 * @class Layer.UI.messages.FeedbackMessageView
 * @mixin Layer.UI.messages.MessageViewMixin
 * @mixin Layer.UI.mixins.Clickable
 * @extends Layer.UI.Component
 */
'use strict';

var _component = require('../../components/component');

var _uiUtils = require('../../ui-utils/');

var _layerFeedbackMessageModel = require('./layer-feedback-message-model');

var _layerFeedbackMessageModel2 = _interopRequireDefault(_layerFeedbackMessageModel);

var _messageViewMixin = require('../message-view-mixin');

var _messageViewMixin2 = _interopRequireDefault(_messageViewMixin);

var _clickable = require('../../mixins/clickable');

var _clickable2 = _interopRequireDefault(_clickable);

require('./layer-feedback-message-expanded-view');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


(0, _component.registerComponent)('layer-feedback-message-view', {
  mixins: [_messageViewMixin2.default, _clickable2.default],

  style: 'layer-feedback-message-view {\ndisplay: flex;\nflex-direction: row;\njustify-content: center;\n}',
  properties: {
    messageViewContainerTagName: {
      noGetterFromSetter: true,
      value: 'layer-titled-message-view-container'
    },
    widthType: {
      value: 'flex-width'
    },
    cssClassList: {
      value: ['layer-feedback-message-view-ratings']
    }
  },
  methods: {
    _getIconClass: function _getIconClass() {
      return 'layer-feedback-message-view-icon';
    },
    _getTitle: function _getTitle() {
      return this.model.title;
    },
    onCreate: function onCreate() {
      this.addClickHandler('pre-rating', this, this._onClick.bind(this));
    },
    onRerender: function onRerender() {
      var rating = this.model.rating || 0;
      this.messageViewer.toggleClass('layer-feedback-enabled', this.model.isEditable());
      var text = '';
      for (var i = 1; i <= 5; i++) {
        text += '<span>' + (i <= rating ? '\u2605' : '\u2606') + '</span>';
      }
      this.innerHTML = text;
    },
    _onClick: function _onClick(evt) {
      if (!this.model.isEditable()) return;
      var target = evt.target;
      if (target.tagName !== 'SPAN') target = target.parentNode;
      if (target.tagName === 'SPAN') {
        var spans = Array.prototype.slice.call(this.childNodes);
        var index = spans.indexOf(target);
        if (index !== -1) {
          this.model.rating = index + 1;
        }
      }
    }
  }
});

(0, _uiUtils.registerStatusModel)(_layerFeedbackMessageModel2.default.MIMEType);