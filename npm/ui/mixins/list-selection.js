/**
 * A List Mixin that add a `selectedId` property to a List.
 *
 * Also listens for `click` and `tap` events to update the `selectedId` property,
 * and triggers selection events.
 *
 * The selection event is controled by the {@link #_selectedItemEventName} provided by each user of this Mixin.
 *
 * @class Layer.UI.mixins.ListSelection
 */
'use strict';

var _settings = require('../../settings');

var _clickable = require('./clickable');

var _clickable2 = _interopRequireDefault(_clickable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


module.exports = {
  mixins: [_clickable2.default],
  properties: {
    /**
     * Get/Set the item shown as selected in the List, selected by Item ID (Conversation ID for example).
     *
     * ```javascript
     * list.selectedId = myConversation.id;
     * ```
     *
     * Or if using a templating engine:
     *
     * ```html
     * <layer-conversation-list selected-id={{selectedConversation.id}}></layer-conversation-list>
     * ```
     *
     * The above code will set the selected Conversation and render the conversation as selected.
     * Note that setting the selectedId triggers a selection event; if `evt.preventDefault()` is called,
     * this property change will be prevented.
     *
     * @property {String} [selectedId='']
     */
    selectedId: {
      set: function set(newId, oldId) {
        var newItem = _settings.client.getObject(newId);
        var isAllowed = true;
        if (newItem || oldId) {
          try {
            isAllowed = this.trigger(this._selectedItemEventName, { item: newItem });
          } catch (e) {
            // No-op
          }
        }
        if (!isAllowed) {
          this.properties.selectedId = oldId;
        } else {
          if (oldId) {
            this.querySelectorAllArray('.layer-selected-item').forEach(function (node) {
              node.isSelected = false;
            });
          }

          if (newId) {
            var node = this.querySelector('#' + this._getItemId(newId));
            if (node) node.isSelected = true;
          }
        }
      }
    },

    /**
     * The event name to trigger on selecting an item.
     *
     * @readonly
     * @private
     * @property {String} _selectedItemEventName
     */
    _selectedItemEventName: {}
  },
  methods: {

    // Setup event handlers
    onCreate: function onCreate() {
      this.addClickHandler('selection-click', this, this._onClick.bind(this));
    },


    // Setup a default selection event name
    onAfterCreate: function onAfterCreate() {
      if (!this.properties._selectedItemEventName) this.properties._selectedItemEventName = 'layer-item-selected';
    },


    /**
     * User has selected something in the List that didn't handle that click event itself and then prevent bubbling up.
     *
     * Find the Item selected and generate a selection event.
     *
     * Listening to the selection event (e.g. `layer-conversation-selected`) you will still receive the original click event
     * in case you wish to process that futher; see `originalEvent` below.
     *
     * Calling `evt.preventDefault()` will prevent selection from occuring.
     *
     * @method _onClick
     * @private
     * @param {Event} evt
     */
    _onClick: function _onClick(evt) {
      var target = evt.target;
      while (target && target !== this && !target._isListItem) {
        target = target.parentNode;
      }

      if (target.item && target._isListItem) {
        evt.preventDefault();
        evt.stopPropagation();
        this.selectedId = target.item.id;
      }
      this.onClick(evt);
    },


    /**
     * MIXIN HOOK: Each time an item is Clicked, you can hook into that by providing an onClick method.
     *
     * > *Note*
     * >
     * > prior to this call, `evt.preventDefault()` and `evt.stopPropagation()` have already been called.
     *
     * This event is not cancelable; see {@link #_selectedItemEventName} for the cancelable event.
     *
     * ```
     * Layer.init({
     *   mixins: {
     *     'my-list': {
     *       methods: {
     *         onClick(evt) {
     *           console.log("User selected ", this.item);
     *         }
     *       }
     *     }
     *   }
     * });
     * ```
     *
     * @method onClick
     * @param {Event} evt
     */
    onClick: function onClick(evt) {
      // No-op
    },


    /*
     * Any time an item is generated, see if it needs to be set as selected.
     */
    onGenerateListItem: function onGenerateListItem(widget) {
      if (widget.item.id === this.selectedId) widget.isSelected = true;
    }
  }
};