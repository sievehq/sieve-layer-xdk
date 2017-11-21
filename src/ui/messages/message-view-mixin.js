/**
 * A Mixin that provides common patterns for rendering any Message Type Model.
 *
 * @class Layer.UI.messages.MessageViewMixin
 */

import { registerComponent } from '../components/component';

module.exports = {
  properties: {

    /**
     * Indicates that this UI Component is a Message Type View
     *
     * @type {Boolean} [isMessageTypeView=true]
     * @readonly
     */
    isMessageTypeView: {
      value: true,
    },

    /**
     * The Message Type Model to be rendered by this UI.
     *
     * Any change event triggered by this model should trigger a call to this UI's `onRerender`
     *
     * @type {Layer.Core.MessageTypeModel} model
     */
    model: {
      set(model, oldModel) {
        if (oldModel) oldModel.off(null, null, this);
        if (model) model.on('change', this.onRerender, this);
      },
    },

    /**
     * Provides hints to the `<layer-message-viewer />` as to what sort of border to draw around the Message/Sub-Message.
     *
     * See Layer.UI.handlers.message.MessageViewer.cardBorderStyle for more detail.
     *
     * @type {String} cardBorderStyle
     */
    cardBorderStyle: {},

    /**
     * Pointer to the Layer.UI.handlers.message.MessageViewer that contains this Message Type View.
     *
     * @type {Layer.UI.handlers.message.MessageViewer} messageViewer
     */
    messageViewer: {},

    /**
     * Specifies a width class for this Message Type View.
     *
     * One of:
     *
     * * "full-width": Uses all available width
     * * "chat-bubble": No minimum, maximum is all available width; generallay does not look like a card
     * * "flex-width": card that has a minimum and a maximum but tries for an optimal size for its contents
     *
     * @type {String} widthType
     */
    widthType: {},

    /**
     * Each Message Type View can specify their preferred minimum width.
     *
     * Default is 192px
     *
     * @type {Number} preferredMinWidth
     */
    preferredMinWidth: {
      get() {
        return this.properties.preferredMinWidth || 192;
      },
    },

    /**
     * Each Message Type View can specify their preferred maximum width.
     *
     * Default is 1000px
     *
     * @type {Number} preferredMaxWidth
     */
    preferredMaxWidth: {
      get() {
        return this.properties.preferredMaxWidth || 1000;
      },
    },

    /**
     * Most cards are fixed height; those that must calculate their height asynchonously will use this.
     *
     * Any Message Type Model needing to calculate the height should default this property to `false`
     * and change it to `true` once the height has been set.
     *
     * @type {Boolean} isHeightAllocated
     */
    isHeightAllocated: {
      value: true,
      set(value) {
        if (value) {
          this.trigger('message-height-change');
        }
      },
    },
  },
  methods: {
    onCreate() {
      this.classList.add('layer-message-type-view');
    },

    /**
     * Core part of the UI Lifecycle, called after onAfterCreate.
     *
     * Any time onRender is called, let all versions of `onRender` complete,
     * and then call `onRerender` to handle all dynamic rendering.
     *
     * @method onRender
     */
    onRender: {
      mode: registerComponent.MODES.AFTER,
      value() {
        this.onRerender();
      },
    },

    /**
     * Core part of the UI Lifecycle, called whenever the model changes, and after initialization.
     *
     * Detect if there is any change to the width type. This could happen due to a message being
     * updated with metadata that wasn't there before (Link Integration Service adding metadata)
     *
     * @method onRerender
     */
    onRerender() {
      if (this.messageViewer) {
        this.messageViewer.widthType = this.widthType || 'flex-width';
      }
    },

    /**
     * If there is a Display Container wrapping this UI Component, setup its CSS Classes.
     *
     * Certain knowledge is best understood by the UI rather than the Model, such as whether
     * a panel of metadata really aught to be shown.  The Display Container will request this update
     * any time the model is changed.
     *
     * @method _setupContainerClasses
     * @protected
     */
    _setupContainerClasses() {
      this.parentComponent.toggleClass('layer-card-no-metadata',
        !this.model.getTitle() && !this.model.getDescription() && !this.model.getFooter());
    },


    onDestroy() {
      delete this.properties.messageViewer;
    },
  },
};
