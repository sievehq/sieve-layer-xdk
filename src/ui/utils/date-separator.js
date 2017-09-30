/**
 * Use this module to put a date separator between Messages from different dates in your Messages List.
 *
 * ```
 * conversationPanel.onRenderListItem = layerUI.utils.dateSeparator;
 * ```
 *
 * Or if you have multiple `onRenderListItem` handlers:
 *
 * ```
 * conversationPanel.onRenderListItem = function(widget, messages, index, isTopItem) {
 *     layerUI.utils.dateSeparator(widget, messages, index);
 *     handler2(widget, messages, index, isTopItem);
 *     handler3(widget, messages, index, isTopItem);
 * }
 * ```
 *
 * Date separators come as `<div class='layer-list-item-separator-date'><span>DATE</span></div>`
 *
 * @class layerUI.utils.DateSeparator
 */
import LayerUI, { utils } from '../base';

const dateClassName = 'layer-list-item-separator-date';

module.exports = utils.dateSeparator = (widget, messages, index) => {
  if (index > messages.length) return;
  const message = widget.item;
  const needsBoundary = index === 0 || message.sentAt.toDateString() !== messages[index - 1].sentAt.toDateString();

  if (needsBoundary) {
    const dateWidget = document.createElement('layer-date');
    dateWidget.weekFormat = {weekday: 'long'};
    dateWidget.defaultFormat = {month: 'long', day: 'numeric'};
    dateWidget.olderFormat = {month: 'long', day: 'numeric', year: 'numeric'};
    dateWidget.date = messages[index].sentAt;
    const parent = document.createElement('div');
    parent.appendChild(dateWidget);
    parent.classList.add(dateClassName + '-inner');
    LayerUI.addListItemSeparator(widget, parent, dateClassName, true);
  } else {
    LayerUI.addListItemSeparator(widget, '', dateClassName, true);
  }
};

