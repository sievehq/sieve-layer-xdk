/**
 * The Layer Message List widget renders a scrollable, pagable list of Layer.UI.components.MessageListPanel.Item widgets.
 *
 * This is designed to go inside of the Layer.UI.Conversation widget.
 *
 * This Component has three named templates:
 *
 * * `layer-message-item-sent`: Rendering for Messages sent by the owner of this Session
 * * `layer-message-item-received`: Rendering for Messages sent by other users
 * * `layer-message-item-status`: Rendering for Messages sent as Status Messages
 *
 * Messages are organized into sets where a set starts with the first message from a given user, and ends when either
 * a different user sends a Message, or a long enough pause occurs.  Each Message will have firstInSeries/lastInSeries properties,
 * and these need to be maintained as new Messages are loaded, deleted, etc...
 *
 * ## Customization
 *
 * The `replaceableContent` property supports most basic customization.
 *
 * Each Layer.UI.components.MessageListPanel.Item can be customized this way as documented on the Item page.
 *
 * Any `replaceableContent` setup provided to the List will be passed onto the items.  In addition, the following
 * replaceableContent is supported for this list:
 *
 * * `emptyNode`: Shown to indicate that there are no messages in this conversation
 * * `endOfResultsNode`: Shown to indicate that the first message in the conversation has been reached; may be used to
 *   render something like "Welcome to the start of the Conversation"
 * * `loadIndicator`: Shown to indicate that we are fetching more messages from the server
 *
 * Typically these are all set on the Layer.UI.components.ConversationView which passes them down to this List:
 *
 * ```
 * conversationView.replaceableContent = {
 *     emptyNode: function(listWidget) {
 *        var div = document.createElement('div');
 *        div.innerHTML = 'if you want to see the messages you first need to have messages!';
 *        return div;
 *     }
 * };
 * ```
 *
 * ## Advanced Customization
 *
 * To enhance the Message List widget with new properties, methods and capabilities, you have can add Mixins.
 *
 *
 * The following example adds a search bar to the Message List
 *
 * ```
 * Layer.UI.init({
 *   mixins: {
 *     'layer-message-list': {
 *       properties: {
 *         searchText: {
 *           value: '',
 *           set: function(value) {
 *             this.nodes.searchBar.value = value;
 *             this._runSearch();
 *           },
 *           get: function() {
 *             return this.nodes.searchBar.value;
 *           }
 *         }
 *       },
 *       methods: {
 *         // When the widget is created, setup/initialize our custom behaviors
 *         onCreate: function() {
 *           this.nodes.searchBar = document.createElement('input');
 *           this.nodes.searchBar.classList.add('custom-search-bar');
 *           this.nodes.searchBar.addEventListener('change', this._runSearch.bind(this));
 *           this.insertBefore(this.nodes.searchBar, this.nodes.listMeta.firstChild);
 *         },
 *
 *
 *         // Whenver any messages are added/removed/changed, rerun our search
 *         onRerender: function() {
 *           if (this.searchText) this._runSearch();
 *         },
 *
 *         // Search is run whenver the user changes the search text, app changes the search text,
 *         // or new messages arrive that need to be searched
 *         _runSearch() {
 *           var searchText = this.searchText;
 *           Array.prototype.slice.call(this.childNodes).forEach(function(messageItem) {
 *             if (messageItem._isListItem) {
 *               var message = messageItem.item;
 *               const textPart = message.filterParts(part => part.mimeType === Layer.Constants.STANDARD_MIME_TYPES.TEXT)[0];
 *               if (textPart && JSON.parse(textPart.body).text.indexOf(searchText) === -1) {
 *                 messageItem.classList.remove('search-matches');
 *               } else {
 *                 messageItem.classList.add('search-matches');
 *               }
 *             }
 *           });
 *         }
 *       }
 *     }
 *   }
 * });
 * ```
 *
 * ### Importing
 *
 * Included with the standard build. If creating a custom build, import:
 *
 * ```
 * import '@layerhq/web-xdk/ui/components/layer-message-list/layer-message-list';
 * ```
 *
 * @class Layer.UI.components.MessageListPanel.List
 * @extends Layer.UI.Component
 *
 * @mixin Layer.UI.mixins.HasQuery
 * @mixin Layer.UI.mixins.EmptyList
 * @mixin Layer.UI.mixins.List
 * @mixin Layer.UI.mixins.ListLoadIndicator
 * @mixin Layer.UI.mixins.QueryEndIndicator
 */
'use strict';

var _utils = require('../../../utils');

var _settings = require('../../../settings');

var _settings2 = _interopRequireDefault(_settings);

