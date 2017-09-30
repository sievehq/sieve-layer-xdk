/**
 * A helper mixin for Lists that render alternate text in the event that the list is Empty.
 *
 * @class layerUI.mixins.Throttler
 */
module.exports = {
  properties: {
    /**
     * A throttler is used to prevent excessive scroll events.
     *
     * This timeout indicates how frequently scroll events are allowed to fire in miliseconds.
     * This value should not need to be tinkered with.
     *
     * @property {Number} [throttlerTimeout=66]
     */
    throttlerTimeout: {
      value: 66,
    },
  },
  methods: {
    /**
     * Simple throttler to avoid too many events while scrolling.
     *
     * Not at this time safe for handling multiple types of events at the same time.
     *
     * @method _throttler
     * @private
     */
    _throttler(callback) {
      if (!this.properties.throttleTimeout) {
        this.properties.throttleTimeout = setTimeout(() => {
          this.properties.throttleTimeout = null;
          callback();
        }, this.throttlerTimeout);
      }
    },
  },
};
