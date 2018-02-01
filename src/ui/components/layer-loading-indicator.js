/**
 * The Layer Loading Spinner/indicator
 *
 * ### Importing
 *
 * Included with the standard build. If using a custom build then import one of:
 *
 * ```
 * import '@layerhq/web-xdk/ui/components/layer-loading-indicator';
 * ```
 *
 * @class Layer.UI.components.LoadingIndicator
 * @extends Layer.UI.Component
 */
import { registerComponent } from './component';

registerComponent('layer-loading-indicator', {
  template: '<div></div>',
  style: `
  layer-loading-indicator {
    display: block;
  }
  `,
});
