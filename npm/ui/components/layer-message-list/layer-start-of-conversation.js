/**
 * The Start of Conversation which renders some customizable welcome message based on the Conversation
 *
 * TODO: Document this
 *
 * ### Importing
 *
 * Included with the standard build. If creating a custom build, import:
 *
 * ```
 * import '@layerhq/web-xdk/ui/components/layer-message-list/layer-start-of-conversation';
 * ```
 *
 * @class Layer.UI.components.MessageListPanel.StartOfConversation
 * @extends Layer.UI.Component
 */
'use strict';

var _component = require('../component');

/* eslint-disable max-len */
(0, _component.registerComponent)('layer-start-of-conversation', {
  template: 'Conversation began\n<layer-date layer-id=\'startDate\'\ndefault-format=\'{"month": "long", "year": "numeric", "day": "numeric", "hour": "numeric", "minute": "numeric" }\'\ntoday-format=\'{"hour": "numeric", "minute": "numeric"}\' week-format=\'{"weekday": "long", "hour": "numeric", "minute": "numeric"}\'></layer-date>',
  /* eslint-enable max-len */
  style: 'layer-start-of-conversation {\ndisplay: block;\nwhite-space: nowrap;\ntext-overflow: ellipsis;\noverflow: hidden;\nvisibility: hidden;\n}\nlayer-start-of-conversation.layer-has-conversation {\nvisibility: visible;\n}\nlayer-start-of-conversation layer-date {\ndisplay: inline;\n}',
  properties: {

    /**
     * Conversation that we are at the start of.
     *
     * @property {Layer.Core.Conversation}
     */
    conversation: {
      set: function set(value) {
        this.toggleClass('layer-has-conversation', value);
        if (this.nodes.startDate) {
          if (value && value.isLoading) {
            value.once(value.constructor.eventPrefix + ':loaded', this._onConversationChange, this);
          }
          this.nodes.startDate.date = value ? value.createdAt : null;
        }
      }
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
      set: function set(value) {
        var _this = this;

        if (this.nodes.startDate) {
          Object.keys(value).forEach(function (name) {
            _this.nodes.startDate[name] = value[name];
          });
        }
      }
    }
  },
  methods: {
    _onConversationChange: function _onConversationChange(evt) {
      this.nodes.startDate.date = this.conversation.createdAt;
    }
  }
}); 