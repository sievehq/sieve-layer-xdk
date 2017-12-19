/**
 * A Mixin for main components (not needed for subcomponents) that provides common properties, shortcuts and code.
 *
 * @class layer.UI.mixins.MainComponent
 */
import Layer from '../../core';
import { settings, version } from '../base';
import { registerComponent } from '../components/component';

module.exports = {
  properties: {
    /**
     * Is this component a Main Component (high level for use by third party apps).
     *
     * Used by adapters to find components to adapt.
     * @private
     * @readonly
     * @property {Boolean} [_isMainComponent=true]
     */
    _isMainComponent: {
      value: true,
    },

    /**
     * An App ID can be provided as a property; this allows the app to find its Client.
     *
     * App IDs are typically provided via:
     *
     * ```
     * layer.UI.init(({ appId: myAppId })
     * ```
     *
     * The only time one would use this property
     * is if building an app that used multiple App IDs.
     *
     * @property {String} [appId=""]
     */
    appId: {
      order: 1,
      set(value) {
        if (value && value.indexOf('layer:///') === 0) {
          const client = Layer.Client.getClient(value);
          if (client) {
            this.client = client;
          } else if (Layer.Client.addListenerForNewClient) {
            // Wait for the next client with this appId to be registered and then assign it.
            Layer.Client.addListenerForNewClient(newClient => (this.client = newClient), value);
          } else {
            throw new Error('You must create a Layer.Core.Client with your appId before creating this component. Or upgrade to Layer WebSDK 3.2.2 or above.');
          }
        }
      },
    },

    /**
     * The Layer.Core.Client can be passed in via the `client` property or the `appId` property.
     *
     * App IDs are typically provided via:
     *
     * ```
     * layer.UI.init(({ appId: myAppId })
     * ```
     *
     * The only time one would use this property
     * is if building an app that used multiple Clients.
     *
     * @property {Layer.Core.Client} [client=null]
     */
    client: {
      order: 2,
      set(value) {
        if (value) {
          value.on('destroy', (evt) => {
            if (evt.target === value) this.properties.client = null;
          }, this);
        }
      },
    },
  },
  methods: {
    onCreate() {
      if (settings.appId) this.appId = settings.appId;
      const useSafariCss = navigator.vendor && navigator.vendor.indexOf('Apple') > -1;
      if (useSafariCss) this.classList.add('safari');
    },
  },
};
