/**
 * Expanded view for the Feedback Message
 *
 * ### Importing
 *
 * Not included with the standard build. Import using:
 *
 * ```
 * import '@layerhq/web-xdk/ui/messages/choice/layer-feedback-message-view';
 * ```
 *
 * @class Layer.UI.messages.FeedbackMessageExpandedView
 * @mixin Layer.UI.messages.MessageViewMixin
 * @mixin Layer.UI.mixins.Clickable
 * @extends Layer.UI.Component
 */
'use strict';

var _component = require('../../components/component');

var _messageViewMixin = require('../message-view-mixin');

var _messageViewMixin2 = _interopRequireDefault(_messageViewMixin);

var _clickable = require('../../mixins/clickable');

var _clickable2 = _interopRequireDefault(_clickable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Snippet from https://stackoverflow.com/questions/2848462/count-bytes-in-textarea-using-javascript/12206089#12206089
function getUTF8Length(s) {
  var len = 0;
  var i = void 0;
  var code = void 0;
  for (i = 0; i < s.length; i++) {
    code = s.charCodeAt(i);
    if (code <= 0x7f) {
      len += 1;
    } else if (code <= 0x7ff) {
      len += 2;
    } else if (code >= 0xd800 && code <= 0xdfff) {
      // Surrogate pair: These take 4 bytes in UTF-8 and 2 chars in UCS-2
      // (Assume next char is the other [valid] half and just skip it)
      len += 4;i++;
    } else if (code < 0xffff) {
      len += 3;
    } else {
      len += 4;
    }
  }
  return len;
} 


(0, _component.registerComponent)('layer-feedback-message-expanded-view', {
  mixins: [_messageViewMixin2.default, _clickable2.default],
  template: '<div class=\'layer-feedback-message-view-label\' layer-id=\'label\'></div><div class=\'layer-feedback-message-view-ratings\' layer-id=\'ratings\'></div><textarea class=\'layer-feedback-message-view-input\' layer-id=\'input\' placeholder=\'Add a comment...\'></textarea><div class=\'layer-feedback-message-view-comment\' layer-id=\'comment\'></div><layer-action-button layer-id=\'button\' text=\'Send\'></layer-action-button>',
  style: 'layer-feedback-message-expanded-view {\ndisplay: flex;\nflex-direction: column;\nalign-items: stretch;\nheight: 100%;\noverflow-y: auto;\n}\nlayer-feedback-message-expanded-view .layer-feedback-message-view-input {\nflex-grow: 1;\n}\nlayer-feedback-message-expanded-view:not(.layer-feedback-enabled) layer-action-button {\ndisplay: none;\n}\nlayer-feedback-message-expanded-view:not(.layer-feedback-enabled) .layer-feedback-message-view-input {\ndisplay: none;\n}\nlayer-feedback-message-expanded-view.layer-feedback-enabled .layer-feedback-message-view-comment {\ndisplay: none;\n}',
  properties: {
    messageViewContainerTagName: {
      noGetterFromSetter: true,
      value: 'layer-dialog-message-view-container'
    },
    widthType: {
      value: 'flex-width'
    },
    maxByteLength: {
      value: 1500
    },
    openActionData: {}
  },
  methods: {
    _getIconClass: function _getIconClass() {
      return 'layer-feedback-message-view-icon';
    },
    _getTitle: function _getTitle() {
      return this.model.title;
    },
    onCreate: function onCreate() {
      this.addClickHandler('rate', this.nodes.ratings, this._onClick.bind(this));
      this.nodes.input.addEventListener('change', this._onInputChange.bind(this));
      this.nodes.input.addEventListener('input', this._onInputEvent.bind(this));
      this.addClickHandler('send', this.nodes.button, this.onSend.bind(this));
    },
    onRerender: function onRerender() {
      this.toggleClass('layer-feedback-enabled', this.model.isEditable());

      if (this.model.sentAt) {
        this.nodes.label.innerText = this.model.getSummary(this.model.summary, true);
      } else if (!this.model.isEditable()) {
        this.nodes.label.innerText = this.model.getSummary(this.model.promptWait, true);
      } else {
        this.nodes.label.innerText = this.model.getSummary(this.model.prompt, true);
      }

      var text = '';
      for (var i = 1; i <= 5; i++) {
        text += '<span>' + (i <= this.model.rating ? '\u2605' : '\u2606') + '</span>';
      }
      this.nodes.ratings.innerHTML = text;
      this.nodes.input.disabled = !this.model.isEditable();
      this.nodes.input.placeholder = this.model.placeholder;
      this.nodes.input.value = this.model.comment;

      this.nodes.comment.innerHTML = this.model.comment.replace(/\n/g, '<br/>');
      this.nodes.button.disabled = !this.model.isEditable() || !this.model.rating;
    },
    _onClick: function _onClick(evt) {
      if (!this.model.isEditable()) return;
      var target = evt.target;
      if (target.tagName !== 'SPAN') target = target.parentNode;
      if (target.tagName === 'SPAN') {
        var spans = Array.prototype.slice.call(this.nodes.ratings.childNodes);
        var index = spans.indexOf(target);
        if (index !== -1) {
          this.model.rating = index + 1;
          this.onRerender();
        }
      }
    },
    _onInputEvent: function _onInputEvent(evt) {
      var maxByteLength = this.properties.maxByteLength;
      var length = getUTF8Length(evt.target.value);
      if (length > maxByteLength) {
        var s = evt.target.value;
        while (length > maxByteLength) {
          s = s.substring(0, s.length - 1);
          length = getUTF8Length(s);
        }
        evt.target.value = s;
      }
    },
    _onInputChange: function _onInputChange(evt) {
      this.model.comment = this.nodes.input.value;
    },
    onSend: function onSend() {
      this.model.comment = this.nodes.input.value;
      this.model.sendFeedback();
      this.messageViewer.destroy();
    }
  }
});