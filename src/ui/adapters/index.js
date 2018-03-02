/**
 * Adaptors are utilities to help simplify access to the Webcomponents provided by this library
 * to other UI Frameworks.
 *
 * The following adapters are provided built-in:
 *
 * * Layer.UI.adapters.react
 * * Layer.UI.adapters.angular (Angular 1.x; does not handle Angular 2.x)
 * * Layer.UI.adapters.backbone
 *
 * @class Layer.UI.adapters
 * @static
 */
import { ErrorDictionary } from '../../core/layer-error';

module.exports.angular = module.exports.backbone = module.exports.react = () => {
  throw new Error(ErrorDictionary.adapterError);
};

/**
 * An adapter does not need to be registered via `register` to be used, but doing so makes it
 * available within the Layer.UI.adapters object where other developers can find it.
 *
 * ```
 * Layer.UI.adapters.register('my-odd-js-framework', function() {....});
 * ```
 *
 * @method register
 * @param {String} name      Name of the adapter. Namespaces it within layerUI.adapters
 * @param {Function} adapter The adapter to make available to apps
 */
module.exports.register = (name, adapter) => {
  module.exports[name] = adapter;
};
