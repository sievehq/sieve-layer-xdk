/**
 * The Start of Conversation which renders some customizable welcome message based on the Conversation
 *
 * TODO: Document this
 *
 * @class layer.UI.components.Age
 * @extends Layer.UI.Component
 */
import { registerComponent } from '../../component';

registerComponent('layer-start-of-conversation', {
  properties: {

    /**
     * Conversation that we are at the start of.
     *
     * @property {Layer.Core.Conversation}
     */
    conversation: {
      set(value) {
        if (this.nodes.startDate) {
          this.nodes.startDate.date = value ? value.createdAt : null;
        }
      },
    },


    /**
     * Date formatter configuration for the End of Conversation widget.
     *
     * Use this to configure how dates are rendered.
     * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString for details
     * on the parameters that are supported by `toLocaleString`.
     *
     * There are four supported inputs
     *
     * * `today`: How to render dates that are today
     * * `week`: How to render dates that are not today, but within a 6 of today (note if today is
     *   wednesday, 1 week ago is also wednesday, and rendering `wednesday` would be confusing, so its 6 rather than 7 days.
     * * `default`: The default format to use
     * * `older`: The format to use for dates that are in a different year and more than 6 months in the past
     *
     * Example:
     *
     * ```
     * widget.dateFormat = {
     *    today: {"hour": "numeric", "minute": "numeric"},
     *    week: {"weekday": "short"},
     *    default: {"month": "short", "day": "2-digit"},
     *    older: {"month": "short", "year": "numeric"}
     * }
     * ```
     *
     * @property {Object} [dateFormat=]
     * @property {Object} [dateFormat.today={hour: 'numeric', minute: 'numeric'}]
     * @property {Object} [dateFormat.week={ weekday: 'short', hour: 'numeric', minute: 'numeric' }]
     * @property {Object} [dateFormat.older={ month: 'short', year: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }]
     * @property {Object} [dateFormat.default={ month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }]
     */
    dateFormat: {
      set(value) {
        if (this.nodes.startDate) {
          Object.keys(value).forEach((name) => {
            this.nodes.startDate[name] = value[name];
          });
        }
      },
    },
  },
});

