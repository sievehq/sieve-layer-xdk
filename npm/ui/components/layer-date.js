/**
 * The Layer Date widget renders a date.
 *
 * This is provided as a specialized component so that it can be easily redefined by your app to
 * provide your own date formatting.  Note that there are four techniques for formatting Dates:
 *
 * 1. Use Layer.UI.components.ConversationView.dateFormat to specify formatting options
 * 2. Use Layer.UI.components.ConversationView.dateRenderer to provide your own string generation
 * 3. Use Mixins to customize the `onRender` method
 * 4. Define a whole new `<layer-date />` widget
 *
 * ```
 * Layer.init({
 *     mixins: {
 *         'layer-date', {
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
 * ### Importing
 *
 * Included in the default build. If creating a custom build, import:
 *
 * ```
 * import '@layerhq/web-xdk/ui/components/layer-date';
 * ```
 *
 * @class Layer.UI.components.Date
 * @extends Layer.UI.Component
 */
'use strict';

var _component = require('./component');

var LayerDate = {
  style: 'layer-date {\ndisplay: block;\nwhite-space: nowrap;\ntext-overflow: ellipsis;\noverflow: hidden;\n}',
  properties: {

    /**
     * The format setting to use if no other format is provided.
     *
     * ```
     * widget.defaultFormat = {
     *     hour: '2-digit',
     *     minute: '2-digit'
     * };
     * ```
     *
     * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString for details
     * on the parameters that are supported by `toLocaleString`.
     *
     * @property {Object} defaultFormat
     */
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

    /**
     * The format options to use if rendering a date that is today.
     *
     * widget.todayFormat = {
     *     hour: '2-digit',
     *     minute: '2-digit',
     *     year: 'numeric'
     * };
     * ```
     *
     * @property {Object} todayFormat
     */
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

    /**
     * The format options to use if rendering a date that is not today, but is this week.
     *
     * widget.weekFormat = {
     *     weekday: "short"
     * };
     * ```
     *
     * @property {Object} weekFormat
     */
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

    /**
     * The format options to use if rendering a date that is not from this week
     *
     * widget.olderFormat = {
     *     weekday: "short",
     *     hour: '2-digit',
     *     minute: '2-digit',
     *     year: 'numeric'
     * };
     * ```
     *
     * @property {Object} olderFormat
     */
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
     * @property {Date} [date=null]
     */
    date: {
      set: function set(value) {
        this.setAttribute('title', value ? value.toLocaleString() : '');
        this.onRender();
      }
    },

    /**
     * The `value` is the HTML to be rendered; similar to `innerHTML` but allows for processing if needed.
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
    dateRenderer: {
      get: function get() {
        return this.properties.dateRenderer || this.parentComponent && this.parentComponent.dateRenderer;
      }
    }
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


(0, _component.registerComponent)('layer-date', LayerDate);
module.exports = LayerDate;