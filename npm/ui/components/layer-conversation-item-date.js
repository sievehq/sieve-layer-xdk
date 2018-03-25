/**
 * The Layer Date widget renders a date.
 *
 * This is provided as a specialized component so that it can be easily redefined by your app to
 * provide your own date formatting.  Note that most customization of date rendering can be accomplished instead
 * using Layer.UI.components.ConversationView.dateRenderer.
 *
 * ```
 * Layer.init({
 *     mixins: {
 *         'layer-conversation-item-date', {
 *             methods: {
 *                 onRender: {
 *                     modes: Layer.UI.registerComponent.MODES.OVERWRITE,
 *                     value: function() {
 *                         this.value = this.date.toISOString();
 *                     }
 *              }
 *          }
 *      }
 * });
 * ```
 *
 * TODO: Needs to reuse not rewrite code from `<layer-date />`
 *
 * ### Importing
 *
 * Import this using
 *
 * ```
 * import '@layerhq/web-xdk/ui/components/layer-conversation-item-date';
 * ```
 *
 * @class Layer.UI.components.ConversationItemDate
 * @extends Layer.UI.Component
 */
'use strict';

var _component = require('./component');

var LayerDate = {
  style: 'layer-conversation-item-date {\ndisplay: block;\nwhite-space: nowrap;\ntext-overflow: ellipsis;\noverflow: hidden;\n}',
  properties: {
    defaultFormat: {
      value: { hour: '2-digit', minute: '2-digit' },
      set: function set(value) {
        if (typeof value === 'string') {
          try {
            this.properties.defaultFormat = JSON.parse(value);
          } catch (e) {
            this.properties.defaultFormat = {};
          }
        }
        this.onRender();
      }
    },

    todayFormat: {
      set: function set(value) {
        if (typeof value === 'string') {
          try {
            this.properties.todayFormat = JSON.parse(value);
          } catch (e) {
            // No-op
          }
        }
        this.onRender();
      }
    },

    weekFormat: {
      set: function set(value) {
        if (typeof value === 'string') {
          try {
            this.properties.weekFormat = JSON.parse(value);
          } catch (e) {
            // No-op
          }
        }
        this.onRender();
      }
    },
    olderFormat: {
      set: function set(value) {
        if (typeof value === 'string') {
          try {
            this.properties.olderFormat = JSON.parse(value);
          } catch (e) {
            // No-op
          }
        }
        this.onRender();
      }
    },

    /**
     * Date to be rendered
     *
     * TODO: We do not need seconds in a typical date output; need to investigate how to do that with localizations
     *
     * @property {Date} [date=null]
     */
    date: {
      set: function set(value) {
        this.setAttribute('title', value ? value.toLocaleString() : '');
        this.onRender();
      }
    },

    /**
     * The actual rendered string.
     *
     * @property {String} [value='']
     */
    value: {
      set: function set(value) {
        this.innerHTML = value;
      }
    },

    /**
     * Provide property to override the function used to render a date for each Message Item.
     *
     * Note that changing this will not regenerate the list; this should be set when initializing a new List.
     *
     * ```javascript
     * dateItem.dateRenderer = function(date) {
     *    return date.toISOString();
     * };
     * ```
     *
     * @property {Function} [dateRender=null]
     */
    dateRenderer: {}
  },
  methods: {
    onRender: function onRender() {
      var value = this.date;
      if (value) {
        if (this.dateRenderer) {
          this.value = this.dateRenderer(value);
        } else {
          var today = new Date();
          var isToday = value.toLocaleDateString() === today.toLocaleDateString();
          var isWeek = value.getTime() > today.getTime() - 6 * 24 * 60 * 60 * 1000;
          var isThisYear = today.getFullYear() === value.getFullYear();

          var format = void 0;
          if (isToday && this.todayFormat) {
            format = this.todayFormat;
          } else if (isWeek && this.weekFormat) {
            format = this.weekFormat;
          } else if (!isThisYear && this.olderFormat) {
            format = this.olderFormat;
          } else {
            format = this.defaultFormat;
          }

          // Note that the first parameter should be 'lookup' but not supported on edge v12
          this.value = value.toLocaleString(navigator.language, format);
        }
      } else {
        this.value = '';
      }
    }
  }
}; 


(0, _component.registerComponent)('layer-conversation-item-date', LayerDate);
module.exports = LayerDate;