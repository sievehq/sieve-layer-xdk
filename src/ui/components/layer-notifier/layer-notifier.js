/**
 * The Layer Notifier widget can show Desktop Notifications when your app is in the background,
 * and Toast notifications when your app is in the foreground.
 *
 * You can customize the toast styling and layout by providing a custom Template.
 *
 * Add this to your page as:
 *
 * ```
 * <layer-notifier notify-in-foreground="toast" icon-url="https://myco.com/myimage.png"></layer-notifier>
 * ```
 *
 * Or via DOM Manipulation:
 *
 * ```javascript
 * var notifier = document.createElement('layer-notifier');
 * notifier.notifyInForeground = 'toast';
 * notifier.iconUrl = 'https://myco.com/myimage.png';
 * ```
 *
 * Note that you typically would not want to have a notification if your app is in the foreground,
 * and the new message is already visible to the user.  However,
 * this widget does not know what conversation is currently visible, so its up to you to manage this.
 *
 * Provide a layer.UI.components.misc.Notifier.onMessageNotification handler to perform tests to see
 * if notifications are required, and then call `evt.preventDefault()` to prevent the notification from showing.
 *
 * @class layer.UI.components.Notifier
 * @extends Layer.UI.components.Component
 */
import NotifyLib from 'notifyjs';
import { isInBackground as IsInBackground, getHandler as GetHandler } from '../../base';
import { registerComponent } from '../component';
import MainComponent from '../../mixins/main-component';
import Clickable from '../../mixins/clickable';
import '../layer-avatar/layer-avatar';

let Notify = NotifyLib;
if ('default' in Notify) Notify = Notify.default; // Annoying difference between webpack and browserify...

