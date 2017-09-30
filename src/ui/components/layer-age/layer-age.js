/**
 * The Layer Age widget renders how long ago a date is.
 *
 * TODO: Document this
 *
 * @class layerUI.components.Age
 * @extends layerUI.components.Component
 */
import { registerComponent } from '../component';

function getMonthsDiff(a, b) {
  return (a.getFullYear() - b.getFullYear()) * 12 +
     (a.getMonth() - b.getMonth());
}

registerComponent('layer-age', {
  properties: {

    /**
     * Date to be rendered
     *
     * @property {Date} [date=null]
     */
    date: {
      set(value) {
        this.setAttribute('title', value ? value.toLocaleString() : '');
        this.onRender();
      },
    },

    /**
     * The actual rendered string.
     *
     * @property {String} [value='']
     */
    value: {
      set(value) {
        this.innerHTML = value;
      },
    },

    /**
     * Provide property to override the function used to render a date for each Message Item.
     *
     * Note that changing this will not regenerate the list; this should be set when initializing a new List.
     *
     * ```javascript
     * dateItem.ageRenderer = function(date) {
     *    return date.toISOString();
     * };
     * ```
     *
     * @property {Function} [dateRender=null]
     */
    ageRenderer: {},
  },
  methods: {

    onRender: function onRender() {
      const value = this.date;
      if (value) {
        if (this.ageRenderer) {
          this.value = this.ageRenderer(value);
        } else {
          const today = new Date();
          const twoHours = 2 * 60 * 60 * 1000;
          const twoDays = 2 * 24 * 60 * 60 * 1000;
          const timeDiff = today.getTime() - value.getTime();
          if (timeDiff < twoHours) {
            const minutes = Math.floor(timeDiff/(60*1000));
            if (minutes) {
              this.value = `${minutes} min${minutes > 1 ? 's' : ''} ago`;
            } else {
              this.value = '';
            }
          } else if (timeDiff < twoDays) {
            const hours = Math.floor(timeDiff/(60*60*1000));
            this.value = `${hours} hours ago`;
          } else {
            const monthsDiff = getMonthsDiff(today, value);

            if (monthsDiff < 2) {
              const days = Math.floor(timeDiff/(24*60*60*1000));
              this.value = `${days} days ago`;
            } else if (monthsDiff < 12) {
              this.value = `${monthsDiff} months ago`;
            } else {
              const years = today.getFullYear() - value.getFullYear();
              this.value = `${years} year${years > 1 ? 's' : ''} ago`;
            }
          }
        }
      } else {
        this.value = 'Never Used';
      }
    },
  },
});
