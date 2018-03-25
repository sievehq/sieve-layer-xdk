/**
 * Static properties here only needed if your directly using
 * the Layer.Core.TypingIndicators.TypingPublisher (not needed if
 * you are using the Layer.Core.TypingIndicators.TypingListener).
 *
 *      typingPublisher.setState(Layer.Core.TypingIndicators.STARTED);
 *
 * @class  Layer.Core.TypingIndicators
 * @static
 */
'use strict';

var _namespace = require('../namespace');

var _namespace2 = _interopRequireDefault(_namespace);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = _namespace2.default.TypingIndicators = {
  /**
   * Typing has started/resumed
   * @property {String}
   * @static
   */
  STARTED: 'started',

  /**
   * Typing has paused
   * @property {String}
   * @static
   */
  PAUSED: 'paused',

  /**
   * Typing has finished
   * @property {String}
   * @static
   */
  FINISHED: 'finished'
}; 