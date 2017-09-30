/**
 * A helper mixin for Lists that render alternate text in the event that the list is Empty.
 *
 * @class layerUI.mixins.EmptyList
 */
module.exports = {
  properties: {
    /**
     * If the query has no data and is not loading data, this should be true.
     *
     * @property {Boolean} [isEmptyList=false]
     * @readonly
     */
    isEmptyList: {
      value: false,
      set(value) {
        this.nodes.emptyNode.style.display = value ? '' : 'none';
      },
    },

    /**
     * A dom node to render when there are no messages in the list.
     *
     * Could just be a message "Empty Conversation".  Or you can add interactive widgets.
     *
     * @property {HTMLElement} [emptyNode=null]
     * @removed See replaceableContent instead
     */
  },
  methods: {
    onRender() {
      this.nodes.emptyNode.style.display = this.isEmptyList ? '' : 'none';
      if (this.emptyNode) this.nodes.emptyNode.appendChild(this.emptyNode);
    },

    /**
     * Call this on any Query change events.
     *
     * @method onRerender
     * @private
     * @param {Event} evt
     */
    onRerender(evt = {}) {
      if (this.query.isDestroyed) {
        this.isEmptyList = false;
      } else {
        this.isEmptyList = evt.type !== 'reset' && this.query.data.length === 0;
      }
    },
  }
};