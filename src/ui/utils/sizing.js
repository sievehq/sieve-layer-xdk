/**
 * Calculates a scaled size given a set of dimensions and the maximum allowed width/height.
 *
 * @class Layer.UI.utils.Sizing
 */

/**
 * @param {Object} dimensions    `width` and `height` of the actual image/video/object
 * @param {Object} maxSizes      `width` and `height` of the maximum allowed dimensions
 * @returns {Object}             `width` and `height` that is proportional to dimensions and within maxSizes
 */
module.exports = (dimensions, maxSizes) => {

  if (!dimensions) return maxSizes;

  const size = {
    width: dimensions.previewWidth || dimensions.width,
    height: dimensions.previewHeight || dimensions.height,
  };

  // Scale dimensions down to our maximum sizes if needed
  if (size.width > maxSizes.width) {
    const width = size.width;
    size.width = maxSizes.width;
    size.height = size.height * maxSizes.width / width;
  }
  if (size.height > maxSizes.height) {
    const height = size.height;
    size.height = maxSizes.height;
    size.width = size.width * maxSizes.height / height;
  }

  // Return scaled sizes
  return {
    width: Math.round(size.width),
    height: Math.round(size.height),
  };
};
