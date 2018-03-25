/**
 * A Button Set driven by a Layer.UI.messages.ChocieMessageModel.
 *
 * The main input is the {@link #model}, and any events are delivered to and handled by that model
 *
 * ### Importing
 *
 * Included directly by any Message Type View that requires it. If creating a custom build, import:
 *
 * ```
 * import '@layerhq/web-xdk/ui/components/layer-choice-button';
 * ```
 *
 * @class Layer.UI.components.ChoiceButton
 * @extends Layer.UI.Component
 * @mixin Layer.UI.mixins.Clickable
 */
'use strict';

var _component = require('./component');

var _clickable = require('../mixins/clickable');

var _clickable2 = _interopRequireDefault(_clickable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


(0, _component.registerComponent)('layer-choice-button', {
  mixins: [_clickable2.default],
  style: 'layer-choice-button {\ndisplay: flex;\nflex-direction: row;\nalign-content: stretch;\n}\nlayer-choice-button layer-action-button {\ncursor: pointer;\nflex-grow: 1;\nwidth: 50px; // flexbox bug\n}\n.layer-button-content > * {\nmax-width: 100%;\nwidth: 100%;\n}',
  // Note that there is also a message property managed by the MessageHandler mixin
  properties: {
    /**
     * Set all choices enabled or disabled
     *
     * @property {Boolean} [disabled=false]
     */
    disabled: {
      type: Boolean,
      set: function set(value) {
        for (var i = 0; i < this.childNodes.length; i++) {
          this.childNodes[i].disabled = value;
        }
      }
    },

    /**
     * The Choice Model whose options are to be rendered.
     *
     * @property {Layer.UI.messages.ChoiceMessageModel} model
     */
    model: {
      set: function set(newModel, oldModel) {
        var _this = this;

        if (oldModel) {
          this.model.off(null, null, this);
          this.properties.buttons = [];
          this.innerHTML = '';
        }
        if (newModel) {
          newModel.on('message-type-model:change', this.onRerender, this);
          newModel.choices.forEach(function (choice, index) {
            var widget = _this.createElement('layer-action-button', {
              text: newModel.getText(index),
              tooltip: newModel.getTooltip(index),
              parentNode: _this,
              data: { id: choice.id },
              icon: choice.icon
            });

            var def = { widget: widget, choice: choice };
            _this.properties.buttons.push(def);
            widget.removeClickHandler('button-click', widget);
            _this.addClickHandler('button-click-' + choice.id, widget, _this._onClick.bind(_this, def));
            _this.onRerender();
          });
        }
      }
    }
  },

  methods: {
    onCreate: function onCreate() {
      this.properties.buttons = [];
    },


    /**
     * Whenever the model changes, update the selection state of all buttons.
     *
     * Also update any text/tooltip whenever the model changes.
     *
     * @method onRerender
     */
    onRerender: function onRerender() {
      if (!this.model.allowReselect) {
        this.toggleClass('layer-choice-message-view-complete', this.model.selectedAnswer);
      }

      for (var i = 0; i < this.childNodes.length; i++) {
        var child = this.childNodes[i];
        var isSelected = this.model.isSelectedIndex(i);
        child.disabled = !this.model.isSelectionEnabled() || isSelected && !this.model.allowDeselect;
        child.selected = isSelected;

        this.childNodes[i].text = this.model.getText(i);
        this.childNodes[i].tooltip = this.model.getTooltip(i);
      }
    },
    onChoiceSelect: function onChoiceSelect(data) {
      this.model.selectAnswer(data);
    },


    /**
     * When clicked, find the associated Layer.UI.messages.MessageViewer and call its `_runAction` method.
     *
     * @param {Object} boundData
     * @param {Object} choice   The choice represented by this button
     * @param {Event} evt
     */
    _onClick: function _onClick(_ref, evt) {
      var choice = _ref.choice;

      evt.preventDefault();
      evt.stopPropagation();

      // Select the answer
      this.onChoiceSelect(choice);

      // Trigger any other customized events as though this were an action button
      var node = this;
      while (!node.isMessageTypeView && node.parentComponent) {
        node = node.parentComponent;
      }
      if (node.messageViewer) {
        node.messageViewer._runAction({
          event: this.model.responseName,
          data: this.model,
          choice: choice
        });
      }
      if (evt) evt.target.blur();
    }
  }
});