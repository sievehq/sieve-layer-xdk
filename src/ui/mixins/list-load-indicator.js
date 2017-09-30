/**
 * A helper mixin for Lists that want an indicator to render when paging through data, that data is currently loading.
 *
 * This is not a necessary feature, but is nicer than just reaching the end of the list and waiting.
 *
 *
 * This mixin requires "layer-id=loadIndicator" to exist in the template for any component using this mixin.
 *
 * @class layerUI.mixins.ListLoadIndicator
 */
import '../components/layer-loading-indicator/layer-loading-indicator';

module.exports = {
  properties: {
    isDataLoading: {
      set(value) {
        this.classList[value ? 'add' : 'remove']('layer-loading-data');
      },
    },

    /**
     * A dom node to render when data is loading for the list.
     *
     * Could just be a message "Messages Loading...".  Or you can add interactive widgets.
     * Note that using the default template, this widget may be wrapped in a div with CSS class `layer-header-toggle`,
     * you should insure that they height of this toggle does not change when your custom node is shown.  Set the
     * style height to be at least as tall as your custom node.
     *
     * @property {HTMLElement} [dataLoadingNode=null]
     * @removed See replaceableContent instead
     */
  },
};