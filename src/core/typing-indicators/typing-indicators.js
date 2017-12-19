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
module.exports = {
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
  FINISHED: 'finished',
};
