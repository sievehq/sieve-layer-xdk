/**
 *
 * @class
 * @extends Layer.UI.Component
 */
'use strict';

var _component = require('../../components/component');

var _messageViewMixin = require('../message-view-mixin');

var _messageViewMixin2 = _interopRequireDefault(_messageViewMixin);

var _constants = require('../../constants');

var _constants2 = _interopRequireDefault(_constants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _component.registerComponent)('layer-message-type-list-view', {
  template: '',
  style: 'layer-message-type-list-view {\ndisplay: flex;\nflex-direction: column;\n}\nlayer-message-type-list-view > layer-message-viewer {\nmargin: 2px;\nmax-width: 100% !important;\n}',

  mixins: [_messageViewMixin2.default],

  // Note that there is also a message property managed by the MessageHandler mixin
  properties: {
    messageViewContainerTagName: {
      value: null
    },
    widthType: {
      value: _constants2.default.WIDTH.FLEX
    },
    cardBorderStyle: {
      value: 'none'
    }
  },
  methods: {
    onRerender: function onRerender() {
      var _this = this;

      if (!this.properties._internalState.onAttachCalled) return;

      // console.log("CAROUSEL onRERENDER");
      // TODO: Assign items ids so we don't need to blow away and then recreate them
      this.innerHTML = '';
      this.model.items.forEach(function (item) {
        // console.log('GENERATE: ' + item.id + '    ' + item.title);
        var ui = _this.createElement('layer-message-viewer', {
          message: _this.model.message,
          rootPart: item.part,
          model: item,
          parentNode: _this
        });
        ui.classList.add('layer-root-viewer');
      });
    }
  }
}); 