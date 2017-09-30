/**
 * A helper mixin for any widget that wants to refocus when keyboard input is received.
 *
 * Any class using this mixin must provide an `onKeyDown` method.
 *
 * @class layerUI.mixins.FocusOnKeydown
 */
module.exports = {
  methods: {
    onCreate() {
      this.addEventListener('keydown', this._onKeyDown.bind(this));

      // Typically the defaultIndex is -1, but IE11 uses 0.
      // We must be focusable to receive keyboard input
      /* istanbul ignore next */
      const defaultIndex = document.head ? document.head.tabIndex : null;
      if (this.tabIndex === '' || this.tabIndex === -1 || this.tabIndex === defaultIndex) {
        this.tabIndex = -1;
      }
    },

    /**
     * Focus on compose bar if key is pressed within this panel.
     *
     * Unless the focus is on an input or textarea, in which case, let the user type.
     *
     * @method _onKeyDown
     * @param {Event} evt
     * @private
     */
    _onKeyDown(evt) {
      const keyCode = evt.keyCode;
      const metaKey = evt.metaKey;
      const ctrlKey = evt.ctrlKey;
      if (metaKey || ctrlKey) return;

      /* istanbul ignore next */
      if (keyCode >= 65 && keyCode <= 90 || // a-z
          keyCode >= 48 && keyCode <= 57 || // 0-9
          keyCode >= 97 && keyCode <= 111 || // NUMPAD
          keyCode >= 186 && keyCode <= 191 || // Puncuation
          [32, 219, 220, 222].indexOf(keyCode) !== -1) {  // Punctuation
        if (['INPUT', 'TEXTAREA'].indexOf(document.activeElement.tagName) === -1) {
          this.onKeyDown();
        }
      }
    }
  },
};
