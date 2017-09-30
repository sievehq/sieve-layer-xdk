// @deprecated
import { registerComponent } from '../components/component';

module.exports = {
  properties: {
    isCardPrimitive: {
      value: true,
    },
    messageViewContainerTagName: {
      noGetterFromSetter: true,
      value: 'layer-standard-display-container',
    },
  },
};
