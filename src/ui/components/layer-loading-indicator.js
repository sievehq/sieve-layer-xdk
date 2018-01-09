/**
 * The Layer Loading Spinner/indicator
 *
 * ### Importing
 *
 * Included with the standard build. If using a custom build then import one of:
 *
 * ```
 * import '@layerhq/web-xdk/lib/ui/components/layer-loading-indicator';
 * ```
 *
 * @class Layer.UI.components.LoadingIndicator
 * @extends Layer.UI.Component
 */
import { registerComponent } from './component';

registerComponent('layer-loading-indicator', {
  template: '<div></div>',
  style: `
    /* Animation */
    @-webkit-keyframes layer-loader {
      to { -webkit-transform: rotate(360deg); }
    }
    @keyframes layer-loader {
      to { transform: rotate(360deg); }
    }

    /* Loader */
    layer-loading-indicator {
      display: block;
      margin: 15px 0px;
      width: 50px;
      height: 50px;
    }
    layer-loading-indicator > div {
      box-sizing: border-box;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: transparent;
      border-width: 4px;
      border-style: solid;

      -webkit-animation: layer-loader 1.2s infinite linear;
      animation: layer-loader 1.2s infinite linear;
    }
  `,
});
