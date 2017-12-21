/**
 * Handler that manages click vs tap event handling.
 *
 * Goals:
 *
 * 1. Subscribe for tap events which are typically faster and more responsive than click events
 * 2. Subscribe for click events as our users may have a mouse
 * 3. Avoid triggering events twice due to the firing of both events
 *
 * @class Layer.UI.mixins.Clickable
 * @protected
 */
module.exports = {
  methods: {

    /**
     * Remove a Click Handler from the target.
     *
     * Does not check the function to insure it matches, it simply uses the unique name event subscription.
     *
     * ```
     * widget.removeClickHandler('listen-for-click', widget);
     * widget.removeClickHandler('listen-for-click-on-child', widget.nodes.child);
     * ```
     *
     * @method removeClickHandler
     * @param {String} name         Unique name given to the event listener
     * @param {HTMLElement} target  Node that is being watched
     */
    removeClickHandler(name, target) {
      if (this.properties.onClickFn && this.properties.onClickFn[name]) {
        target.removeEventListener('click', this.properties.onClickFn[name]);
        target.removeEventListener('tap', this.properties.onClickFn[name]);
      }
    },

    /**
     * Adds a named event handler to listen for tap and click events on the specified node.
     *
     * Its assumed that the target node is either this entire UI Component or a subcomponent of this component.
     *
     * The name is any custom unique string.
     *
     * You do not need to maintain a pointer to the function to later remove the event handler.
     *
     * ```
     * widget.addClickHandler('listen-for-click', widget, this.myFn.bind(this));
     * widget.addClickHandler('listen-for-click-on-child', widget.nodes.child, this.myFn.bind(this));
     * ```
     *
     * @method addClickHandler
     * @param {String} name         Any unique string
     * @param {HTMLElement} target  Target of events to listen for
     * @param {Function} fn         Handler to call when the event occurs
     */
    addClickHandler(name, target, fn) {
      if (!this.properties.onClickFn) this.properties.onClickFn = {};
      this.properties.onClickFn[name] = function onClickFn(evt) {

        // Without this test, we block links from opening and probably buttons from clicking and inputs from focusing
        // This is frankly kind of hazardous and we will either need to have a way to add more nodes here or we'll
        // need to rip this out entirely (or allow customers to)
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
