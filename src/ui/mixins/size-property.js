/**
 * A helper mixin to add a size property components; adding a layer-size-small, layer-size-medium or layer-size-large css class.
 *
 * @class layerUI.mixins.SizeProperty
 */
import { registerComponent } from '../components/component';

module.exports = {
  properties: {
    supportedSizes: {
      order: 100,
    },
    size: {
      order: 101,
      mode: registerComponent.MODES.BEFORE,
      set(newValue, oldValue) {
        if (this.supportedSizes.indexOf(newValue) === -1) {
          this.properties.size = oldValue;
          console.info(this.tagName + ' does not support a size value of ' + newValue);

        } else {
          this.supportedSizes.forEach(size =>
            this.classList[size === newValue ? 'add' : 'remove']('layer-size-' + size));
        }
      },
    },
  },
};
