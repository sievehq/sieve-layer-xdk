/**
 * @class Layer.UI.UIUtils
 */
'use strict';

var _listSeparatorManager = require('./list-separator-manager');

var dateClassName = 'layer-list-item-separator-date'; 

/**
 * Use this module to put a date separator between Messages from different dates in your Messages List.
 *
 * ```
 * conversationView.onRenderListItem = Layer.UI.UIUtils.dateSeparator;
 * ```
 *
 * Or if you have multiple `onRenderListItem` handlers:
 *
 * ```
 * conversationView.onRenderListItem = function(widget, messages, index, isTopItem) {
 *     Layer.UI.UIUtils.dateSeparator(widget, messages, index);
 *     handler2(widget, messages, index, isTopItem);
 *     handler3(widget, messages, index, isTopItem);
 * }
 * ```
 *
 * Date separators come as `<div class='layer-list-item-separator-date'><span>DATE</span></div>`
 *
 * @method dateSeparator
 * @param {Layer.UI.mixins.ListItem} widget
 * @param {Layer.Core.Message} message
 * @param {Number} index
 */


module.exports = function (widget, messages, index) {
  try {
    if (index > messages.length) return;
    var message = widget.item;
    var needsBoundary = index === 0 || message.sentAt.toDateString() !== messages[index - 1].sentAt.toDateString();

    if (needsBoundary) {
      var dateWidget = document.createElement('layer-date');
      dateWidget.weekFormat = { weekday: 'long' };
      dateWidget.defaultFormat = { month: 'long', day: 'numeric' };
      dateWidget.olderFormat = { month: 'long', day: 'numeric', year: 'numeric' };
      dateWidget.date = messages[index].sentAt;
      var parent = document.createElement('div');
      parent.appendChild(dateWidget);
      parent.classList.add(dateClassName + '-inner');
      (0, _listSeparatorManager.addListItemSeparator)(widget, parent, dateClassName, true);
    } else {
      (0, _listSeparatorManager.addListItemSeparator)(widget, '', dateClassName, true);
    }
  } catch (e) {
    // no-op
  }
};