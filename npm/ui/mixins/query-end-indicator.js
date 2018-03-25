/**
 * A helper mixin for Lists that want an indicator to render when paging through data, that there is no more data to page in.
 *
 * This is not a necessary feature, but is nicer than just failing to show a "Loading messages" message and assuming that they can
 * take a hint.
 *
 * Note that `isEndOfResults` is always `false` if a query has no results.
 *
 * This mixin requires "layer-id=endOfResultsNode" to exist in the template for any component using this mixin.
 *
 * @class Layer.UI.mixins.QueryEndIndicator
 */
'use strict';

var _utils = require('../../utils');

var _utils2 = _interopRequireDefault(_utils);

var _component = require('../components/component');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


module.exports = {
  properties: {
    /**
     * If the query has no more data to load but is not empty, this should be true.
     *
     * @property {Boolean} [isEndOfResults=false]
     * @readonly
     */
    isEndOfResults: {
      value: false,
      set: function set(value) {
        this.toggleClass('layer-end-of-results', value && !this.isEmptyList);
      }
    }

    /**
     * A dom node to render when there are no messages in the list.
     *
     * Could just be a message "Empty Conversation".  Or you can add interactive widgets.
     * Note that using the default template, this widget may be wrapped in a div with CSS class `layer-header-toggle`,
     * you should insure that they height of this toggle does not change when your custom node is shown.  Set the
     * style height to be at least as tall as your custom node.
     *
     * @property {HTMLElement} [endOfResultsNode=null]
     * @removed See replaceableContent instead
     */
  },
  methods: {
    onRender: function onRender() {
      if (this.query && this.query.data && this.query.data.length === 0) this.isEndOfResults = true;
    },


    /**
     * Call this after rendering any query-paged data.
     *
     * @method _renderPagedDataDone
     * @private
     * @param {Event} evt
     */
    _renderPagedDataDone: {
      mode: _component.registerComponent.MODES.BEFORE,
      value: function _renderPagedDataDone() {
        var _this = this;

        var evt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        if (this.query.isDestroyed) {
          this.isEndOfResults = false;
        } else {
          _utils2.default.defer(function () {
            _this.isEndOfResults = _this.query.pagedToEnd;
          });
        }
      }
    }
  }
};