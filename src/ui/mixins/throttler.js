/**
 * A helper mixin for adding throttling to any component.
 *
 * This code only calls `fn` once:
 *
 * ```
 * this._throttler(fn);
 * this._throttler(fn);
 * this._throttler(fn);
 * ```
 *
 * @class Layer.UI.mixins.Throttler
 */
module.exports = {
  properties: {
    /**
     * A throttler is used to prevent excessive scroll events.
     *
     * This timeout indicates how frequently scroll events are allowed to fire in miliseconds.
     * This value should not need to be tinkered with.
     *
     * @property {Number} [_throttlerTimeout=66]
     * @protected
     */
    _throttlerTimeout: {
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
     * @protected
     */
    _throttler(callback) {
      if (!this.properties.throttleTimeout) {
        this.properties.throttleTimeout = setTimeout(() => {
          this.properties.throttleTimeout = null;
          callback();
        }, this._throttlerTimeout);
      }
    },
  },
};