registerComponent('layer-notifier', {
  mixins: [MainComponent, Clickable],

  /**
   * Before showing any notification, this event will be triggered.
   *
   * Call `evt.preventDefault()`
   * to prevent the notification from being rendered.  Not calling `preventDefault()` allows the notification to occur.
   * This lets you customize behaviors on a per-notification basis.
   *
   * ```
   * document.body.addEventListener('layer-message-notification', function(evt) {
   *   if (evt.detail.item.conversationId === myOpenConversationId) {
   *     evt.preventDefault();
   *   }
   * }
   * ```
   *
   * @event layer-message-notification
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {Layer.Core.Message} evt.detail.item     The Message that has triggered this notification
   * @param {Layer.Core.MessageTypeModel} evt.detail.model     The Message Type Model that has triggered this notification
   * @param {Boolean} evt.detail.isBackground   Is the app running in the background
   * @param {String} evt.detail.type            What type of notification has been configured for this event ("desktop" or "toast")
   */
  /**
   * Before showing any notification, this event will be triggered.
   *
   * Call `evt.preventDefault()`
   * to prevent the notification from being rendered.  Not calling `preventDefault()` allows the notification to occur.
   * This lets you customize behaviors on a per-notification basis.
   *
   * ```
   * notifier.onMessageNotification = function(evt) {
   *   if (evt.detail.item.conversationId === myOpenConversationId && !evt.detail.isBackground) {
   *     evt.preventDefault();
   *   }
   * }
   * ```
   *
   * @property {Function} onMessageNotification
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {Layer.Core.Message} evt.detail.item     The Message that has triggered this notification
   * @param {Boolean} evt.detail.isBackground   Is the app running in the background
   * @param {String} evt.detail.type            What type of notification has been configured for this event ("desktop" or "toast")
   */

  /**
   * Use this event to handle the user clicking on the notification.
   *
   * ```
   * document.body.addEventListener('layer-notification-click', function(evt) {
   *   if (evt.detail.item.conversationId !== myOpenConversationId && !evt.detail.isBackground) {
   *     // Open the Conversation:
   *     document.querySelector('layer-conversation').conversationId = evt.detail.item.conversationId;
   *   }
   * });
   * ```
   *
   * @event layer-notification-click
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {Layer.Core.Message} evt.detail.item   The Message that has triggered this notification
   * @param {Layer.Core.MessageTypeModel} evt.detail.model     The Message Type Model that has triggered this notification
   */

  /**
   * Use this event to handle the user clicking on the notification.
   *
   * ```
   * notifier.onNotificationClick = function(evt) {
   *   if (evt.detail.item.conversationId !== myOpenConversationId) {
   *     // Open the Conversation:
   *     document.querySelector('layer-conversation').conversationId = evt.detail.item.conversationId;
   *   }
   * };
   * ```
   *
   * @property {Function} onNotificationClick
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {Layer.Core.Message} evt.detail.item   The Message that has triggered this notification
   */

  events: ['layer-message-notification', 'layer-notification-click'],
  properties: {

    // Docs in mixins/main-component.js
    client: {
      set(value) {
        value.on('messages:notify', this._notify.bind(this));
      },
    },

    /**
     * When your app is in the background, how should it show notifications of new Messages.
     *
     * Possible values:
     *
     * * desktop: Use desktop notifications when app is in the background
     * * toast: Use in-page toast notifications when app is in the background
     * * none or "": No notifications
     *
     * ```
     * <layer-notifier notify-in-background="none"></layer-notifier>
     * ```
     *
     * @property {String} [notifyInBackground=desktop]
     */
    notifyInBackground: {
      value: 'desktop',
      set(value) {
        if (value === 'desktop' && window.Notification) {
          Notify.requestPermission(this._onPermissionGranted.bind(this));
        }
      },
    },

    /**
     * When your app is in the foreground, how should it show notifications of new Messages.
     *
     * Possible values:
     *
     * * desktop: Use desktop notifications when app is in the foreground
     * * toast: Use in-page toast notifications when app is in the foreground
     * * none or "": No notifications
     *
     * * ```
     * <layer-notifier notify-in-foreground="toast"></layer-notifier>
     * ```
     *
     * @property {String} [notifyInForeground=none]
     */
    notifyInForeground: {
      value: 'none',
      set(value) {
        if (value === 'desktop' && window.Notification) {
          Notify.requestPermission(this._onPermissionGranted.bind(this));
        }
      },
    },

    /**
     * Modify the window titlebar to notify users of new messages
     *
     * NOTE: Rather than always show this indicator whenever there are unread messages, we only show
     * this indicator if the most recently received message is unread.  Further, this will not show
     * after reloading the app; its assumed that the user who reloads your app has seen what they want
     * to see, and that the purpose of this indicator is to flag new stuff that should bring them back to your window.
     *
     * See layer.UI.components.Notifier.notifyCharacterForTitlebar for more controls.
     *
     * @property {String} notifyInTitleBar
     */
    notifyInTitlebar: {
      type: Boolean,
      value: true,
    },

    /**
     * Set a character or string to prefix your window titlebar with when there are unread messages.
     *
     * This property is used if layer.UI.components.Notifier.notifyInTitlebar is enabled.
     *
     * @property {String} notifyCharacterForTitlebar
     */
    notifyCharacterForTitlebar: {
      value: '⬤',
    },

    /**
     * Set to true to force the notifier to show the unread badge in the titlebar, or set to false to force it to remove this.
     *
     * Use this at runtime to modify the badging behavior, use layer.UI.components.Notifier.notifyInTitlebar to enable/disable
     * badging.  Treat this as state rather than setting.
     *
     * If you want to just set the badge until the message is marked as read, use layer.UI.components.Notifier.flagTitlebarForMessage
     *
     * @property {Boolean} flagTitlebar
     */
    flagTitlebar: {
      type: Boolean,
      value: false,
      set(value) {
        if (value) {
          if (document.title.indexOf(this.notifyCharacterForTitlebar) !== 0) {
            document.title = this.notifyCharacterForTitlebar + ' ' + document.title;
          }
        } else if (document.title.indexOf(this.notifyCharacterForTitlebar) === 0) {
          document.title = document.title.substring(this.notifyCharacterForTitlebar.length + 1);
        }
      },
    },

    /**
     * Tells the notifier to put a badge in the titlebar for the specified message if its unread, and clear it once read.
     *
     * @property {Layer.Core.Message} flagTitlebarForMessage
     */
    flagTitlebarForMessage: {
      set(message, oldMessage) {
        if (oldMessage) oldMessage.off(null, this._handleTitlebarMessageChange, this);
        if (!message || message.isRead) {
          this.flagTitlebar = false;
        } else {
          this.flagTitlebar = true;
          message.on('messages:change destroy', this._handleTitlebarMessageChange, this);
        }
      },
    },

    /**
     * If the user hasn't granted priveledges to use desktop notifications, they won't be shown.
     *
     * This is a state property set by this component if/when the user/browser has approved the necessary permissions.
     *
     * @property {Boolean} [userEnabledDesktopNotifications=false]
     * @readonly
     */
    userEnabledDesktopNotifications: {
      value: false,
    },

    /**
     * To provide a custom icon to render within notifications, put the URL here.
     *
     * Leave this blank to use the sender's `avatarUrl` as the notification icon.
     *
     * * ```
     * <layer-notifier icon-url="https://myco.co/logo.png"></layer-notifier>
     * ```
     *
     * @property {String} [iconUrl=]
     */
    iconUrl: {
      value: '',
    },

    /**
     * Number of seconds the notification will stay before its automatically dismissed.
     *
     * * ```
     * <layer-notifier timeout-seconds="60"></layer-notifier>
     * ```
     *
     * @property {Number} [timeoutSeconds=30]
     */
    timeoutSeconds: {
      type: Number,
      value: 30,
    },

    /**
     * Timeout ID for clearing the toast notification
     *
     * @private
     * @property {Number} [_toastTimeout=0]
     */
    _toastTimeout: {
      value: 0,
    },
  },
  methods: {

    /**
     * Constructor.
     *
     * @method onCreate
     * @private
     */
    onCreate() {
      this.addClickHandler('item-click', this, this.onClickToast.bind(this));
      this.addEventListener('transitionend', this._afterTransition.bind(this), true);
    },

    /**
     * After finishing an animation, trigger this callback which removes the animation classes.
     *
     * @method _afterTransition
     * @private
     */
    _afterTransition() {
      this.classList.remove('layer-notifier-toast-fade');
    },

    /**
     * Callback indicating that the user has granted permissions for desktop notifications.
     *
     * @method _onPermissionGranted
     * @private
     */
    _onPermissionGranted() {
      this.properties.userEnabledDesktopNotifications = true;
    },

    /**
     * Notify the user of a new messages.
     *
     * Determines if foreground or background notifications are being used,
     * and what type of notification is preferred for that state.
     *
     * Triggers an event so the app can confirm/block the notification.
     *
     * @method _notify
     * @param {Layer.Core.LayerEvent} evt
     * @private
     */
    _notify(evt) {
      const isBackground = IsInBackground();
      const type = isBackground ? this.notifyInBackground : this.notifyInForeground;
      const message = evt.message;

      // Note: desktopNotify does a message.off() call that deletes all event handlers associated with this widget;
      // so make sure it gets called AFTER titlebarNotify which has a more precise off() call
      // TODO: Fix this.
      if (this.notifyInTitlebar && isBackground) {
        this.flagTitlebarForMessage = message;
      }

      if (type && type !== 'none') {
        if (this.trigger('layer-message-notification', { item: message, model: message.createModel(), type, isBackground })) {
          if (type === 'desktop' && this.properties.userEnabledDesktopNotifications) {
            this.desktopNotify(evt.message);
          } else if (type === 'toast') {
            this.toastNotify(evt.message);
          }
        }
      }
    },

    /**
     * Whenever the flagTitlebarForMessage message changes, check if its now read.
     *
     * @method _handleTitlebarMessageChange
     * @private
     */
    _handleTitlebarMessageChange(evt) {
      const message = this.flagTitlebarForMessage;
      if (message && (message.isRead || evt.eventName === 'destroy')) {
        this.flagTitlebar = false;
        this.flagTitlebarForMessage = null;
      }
    },

    /**
     * Show a desktop notification for this message.
     *
     * @method desktopNotify
     * @param {Layer.Core.Message} message
     */
    desktopNotify(message) {
      try {
        const model = message.createModel();
        const text = model ? model.text || model.title : '';
        if (this.properties.desktopNotify) this.closeDesktopNotify();

        this.properties.desktopMessage = message;
        this.properties.desktopNotify = new Notify(`Message from ${message.sender.displayName}`, {
          icon: this.iconUrl || message.sender.avatarUrl,
          timeout: this.timeoutSeconds,
          body: text || 'New file received',
          tag: message.conversationId || 'announcement',
          closeOnClick: true,
          notifyClick: () => {
            window.focus();
            this.trigger('layer-notification-click', { item: message, model: message.createModel() });
            this.onDesktopClick(message);
          },
        });
        this.properties.desktopNotify.show();

        message.on('messages:change destroy', (evt) => {
          if (message.isRead || evt.eventName === 'destroy') {
            this.closeDesktopNotify();
          }
        }, this);
      } catch (e) {
        // do nothing
      }
    },

    /**
     * Close the desktop notification.
     *
     * @method closeDesktopNotify
     */
    closeDesktopNotify() {
      if (this.properties.desktopNotify) {
        this.properties.desktopNotify.close();
        this.properties.desktopMessage.off(null, null, this);
        this.properties.desktopMessage = this.properties.desktopNotify = null;
      }
    },

    /**
     * MIXIN HOOK: User has clicked on a desktop notification.
     *
     * @method
     * @param {Layer.Core.Message} message
     */
    onDesktopClick(message) {
      // No-op
    },

    /**
     * Show a toast notification for this message.
     *
     * @method toastNotify
     * @param {Layer.Core.Message} message
     */
    toastNotify(message) {
      this.closeToast();
      const placeholder = this.querySelector('.layer-message-item-placeholder');
      const rootPart = message.getRootPart();

      if (rootPart) {
        this.nodes.avatar.users = [message.sender];
        this.nodes.title.innerHTML = message.sender.displayName;
        this.nodes.viewer.message = message;

        if (this.properties._toastTimeout) clearTimeout(this.properties._toastTimeout);

        this.properties.rootPart = rootPart;
        this.properties.message = message;
        this.classList.add('layer-notifier-toast-fade');
        this.classList.add('layer-notifier-toast');
        this.properties._toastTimeout = setTimeout(this.closeToast.bind(this), this.timeoutSeconds * 1000);

        this.properties.toastMessage = message;
        message.on('messages:change destroy', (evt) => {
          if (message.isRead || evt.eventName === 'destroy') {
            this.closeToast();
          }
        }, this);
      }
    },

    /**
     * Close the toast notification.
     *
     * @method closeToast
     */
    closeToast() {
      if (this.properties.model) {
        this.classList.add('layer-notifier-toast-fade');
        this.classList.remove('layer-notifier-toast');
        this.properties.message.off(null, null, this);
        this.properties.model.off(null, null, this);
        this.properties.message = null;
        this.properties.model = null;
        this.properties.rootPart = null;
        this.nodes.viewer.innerHTML = '';

        clearTimeout(this.properties._toastTimeout);
        this.properties._toastTimeout = 0;
        if (this.properties.toastMessage) this.properties.toastMessage.off(null, null, this);
        this.properties.toastMessage = null;
      }
    },

    /**
     * MIXIN HOOK: The user has clicked on the toast dialog.
     *
     * @method onClickToast
     * @private
     * @param {Event} evt
     */
    onClickToast(evt) {
      if (this.properties.toastMessage) {
        evt.preventDefault();
        evt.stopPropagation();
        this.trigger('layer-notification-click', {
          item: this.properties.toastMessage,
          model: this.properties.toastMessage.createModel()
        });
        this.closeToast();
      }
    },
  },
});
