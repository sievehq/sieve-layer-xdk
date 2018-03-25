/**
 * Represents a single Choice among many Choices within the Layer.UI.messages.ChoiceMessageModel model.
 *
 * ### Importing
 *
 * Not included with the standard build. Import using:
 *
 * ```
 * import '@layerhq/web-xdk/ui/messages/choice/layer-choice-message-view';
 * ```
 *
 * @class Layer.UI.messages.ChoiceMessageItemModel
 * @extends Layer.Core.Root
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = require('../../../core');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } 

var ChoiceItem = function (_Root) {
  _inherits(ChoiceItem, _Root);

  function ChoiceItem(options) {
    _classCallCheck(this, ChoiceItem);

    if (options.custom_response_data) {
      options.customResponseData = options.custom_response_data;
      delete options.custom_response_data;
    }
    return _possibleConstructorReturn(this, (ChoiceItem.__proto__ || Object.getPrototypeOf(ChoiceItem)).call(this, options));
  }

  _createClass(ChoiceItem, [{
    key: 'getSelectedText',
    value: function getSelectedText() {
      if (this.states && this.states.selected && this.states.selected.text) {
        return this.states.selected.text;
      } else {
        return this.text;
      }
    }
  }, {
    key: 'getDefaultText',
    value: function getDefaultText() {
      if (this.states && this.states.default && this.states.default.text) {
        return this.states.default.text;
      } else {
        return this.text;
      }
    }
  }, {
    key: 'getSelectedTooltip',
    value: function getSelectedTooltip() {
      if (this.states && this.states.selected && this.states.selected.tooltip) {
        return this.states.selected.tooltip;
      } else {
        return this.tooltip;
      }
    }
  }, {
    key: 'getDefaultTooltip',
    value: function getDefaultTooltip() {
      if (this.states && this.states.default && this.states.default.tooltip) {
        return this.states.default.tooltip;
      } else {
        return this.tooltip;
      }
    }
  }, {
    key: 'toSnakeCase',
    value: function toSnakeCase() {
      var obj = {};
      obj.id = this.id;
      if (this.text) obj.text = this.text;
      if (this.tooltip) obj.tooltip = this.tooltip;
      if (this.states) obj.states = this.states;
      if (this.customResponseData) obj.custom_response_data = this.customResponseData;
      return obj;
    }
  }]);

  return ChoiceItem;
}(_core.Root);

ChoiceItem.prototype.text = '';
ChoiceItem.prototype.tooltip = '';
ChoiceItem.prototype.id = '';
ChoiceItem.prototype.states = null;
ChoiceItem.prototype.customResponseData = null;

_core.Root.initClass.apply(ChoiceItem, [ChoiceItem, 'ChoiceItem']);
module.exports = ChoiceItem;