var _statusMessageManager = require('../../ui-utils/status-message-manager');

var _statusMessageManager2 = _interopRequireDefault(_statusMessageManager);

var _messageHandlers = require('../../handlers/message/message-handlers');

var _messageHandlers2 = _interopRequireDefault(_messageHandlers);

var _uiUtils = require('../../ui-utils');

var _uiUtils2 = _interopRequireDefault(_uiUtils);

var _component = require('../component');

var _list = require('../../mixins/list');

var _list2 = _interopRequireDefault(_list);

var _hasQuery = require('../../mixins/has-query');

var _hasQuery2 = _interopRequireDefault(_hasQuery);

var _emptyList = require('../../mixins/empty-list');

var _emptyList2 = _interopRequireDefault(_emptyList);

var _listLoadIndicator = require('../../mixins/list-load-indicator');

var _listLoadIndicator2 = _interopRequireDefault(_listLoadIndicator);

var _queryEndIndicator = require('../../mixins/query-end-indicator');

var _queryEndIndicator2 = _interopRequireDefault(_queryEndIndicator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Mandatory delay between loading one page and the next.  If user is scrolling too fast, they'll have to wait at least (2) seconds.
var PAGING_DELAY = 2000; 


(0, _component.registerComponent)('layer-message-list', {
  mixins: [_list2.default, _hasQuery2.default, _emptyList2.default, _listLoadIndicator2.default, _queryEndIndicator2.default],
  template: '<div class=\'layer-list-meta\' layer-id=\'listMeta\'><layer-replaceable-content\nlayer-id=\'emptyNode\'\nclass=\'layer-empty-list\'\nname=\'emptyNode\'></layer-replaceable-content><div class=\'layer-header-toggle\'><layer-replaceable-content\nlayer-id=\'endOfResultsNode\'\nclass=\'layer-end-of-results-indicator\'\nname=\'endOfResultsNode\'><layer-start-of-conversation layer-id=\'startOfConversation\'></layer-start-of-conversation></layer-replaceable-content><layer-replaceable-content layer-id=\'loadIndicator\' class=\'layer-load-indicator\' name=\'loadIndicator\'><layer-loading-indicator></layer-loading-indicator></layer-replaceable-content></div></div>',
  style: 'layer-message-list {\ndisplay: flex;\nflex-direction: column;\nflex-grow: 1;\nheight: 100px;\npadding-bottom: 15px;\noverflow-x: hidden;\noverflow-y: scroll;\noverflow-x: hidden;\n-webkit-overflow-scrolling: touch;\n}\nlayer-message-list > .layer-message-item {\nflex-shrink: 0;\n}\nlayer-message-list:not(.layer-loading-data) .layer-load-indicator,\nlayer-message-list:not(.layer-end-of-results) .layer-end-of-results-indicator {\ndisplay: none;\n}\nlayer-message-list > .layer-list-meta {\nflex-grow: 1;\n}',
  properties: {

    /**
     * Supplemental property which helps drive the welcome message.
     *
     * This property is not used by this Component, but any child components (such as those added
     * using `replaceableContent` AND which have a `layer-id` attribute will have this value passed to them
     * whenever it is changed.  Typically this is used to provide the Layer.Core.Conversation to the
     * `<layer-start-of-conversation />` widget.
     *
     * @property {Layer.Core.Conversation}
     */
    conversation: {
      propagateToChildren: true
    },

    /**
     * @inheritdoc Layer.UI.components.ConversationView#dateRenderer
     *
     * @property {Function} [dateRenderer=null]
     * @property {Date} dateRenderer.date
     * @property {String} dateRenderer.return
     */
    dateRenderer: {},

    /**
     * @inheritdoc Layer.UI.components.ConversationView#messageStatusRenderer
     *
     * @property {Function} [messageStatusRenderer=null]
     * @property {Layer.Core.Message} messageStatusRenderer.message
     * @property {String} messageStatusRenderer.return
     */
    messageStatusRenderer: {},

    /**
     * @inheritdoc Layer.UI.components.ConversationView#dateFormat
     *
     * @property {Object} [dateFormat=]
     * @property {Object} [dateFormat.today={hour: 'numeric', minute: 'numeric'}]
     * @property {Object} [dateFormat.week={ weekday: 'short', hour: 'numeric', minute: 'numeric' }]
     * @property {Object} [dateFormat.older={ month: 'short', year: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }]
     * @property {Object} [dateFormat.default={ month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }]
     */
    dateFormat: {
      value: {
        today: { hour: 'numeric', minute: 'numeric' },
        week: { weekday: 'short', hour: 'numeric', minute: 'numeric' },
        older: { month: 'short', year: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' },
        default: { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }
      }
    },

    /**
     * @inheritdoc Layer.UI.components.ConversationView#getMenuItems
     *
     * @property {Function} getMenuItems
     * @property {Layer.Core.Message} getMenuItems.message
     * @property {Object[]} getMenuItems.return
     */
    getMenuItems: {
      type: Function
    },

    /**
     * Disable read receipts and other behaviors; typically used when the widget has been hidden from view.
     *
     * ```
     * widget.disable = true;
     * ```
     *
     * @property {Boolean} disable
     */
    disable: {
      set: function set(value) {
        if (!value) {
          this.properties.stuckToBottom = true;
          this.scrollTo(this.scrollHeight - this.clientHeight);
          this._checkVisibility();
        }
      }
    },

    /**
     * If the user scrolls within this many screen-fulls of the top of the list, page the Query.
     *
     * If value is 0, will page once the user reaches the top.  If the value is 0.5, will page once the user
     * reaches a `scrollTop` of 1/2 `clientHeight`.
     *
     * @property {Number} [screenFullsBeforePaging=2.0]
     */
    screenFullsBeforePaging: {
      value: 2.0
    }
  },
  methods: {
    // Lifecycle method sets up intial properties and events
    onCreate: function onCreate() {
      if (!this.id) this.id = (0, _utils.generateUUID)();

      // Init some local props
      this.properties.lastPagedAt = 0;
      this.properties.isSelfScrolling = false;
      this.properties.stuckToBottom = true;
      this.properties._checkVisibilityBound = this._checkVisibility.bind(this);

      window.addEventListener('focus', this.properties._checkVisibilityBound);
    },


    /**
     * Cleanup all pointers to self created by registering event handlers.
     *
     * @method onDestroy
     * @private
     */
    onDestroy: function onDestroy() {
      window.removeEventListener('focus', this.properties._checkVisibilityBound);
    },


    /**
     * Tests to see if we should load a new page of data.
     *
     * 1. Tests scrollTop to see if we are close enough to the top
     * 2. Tests if we are already loading that page of data
     *
     * @method _shouldPage
     * @return {Boolean}
     * @private
     */
    _shouldPage: function _shouldPage() {
      var pagingHeight = Math.max(this.clientHeight, 300) * this.screenFullsBeforePaging;
      return this.scrollTop <= pagingHeight && this.scrollHeight > this.clientHeight + 1 && !this.isDataLoading;
    },


    /**
     * Handler is called whenever the list is scrolled.
     *
     * Scrolling is caused by user activity, OR by setting the `scrollTop`.
     * Typically, we want to stay `stuckToButton` so that any time new Messages arrive,
     * we scroll to the bottom to see them.  Any user scrolling however may disable that behavior.
     *
     * @method _handleScroll
     * @private
     */
    _handleScroll: {
      mode: _component.registerComponent.MODES.OVERWRITE,
      value: function value() {
        var _this = this;

        // Calls to scrollTo() are automatically followed by calls to _checkVisibility() so skip this
        if (this.properties.isSelfScrolling) return;

        // If the user has scrolled within screenFullsBeforePaging of the top of the page...
        // and if the page has enough contents to actually
        // be scrollable, page the Messages.
        if (this._shouldPage() && !this.properties.delayedPagingTimeout) {
          if (this.properties.lastPagedAt + PAGING_DELAY < Date.now()) {
            if (!this.query.isFiring) {
              this.query.update({ paginationWindow: this.query.paginationWindow + 50 });
              this.isDataLoading = this.properties.query.isFiring;
            }
          } else if (!this.properties.delayedPagingTimeout) {
            // User is scrolling kind of fast, lets slow things down a little
            this.properties.delayedPagingTimeout = setTimeout(function () {
              _this.query.update({ paginationWindow: _this.query.paginationWindow + 50 });
              _this.isDataLoading = _this.properties.query.isFiring;
              _this.properties.delayedPagingTimeout = 0;
            }, 500);
          }
        }

        // If we have scrolled to the bottom/away from bottom (or are approximately at the bottom), update stuckToBottom.
        var stuckToBottom = this.scrollHeight - 50 <= this.clientHeight + this.scrollTop;
        if (stuckToBottom !== this.properties.stuckToBottom && !this.properties.inPagedData) {
          this.properties.stuckToBottom = stuckToBottom;
        }

        // Trigger checks on visibility to update read state
        this._checkVisibility();
      }
    },

    /**
     * Scroll the list to the specified Y position in pixels.
     *
     * Will call _checkVisibility() when done.
     *
     * ```
     * widget.scrollTo(500);
     * ```
     *
     * See also:
     *
     * * #scrollToItem
     * * #animatedScrollTo
     *
     * @method scrollTo
     * @param {Number} position
     */
    scrollTo: {
      mode: _component.registerComponent.MODES.OVERWRITE,
      value: function value(position) {
        var _this2 = this;

        if (position === this.scrollTop) return;
        this.properties.isSelfScrolling = true;
        this.scrollTop = position;
        setTimeout(function () {
          _this2.properties.isSelfScrolling = false;
          _this2._checkVisibility();
        }, 200);
      }
    },

    /**
     * Scrolls the list to the specified Y position.
     *
     * Will call _checkVisibility() when done.
     *
     * ```
     * widget.animatedScrollTo(500);
     * ```
     *
     * @method animatedScrollTo
     * @param {Number} position            Pixels from top of list to scroll to
     * @param {Number} [animateSpeed=200]  Number of miliseconds of animated scrolling; 0 for no animation
     * @param {Function} [animateCallback] Function to call when animation completes
     */
    animatedScrollTo: {
      mode: _component.registerComponent.MODES.OVERWRITE,
      value: function value(position) {
        var _this3 = this;

        var animateSpeed = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 200;
        var animateCallback = arguments[2];

        if (position === this.scrollTop) return;
        this.properties.isSelfScrolling = true;
        if (this.properties.cancelAnimatedScroll) this.properties.cancelAnimatedScroll();
        var cancel = this.properties.cancelAnimatedScroll = _uiUtils2.default.animatedScrollTo(this, position, animateSpeed, function () {
          // Wait for any onScroll events to trigger before we clear isSelfScrolling and procede
          setTimeout(function () {
            if (cancel !== _this3.properties.cancelAnimatedScroll) return;
            _this3.properties.cancelAnimatedScroll = null;

            _this3.properties.isSelfScrolling = false;
            _this3._checkVisibility();
            if (animateCallback) animateCallback();
          }, 100);
        });
      }
    },

    /**
     * Check which Messages are fully visible, and mark them as Read.
     *
     * TODO PERFORMANCE: Should be able to skip to the visible items and near-visible items without iterating over entire list
     *
     * NOTE: Only mark messages as read if the document has focus.  Just being visible but not in focus does not give us
     * sufficient cause to assume the user has read it.
     *
     * TODO: At some point we may need to customize whether document.hasFocus() is required; in particular, this could cause problems for anyone
     * running in an iFrame.  Is top.document.hasFocus() a suitable solution, or are there scenarios where top might not even be accessable due to
     * being a different domain?
     *
     * @method _checkVisibility
     * @private
     */
    _checkVisibility: function _checkVisibility() {
      var _this4 = this;

      if (_uiUtils2.default.isInBackground() || this.disable) return;

      var children = Array.prototype.slice.call(this.childNodes);
      children.filter(function (item) {
        return item.tagName !== 'DIV';
      }).forEach(function (child, index) {
        if (child.properties && child.properties.item && !child.properties.item.isRead && _this4._shouldMarkAsRead(child)) {
          // TODO: Use a scheduler rather than many setTimeout calls
          setTimeout(function () {
            return _this4._markAsRead(child);
          }, _settings2.default.markReadDelay);
        }
      }, this);
    },


    /**
     * Tests to see if the specified Message Item be marked as read
     *
     * @method _shouldMarkAsRead
     * @private
     * @param {Layer.UI.components.MessageListPanel.Item} child
     * @returns {Boolean}
     */
    _shouldMarkAsRead: function _shouldMarkAsRead(child) {
      if (_uiUtils2.default.isInBackground() || this.disable) return;

      var errorMargin = 10;
      var topVisiblePixel = this.scrollTop;
      var bottomVisiblePixel = this.scrollTop + this.clientHeight;
      var childTopVisiblePixel = child.offsetTop - this.offsetTop;
      var childBottomVisiblePixel = childTopVisiblePixel + child.clientHeight;
      var isTooBig = child.clientHeight + 50 > this.clientHeight;

      var isChildTopVisible = childTopVisiblePixel + errorMargin >= topVisiblePixel && childTopVisiblePixel < bottomVisiblePixel;
      var isChildBottomVisible = childBottomVisiblePixel <= bottomVisiblePixel + errorMargin && childTopVisiblePixel < bottomVisiblePixel;

      return isChildTopVisible && isChildBottomVisible || isTooBig && (isChildBottomVisible || isChildTopVisible);
    },


    /**
     * Mark a the Message associated with this item as read.
     *
     * This method validates that the Message flagged as ready to be read by #_checkVisibility is
     * in fact still fully visible after the delay.
     *
     * @method _markAsRead
     * @private
     * @param {Layer.UI.components.MessageListPanel.Item} child
     */
    _markAsRead: function _markAsRead(child) {
      if (this._shouldMarkAsRead(child)) {
        child.properties.item.isRead = true;
      }
    },


    /**
     * Return the tag name to use to render an individual Message Item.
     *
     * Typically would return one of:
     *
     * * 'layer-message-item-sent'
     * * 'layer-message-item-received'
     * * 'layer-message-item-status'
     *
     * You may customize what is received by using a mixin:
     *
     * ```
     * Layer.init({
     *   mixins: {
     *     methods: {
     *       getMessageItemTagName(message) {
     *         return 'layer-message-item-received';
     *       }
     *     }
     *   }
     * });
     * ```
     *
     * @param {*} message    The message to be rendered
     * @param {*} handler    The handler for rendering that message; typically 'layer-message-viewer'
     */
    getMessageItemTagName: function getMessageItemTagName(message, handler) {
      var rootPart = message.getRootPart();
      if (this._isStatusMessage(rootPart, message)) {
        return 'layer-message-item-status';
      } else if (message.sender.isMine) {
        return 'layer-message-item-sent';
      } else {
        return 'layer-message-item-received';
      }
    },


    /**
     * Append a Message to the document fragment, updating the previous messages' lastInSeries property as needed.
     *
     * @method _generateItem
     * @param {Layer.Core.Message} message
     * @returns {Layer.UI.components.MessageListPanel.Item}
     * @private
     */
    _generateItem: function _generateItem(message) {
      var handler = _messageHandlers2.default.getHandler(message, this);
      if (handler) {
        var type = this.getMessageItemTagName(message, handler);

        var messageWidget = document.createElement(type);
        messageWidget.id = this._getItemId(message.id);
        messageWidget.dateRenderer = this.dateRenderer;

        messageWidget.messageStatusRenderer = this.messageStatusRenderer;
        if (this.dateFormat) messageWidget.dateFormat = this.dateFormat;
        messageWidget._contentTag = handler.tagName;
        messageWidget.item = message;
        messageWidget.getMenuItems = this.getMenuItems;
        if (this.query.pagedToEnd && this.query.data.indexOf(message) === this.query.data.length - 1) {
          messageWidget.classList.add('layer-first-message-of-conversation');
        }
        return messageWidget;
      } else {
        return null;
      }
    },


    /**
     * Should the provided message with the specified Root Message Part be treated as a Status Message?
     *
     * If there is no rootPart, then its _not_ following Message Type Model conventions, and is therefore
     * not a Status Message.
     *
     * @param {Layer.Core.MessageTypeModel} rootPart
     * @param {Layer.Core.Message} message
     */
    _isStatusMessage: function _isStatusMessage(rootPart, message) {
      if (!rootPart) return false;
      return _statusMessageManager2.default.isStatusMessage(rootPart.mimeType) !== -1;
    },


    /**
     * Are the two Messages in the same Group?
     *
     * See Layer.UI.settings.messageGroupTimeSpan to adjust the definition of Same Group.
     *
     * @method _inSameGroup
     * @private
     * @param {Layer.UI.Component} message-item1
     * @param {Layer.UI.Component} message-item2
     * @returns {Boolean}
     */
    _inSameGroup: function _inSameGroup(m1, m2) {
      if (!m1 || !m2) return false;
      if (m1.tagName !== m2.tagName) return false;
      var message1 = m1.item;
      var message2 = m2.item;
      var diff = Math.abs(message1.sentAt.getTime() - message2.sentAt.getTime());
      return message1.sender === message2.sender && diff < _settings2.default.messageGroupTimeSpan;
    },


    /**
     * Whenever new message items are added to the list, we need to assign lastInSeries and firstInSeries values to them,
     * as well as update those values in nearby message items.
     *
     * @method _processAffectedWidgetsCustom
     * @private
     * @param {Layer.UI.components.MessageListPanel.Item[]} widgets
     * @param {Number} firstIndex - Index in the listData array of the first item in the widgets array
     * @param {Boolean} isTopItemNew - If the top item is index 0 and its a new item rather than an "affected" item, this is true.
     */
    _processAffectedWidgetsCustom: function _processAffectedWidgetsCustom(widgets, firstIndex, isTopItemNew) {
      if (widgets.length === 0) return;
      if (isTopItemNew) widgets[0].firstInSeries = true;
      for (var i = 1; i < widgets.length; i++) {
        var sameGroup = this._inSameGroup(widgets[i - 1], widgets[i]);
        widgets[i].firstInSeries = !sameGroup;
        widgets[i - 1].lastInSeries = !sameGroup;
      }
      if (!widgets[widgets.length - 1].nextSibling) widgets[widgets.length - 1].lastInSeries = true;
    },


    // See List mixin docs
    _renderResetData: {
      mode: _component.registerComponent.MODES.AFTER,
      value: function _renderResetData(evt) {
        this.properties.stuckToBottom = true;
        this.properties.lastPagedAt = 0;
        this.properties.isSelfScrolling = false;
      }
    },

    // See List mixin docs
    _renderWithoutRemovedData: {
      mode: _component.registerComponent.MODES.OVERWRITE,
      value: function value(evt) {
        this.properties.listData = [].concat(this.properties.query.data).reverse();

        var messageWidget = this.querySelector('#' + this._getItemId(evt.target.id));
        if (messageWidget) this.removeChild(messageWidget);

        var removeIndex = this.properties.listData.length - evt.index; // Inverted for reverse order
        var affectedItems = this.properties.listData.slice(Math.max(0, removeIndex - 3), removeIndex + 3);
        this._gatherAndProcessAffectedItems(affectedItems, false);
      }
    },

    // See List mixin docs
    _renderInsertedData: {
      mode: _component.registerComponent.MODES.OVERWRITE,
      value: function value(evt) {
        var _this5 = this;

        if (this.properties.appendingMore) {
          if (!this.properties.insertEvents) this.properties.insertEvents = [];
          this.properties.insertEvents.push(evt);
          return;
        }
        var oldListData = this.properties.listData;
        this.properties.listData = [].concat(this.properties.query.data).reverse();

        var insertIndex = oldListData.length - evt.index; // Inverted for reverse order
        var isTopItemNew = insertIndex === 0;

        var affectedItems = this.properties.listData.slice(Math.max(0, insertIndex - 3), insertIndex + 4);
        var fragment = this._generateFragment([evt.target]);
        if (insertIndex < oldListData.length) {
          var insertBeforeNode = affectedItems.length > 1 ? this.querySelector('#' + this._getItemId(oldListData[insertIndex].id)) : null;
          this.insertBefore(fragment, insertBeforeNode);
        } else {
          this.appendChild(fragment);
        }
        this._gatherAndProcessAffectedItems(affectedItems, isTopItemNew);
        this._updateLastMessageSent();
        if (this.properties.stuckToBottom) {
          setTimeout(function () {
            return _this5.animatedScrollTo(_this5.scrollHeight - _this5.clientHeight);
          }, 0);
        } else {
          this._checkVisibility();
        }
        if (!evt.inRender) this.onRerender();
      }
    },

    /**
     * The last message sent by the session owner should show some pending/read-by/etc... status.
     *
     * Other messages may also do this, but adding the `layer-last-message-sent` css class makes it easy
     * to conditionally show status only for the last sent message.
     *
     * TODO: Review if a CSS :last-child could isolate last message sent from last message received, and be used for easily styling this.
     *
     * @method _updateLastMessageSent
     * @private
     */
    _updateLastMessageSent: function _updateLastMessageSent() {
      for (var i = this.properties.listData.length - 1; i >= 0; i--) {
        if (this.properties.listData[i].sender.isMine) {
          var item = this.querySelector('#' + this._getItemId(this.properties.listData[i].id));
          if (item && !item.classList.contains('layer-last-message-sent')) {
            this.querySelectorAllArray('.layer-last-message-sent').forEach(function (node) {
              node.classList.remove('layer-last-message-sent');
            });
            item.classList.add('layer-last-message-sent');
          }
          break;
        }
      }
    },


    /**
     * Identify the message-item that is fully visible and at the top of the viewport.
     *
     * We use this before paging in new data so that we know which message should still
     * be at the top after we insert new messages at the top, and must compensate our `scrollTop`
     * accordingly.
     *
     * @method _findFirstVisibleItem
     * @private
     */
    _findFirstVisibleItem: function _findFirstVisibleItem() {
      var visibleTop = this.scrollTop;
      var visibleBottom = this.scrollTop + this.clientHeight;
      var children = Array.prototype.slice.call(this.childNodes);
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        var childOffset = child.offsetTop - this.offsetTop;
        if (childOffset >= visibleTop && childOffset + child.clientHeight <= visibleBottom) {
          if (child.properties && child.properties.item) {
            return child;
          }
        }
      }
      return null;
    },


    /**
     * Render a new page of data received from the Query.
     *
     * @method _renderPagedData
     * @private
     */
    _renderPagedData: {
      mode: _component.registerComponent.MODES.OVERWRITE,
      value: function value(evt) {
        if (evt.data.length === 0) {
          this.isDataLoading = this.properties.query.isFiring;
          if (this.query.pagedToEnd) {
            var firstItem = this.querySelectorAllArray('.layer-message-item')[0];
            if (firstItem && firstItem.item && firstItem.item === this.query.data[this.query.data.length - 1]) {
              firstItem.classList.add('layer-first-message-of-conversation');
            }
          }
          this._renderPagedDataDone([], null, evt);
          return;
        }

        this.properties.inPagedData = true;

        // Set this so that if the user is clinging to the scrollbar forcing it to stay at the top,
        // we know we just paged and won't page again.
        this.properties.lastPagedAt = Date.now();

        // Get both the query data and the event data
        var oldListData = this.properties.listData;
        this.properties.listData = [].concat(this.properties.query.data).reverse();
        var newData = [].concat(evt.data).reverse();

        // Get the affected items
        var affectedItems = [].concat(newData);
        var fragment = void 0;
        if (oldListData.length) affectedItems = affectedItems.concat(oldListData.slice(0, 3));

        // Append only a few items at a time, with pauses to keep browser running smoothly.
        // Don't append anything to the document until its all generated
        // TODO: This sucks.  For 100 items, it takes 5 iterates of 20ms each, so it adds 100ms lag to render,
        // and the only good news is that this 100ms lag results in performance of the rest of the browser not degrading.
        var appendMore = function appendMore() {
          var _this6 = this;

          if (!this.query || this.query.isDestroyed) return;
          this.properties.appendingMore = true;
          var processItems = newData.splice(0, 20).filter(function (item) {
            return !item.isDestroyed;
          });
          fragment = this._generateFragment(processItems, fragment);
          if (newData.length) {
            setTimeout(function () {
              return appendMore.call(_this6);
            }, 20);
          } else {
            this.properties.appendingMore = false;
            (0, _utils.defer)(function () {
              return _this6._renderPagedDataDone(affectedItems, fragment, evt);
            });
          }
        }.bind(this);
        appendMore();
      }
    },

    /**
     * After we have rendered the newly paged in messages, some post processing is needed.
     *
     * 1. Call processAffectedWidgets
     * 2. Scroll to maintain an appropriate position
     * 3. Insert the document fragment into our widget
     * 4. Check visibility on newly rendered items
     *
     * @method _renderPagedDataDone
     * @private
     */
    _renderPagedDataDone: function _renderPagedDataDone(affectedItems, fragment, evt) {
      var _this7 = this;

      if (!fragment) return; // called without fragment to trigger mixin versions of _renderPagedDataDone
      if (this.properties._internalState.onDestroyCalled) return;

      // Find the nodes of all affected items in both the document and the fragment,
      // and call processAffectedWidgets on them
      if (affectedItems.length) {
        var affectedWidgetsQuery = '#' + affectedItems.map(function (message) {
          return _this7._getItemId(message.id);
        }).join(', #');
        var affectedWidgets = this.querySelectorAllArray(affectedWidgetsQuery);
        if (fragment) {
          var fragmentWidgets = Array.prototype.slice.call(fragment.querySelectorAll(affectedWidgetsQuery));
          affectedWidgets = fragmentWidgets.concat(affectedWidgets);
        }
        try {
          // When paging new data, top item should always be new
          this._processAffectedWidgets(affectedWidgets, true);
        } catch (e) {
          _utils.logger.error(e);
        }
      }

      var firstVisibleItem = this._findFirstVisibleItem();
      var initialOffset = firstVisibleItem ? firstVisibleItem.offsetTop - this.offsetTop - this.scrollTop : 0;

      // Now that DOM manipulation is completed,
      // we can add the document fragments to the page
      var nextItem = this.nodes.listMeta.nextSibling;
      this.insertBefore(fragment, nextItem);

      // TODO PERFORMANCE: We should not need to do this as we page UP; very wasteful
      this._updateLastMessageSent();

      this.isDataLoading = this.properties.query.isFiring;
      this._checkVisibility();
      if (!evt.inRender) this.onRerender();

      if (this.properties.insertEvents) this.properties.insertEvents.forEach(function (anEvt) {
        return _this7._renderInsertedData(anEvt);
      });
      delete this.properties.insertEvents;

      // more than just lastMessage
      if (this.query.data.length > 1) {
        (0, _utils.defer)(function () {
          return _this7._pagedDataDone(firstVisibleItem, evt, initialOffset);
        });
      }

      // Fixes special case where first message is taller than the viewport,
      // also happens when listItem.beforeNode adds height.
      else if (this.properties.stuckToBottom) {
          this.onPagedDataDone(false);
          this.properties.inPagedData = false;
          // TODO: Add onPagedData(true) call
        }
    },


    /**
     * This method is called whenever the list finishes generating all of the Layer.UI.components.MessageListPanel.Item
     * for a new page of data.
     *
     * On finishing loading, it will:
     *
     * 1. Determine where it needs to scroll to (bottom or fistVisibleItem)
     * 2. Scroll to that position
     * 3. Wait for messages to finish asyc rendering such as fetching images from servers
     * 4. Rescroll to that position after all message heights are updated
     *
     * @method _pagedDataDone
     * @private
     * @param {Layer.UI.components.MessageListPanel.Item} firstVisibleItem   The first message that at the top of the view and fully visible
     * @param {Layer.Core.LayerEvent} evt   The Query change event that delivered the data
     * @param {Number} initialOffset    How far from the top of the Message List is that first fully visible item (so we can maintain that offset)
     */
    _pagedDataDone: function _pagedDataDone(firstVisibleItem, evt, initialOffset) {
      var _this8 = this;

      this.properties.inPagedData = false;
      var needsPagedDataDone = true;
      // CustomElements.takeRecords();
      // defer.flush();

      if (this.properties.stuckToBottom) {
        // Get all Message Viewers that contain a ui node
        var uis = this.querySelectorAllArray('layer-message-viewer').map(function (card) {
          return card.nodes.ui;
        }).filter(function (ui) {
          return ui;
        });

        // Gather all UIs that haven't yet finished allocating their height
        var unfinishedUIs = uis.filter(function (card) {
          return !card.isHeightAllocated;
        });

        // If there are unfinished UIs, setup event handlers to detect when all messages are done
        if (unfinishedUIs.length) {
          this.onPagedDataDone(false);

          // Function determines if everything is resolved, and if so, calls onPagedDataDone(true)
          var onCardFinished = function onCardFinished() {
            unfinishedUIs = unfinishedUIs.filter(function (card) {
              return !card.isHeightAllocated;
            });
            if (unfinishedUIs.length === 0) {
              _this8.removeEventListener('message-height-change', onCardFinished);
              setTimeout(function () {
                return _this8.onPagedDataDone(true);
              }, 10);
            }
          };

          // Listen for all Messages that have resolved their height
          this.addEventListener('message-height-change', onCardFinished);
          needsPagedDataDone = false;
        }
      }

      // If we are not stuck to the bottom, then just try and stay pinned to whatever the first visible item is
      // TODO: this doesn't yet use the height change events to make adjustments!!!
      else if (firstVisibleItem && evt.type === 'data' && evt.data.length !== 0) {
          this.scrollTo(firstVisibleItem.offsetTop - this.offsetTop - initialOffset);
        }

      // Is everything good? Well then call onPagedDataDone(true)
      if (needsPagedDataDone) {
        this.onPagedDataDone(true);
        this.properties.inPagedData = false;
      }
    },


    /**
     * Mixin Hook for when a page of messages has finished loading.
     *
     * Note that the `isDoneSizingContent` is significant if you need all of the Messages to finish allocating their height
     * before doing processing.  Messages adjust their height when fetching graphics asynchronously and do not yet know
     * the dimensions for those images.  Fixed height messages are typically cleaner to work with.
     *
     * @param {Boolean} isDoneSizingContent
     */
    onPagedDataDone: function onPagedDataDone(isDoneSizingContent) {
      if (this.properties.stuckToBottom) {
        this.scrollToBottom();
      }
    },


    /**
     * Scroll the Message List to the bottom / most recent message.
     *
     * Sometimes things shift while animating so keep retrying until
     * we Really reach the bottom.
     *
     * @method scrollToBottom
     */
    scrollToBottom: function scrollToBottom() {
      var _this9 = this;

      var animateSpeed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      this.properties.stuckToBottom = true;
      var bottom = this.scrollHeight - this.clientHeight;
      if (!animateSpeed) {
        this.scrollTo(bottom);
      } else {
        this.animatedScrollTo(bottom, animateSpeed);
      }
      setTimeout(function () {
        var newBottom = _this9.scrollHeight - _this9.clientHeight;
        if (bottom !== newBottom) _this9.scrollToBottom(animateSpeed);
      }, animateSpeed + 10 || 250);
    }
  }
});