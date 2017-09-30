/**
 * Handler that manages click vs tap event handling
 *
 * @class layerUI.mixins.Clickable
 */
module.exports = {
  methods: {
    removeClickHandler(name, target) {
      if (this.properties.onClickFn && this.properties.onClickFn[name]) {
        target.removeEventListener('click', this.properties.onClickFn[name]);
        target.removeEventListener('tap', this.properties.onClickFn[name]);
      }
    },
    addClickHandler(name, target, fn) {
      if (!this.properties.onClickFn) this.properties.onClickFn = {};
      this.properties.onClickFn[name] = function onClickFn(evt) {

        // Without this test, we block links from opening and probably buttons from clicking and inputs from focusing
        const clickableTargets = ['A', 'INPUT', 'BUTTON', 'TEXTAREA', 'SELECT'];
        if (clickableTargets.indexOf(evt.target.tagName) === -1) {
          // if tap event, prevent the click handler from firing causing a double event occurance
          evt.preventDefault();
        }
        fn(evt);
      };
      target.addEventListener('tap', this.properties.onClickFn[name]);
      target.addEventListener('click', this.properties.onClickFn[name]);
    },
  },
};
