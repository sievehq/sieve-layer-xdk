/**
 * The Layer file upload button component allows users to select a File to send.
 *
 * This UI Component is typically used within the Layer.UI.components.ComposeBar:
 *
 * ```
 * myConversationView.replaceableContent = {
 *    composerButtonPanelRight: function() {
 *      document.createElement('layer-file-upload-button')
 *    }
 * };
 * ```
 *
 * * Generates a `layer-files-selected` event when files are selected, prior to generating models; you can call `evt.preventDefault()`
 *   on this event to prevent further processing
 * * Generates a `layer-models-generated` event after generating models from the selected files. This event is received by
 *   the Compose Bar if this widget is inside of the Compose Bar, and it will handle this event.  You can intercept
 *   this event and call `evt.stopPropgation()` to prevent the Compose Bar from receiving this event.
 *
 * ### Importing
 *
 * Any of the following will import this component
 *
 * ```
 * import '@layerhq/web-xdk/ui/components/layer-file-upload-button';
 * ```
 *
 * @class Layer.UI.components.FileUploadButton
 * @extends Layer.UI.Component
 * @mixin Layer.UI.mixins.Clickable
 */
'use strict';

var _core = require('../../core');

var _core2 = _interopRequireDefault(_core);

var _utils = require('../../utils');

var _utils2 = _interopRequireDefault(_utils);

var _component = require('./component');

var _clickable = require('../mixins/clickable');

var _clickable2 = _interopRequireDefault(_clickable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable max-len */


(0, _component.registerComponent)('layer-file-upload-button', {
  mixins: [_clickable2.default],
  //
  template: '<label layer-id="label"><i class="fas fa-paperclip fa-lg"></i></label><input layer-id="input" type="file"></input>',
  style: 'layer-file-upload-button {\ncursor: pointer;\ndisplay: flex;\nflex-direction: column;\njustify-content: center;\n}',
  properties: {
    /**
     * Set the `accept` attribute of the file upload widget.
     *
     * For more info, see https://www.w3schools.com/tags/att_input_accept.asp
     *
     * Possible value: `image/*,video/*`
     *
     * @property {String} [accept=*\/*]
     */
    accept: {
      set: function set(newValue) {
        this.nodes.input.accept = newValue;
      }
    },

    /**
     * Allow multiple files to be selected.
     *
     * Note that some older browsers that are supported by this framework do not support `multiple`,
     * see https://caniuse.com/#feat=input-file-multiple
     *
     * @property {Boolean} [multiple=false]
     */
    multiple: {
      type: Boolean,
      set: function set(newValue) {
        this.nodes.input.multiple = newValue;
      }
    },

    /**
     * Any File with one of these MIME Types will have a Layer.UI.messages.ImageMessageModel generated.
     *
     * Use this property to customize what MIME Types to watch for and treat as Images.
     *
     * @property {String[]}
     */
    imageTypes: {
      value: ['image/gif', 'image/png', 'image/jpeg', 'image/svg']
    }
  },
  methods: {

    // Lifecycle
    onCreate: function onCreate() {
      var _this = this;

      this.nodes.input.id = _utils2.default.generateUUID();
      this.nodes.label.setAttribute('for', this.nodes.input.id);
      this.nodes.input.addEventListener('change', this.onChange.bind(this));

      // This causes test to fail by causing the click event to fire twice.
      // but without this, the click event is not received at all.
      this.addClickHandler('button-click', this, function (evt) {
        if (evt.target !== _this.nodes.input) _this.nodes.input.click();
      });
    },


    /**
     * MIXIN HOOK: When the file input's value has changed, gather the data and trigger an event.
     *
     * If adding a mixin here to change behaviors on selecting a file, you can use `this.nodes.input.files` to access
     * the selected files.
     *
     * @method
     */
    onChange: function onChange() {
      var _this2 = this;

      var files = Array.prototype.slice.call(this.nodes.input.files);

      /**
       * This event is triggered when files are selected, but before Message Type Models are generated for those files.
       *
       * You can prevent any further processing of these files with `evt.preventDefault()`
       *
       * ```
       * document.body.addEventListener('layer-files-selected', function(evt) {
       *    // prevent further processing
       *    evt.preventDefault();
       *
       *    // Generate and send a message from the files
       *    var files = evt.detail.files;
       *    var parts = files.map(file => new Layer.Core.MessagePart({ body: file }));
       *    conversation.createMessage({ parts }).send();
       * });
       * ```
       *
       * You can alter the `files` array as needed and then allow processing to continue (not call `evt.preventDefault()`)
       *
       * ```
       * document.body.addEventListener('layer-files-selected', function(evt) {
       *    var files = evt.detail.files;
       *    for (var i = files.length - 1; i >= 0; i--) {
       *        // Remove any file whose size is greater than ~100K
       *        if (files[i].size > 100000) files.splice(i, 1);
       *    }
       * });
       * ```
       *
       * @event layer-files-selected
       * @param {Object} evt
       * @param {Object} evt.detail
       * @param {File} evt.detail.files
       */
      if (this.trigger('layer-files-selected', { files: files })) {
        var ImageModel = _core2.default.Client.getMessageTypeModelClass('ImageModel');
        var FileModel = _core2.default.Client.getMessageTypeModelClass('FileModel');

        // Generate Message Type Models for each File
        var models = files.map(function (file) {
          var options = { source: file };
          if (files.length > 1 && file.name) {
            options.title = file.name;
          }

          // Generate either an Image or File Model
          if (_this2.imageTypes.indexOf(file.type) !== -1) {
            return new ImageModel(options);
          } else {
            return new FileModel(options);
          }
        });

        /**
         * This widget triggers a `layer-models-generated` event when the user selects files, and Message Type Models
         * have been generated for them.  Call `event.preventDefault()` to prevent this event from being received
         * by the parent {@link Layer.UI.components.ComposeBar}:
         *
         * ```
         * document.body.addEventListener('layer-models-generated', function(evt) {
         *   evt.preventDefault();
         *   var models = evt.detail.models;
         *   var CarouselModel = Layer.Core.Client.getMessageTypeModelClass('CarouselModel');
         *   var model = new CarouselModel({ items: models });
         *   model.send({ conversation });
         * });
         * ```
         *
         * @event layer-models-generated
         * @param {Object} evt
         * @param {Object} evt.detail
         * @param {Layer.Core.MessageTypeModel[]} evt.detail.models
         */
        if (this.trigger('layer-models-generated', { models: models })) {
          if (this.parentComponent && this.parentComponent.onModelsGenerated) {
            this.parentComponent.onModelsGenerated(models);
          }
        }
      }
    }
  }
});