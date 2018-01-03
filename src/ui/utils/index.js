/**
 * @class Layer.UI.Utils
 * @singleton
 */

 /**
 * Utility returns whether or not the window is in the background.
 *
 * @method isInBackground
 * @static
 * @returns {Boolean}
 */
module.exports.isInBackground = () => !document.hasFocus() || document.hidden;

/**
 * Placeholder for a mechanism for all Message Types to share for showing a zoomed in version of their content.
 *
 * Eventually should open an in-app dialog
 *
 * @method showFullScreen
 * @param {String} url
 */
module.exports.showFullScreen = url => window.open(url);
