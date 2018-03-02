/**
 * The Layer Age widget renders how long ago a date is.
 *
 * Used to to render how long ago an event happened, such as how long since a conversation was active.
 *
 * Provide your own renderer using the Layer.UI.components.Age.ageRenderer property.
 *
 * ### Importing
 *
 * Included if loading the Layer.UI.components.IdentityListPanel.List. If creating a custom build, import:
 *
 * ```
 * import '@layerhq/web-xdk/ui/components/layer-age';
 * ```
 *
 * @class Layer.UI.components.Age
 * @extends Layer.UI.Component
 */
import { registerComponent } from './component';

function getMonthsDiff(a, b) {
  return (a.getFullYear() - b.getFullYear()) * 12 +
     (a.getMonth() - b.getMonth());
}

registerComponent('layer-age', {
  style: `
    layer-age {
      display: block;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  `,
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
     * OR:
     *
     * ```
     * Layer.init({
     *     mixins: {
     *         'layer-age': {
     *             properties: {
     *                 ageRenderer: {
     *                     value: function(value) {
     *                         this.innerHTML = value.toLocalString();
     *                     }
     *                 }
     *             }
     *         }
     *     }
     * });
     * ```
     *
     * @property {Function} [ageRenderer=null]
     * @property {Date} ageRenderer.value
     */
    ageRenderer: {},
  },
  methods: {

    onRender: function onRender() {
      const value = this.date;
      if (this.ageRenderer) {
        this.innerHTML = this.ageRenderer(value);
      } else if (!value) {
        this.innerHTML = 'Never Used';
      } else {
        const today = new Date();
        const twoHours = 2 * 60 * 60 * 1000;
        const twoDays = 2 * 24 * 60 * 60 * 1000;
        const timeDiff = today.getTime() - value.getTime();
        if (timeDiff < twoHours) {
          const minutes = Math.floor(timeDiff / (60 * 1000));
          if (minutes) {
            this.innerHTML = `${minutes} min${minutes > 1 ? 's' : ''} ago`;
          } else {
            this.innerHTML = '';
          }
        } else if (timeDiff < twoDays) {
          const hours = Math.floor(timeDiff / (60 * 60 * 1000));
          this.innerHTML = `${hours} hours ago`;
        } else {
          const monthsDiff = getMonthsDiff(today, value);

          if (monthsDiff < 2) {
            const days = Math.floor(timeDiff / (24 * 60 * 60 * 1000));
            this.innerHTML = `${days} days ago`;
          } else if (monthsDiff < 12) {
            this.innerHTML = `${monthsDiff} months ago`;
          } else {
            const years = today.getFullYear() - value.getFullYear();
            this.innerHTML = `${years} year${years > 1 ? 's' : ''} ago`;
          }
        }
      }
    },
  },
});

