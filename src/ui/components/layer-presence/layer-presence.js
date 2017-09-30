/**
 * The Layer Presence widget renders an icon representing a user's status of Available, Away, Busy or Offline.
 *
 * If using it outside of the Avatar widget, make sure you set `layerPresenceWidget.item = identity`.  Most common usage is:
 *
 * ```
 * document.getElementById('mypresencewidget').item = client.user;
 * ```
 *
 * The simplest way to customize this widget is to replace it with your own implementation of the `<layer-presence />` tag.
 *
 * ```javascript
 * layerUI.registerComponent('layer-presence', {
 *    properties: {
 *      item: {
 *        set: function(value) {
 *           this.onRender();
 *           if (value) value.on('identity:changes', this.onRerender, this);
 *        }
 *      }
 *    },
 *    methods: {
 *      onRender: function() {
 *        this.onRerender();
 *      },
 *      onRerender: function() {
 *        this.className = 'my-presence-' + this.item.status;
 *      },
 *    }
 * });
 *
 * // Call init after custom components are defined
 * layerUI.init({
 *   appId:  'layer:///apps/staging/UUID'
 * });
 * ```
 *
 * @class layerUI.components.Presence
 * @extends layerUI.components.Component
 * @mixin layerUI.mixins.MainComponent
 */
import Core from '../../../core';
import { registerComponent } from '../component';
import SizeProperty from '../../mixins/size-property';
import Clickable from '../../mixins/clickable';

registerComponent('layer-presence', {
  mixins: [SizeProperty, Clickable],

  /**
   * The user has clicked on the `<layer-presence />` widget
   *
   * @event layer-presence-click
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Core.Identity} evt.detail.item - The user rendered by this Presence Widget
   */

  /**
   * The user has clicked on the `<layer-presence />` widget
   *
   * @property {Function} onPresenceClick
   * @param {Event} onPresenceClick.evt
   * @param {Object} onPresenceClick.evt.detail
   * @param {layer.Core.Identity} onPresenceClick.evt.detail.item - The user rendered by this Presence Widget
   */
  events: ['layer-presence-click'],
  properties: {

    /**
     * User whose status is represented here
     *
     * Typically this only has one user represented with a layer.Core.Identity.
     *
     * @property {layer.Core.Identity}
     */
    item: {
      set(value) {
        if (value) {
          if (value instanceof Core.Message) {
            value = value.sender;
          } else if (value instanceof Core.Conversation) {
            value = value.participants.filter(identity => !identity.sessionOwner)[0];
          } else if (typeof value === 'object' && !(value instanceof Core.Identity)) {
            const client = Core.Client.getClient(value.clientId);
            if (client) {
              value = client.getIdentity(value.id);
            }
          }

          if (!(value instanceof Core.Identity)) {
            value = null;
          }
          this.properties.item = value;
        }
        if (value) value.on('identities:change', this.onRerender, this);
        this.onRender();
      },
    },

    // See SizeProperty Mixin...
    size: {
      value: 'small',
    },

    // See SizeProperty Mixin...
    supportedSizes: {
      value: ['small', 'medium', 'large'],
    },
  },
  methods: {
    onCreate() {
      this.addClickHandler('presence-click', this, this.onClick.bind(this));
    },

    /**
     * Render new user.
     *
     * @method
     */
    onRender() {
      if (this.item) this.onRerender();
    },

    /**
     * Render's changes in user status
     *
     * @method
     */
    onRerender(user) {
      const status = this.item ? this.item.status : '';
      this.classList[status === 'available' ? 'add' : 'remove']('layer-presence-available');
      this.classList[status === 'busy' ? 'add' : 'remove']('layer-presence-busy');
      this.classList[status === 'away' ? 'add' : 'remove']('layer-presence-away');
      this.classList[status === 'offline' ? 'add' : 'remove']('layer-presence-offline');
      this.classList[status === 'invisible' ? 'add' : 'remove']('layer-presence-invisible');
      this.classList[!status ? 'add' : 'remove']('layer-presence-unknown');
    },

    /**
     * The user clicked on this widget.
     *
     * Typically, you wouldn't respond to these, but if the user clicked on their OWN presence,
     * you may prompt them to change their status
     *
     * @method
     * @param {Event} evt
     */
    onClick(evt) {
      evt.preventDefault();
      this.trigger('layer-presence-click', { item: this.item });
    },
  },
});
