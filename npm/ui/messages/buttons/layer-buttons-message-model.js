/**
 * The Button Model represents a Message Type that presents Action or Choice buttons, optionally
 * accompanying some sub-message (i.e. a Product Message, Text Message, etc...).
 *
 * The `contentModel` property is used for any content to have Buttons associated with it; this example shows
 * a simple TextModel for the Content Model, and a couple of simple action buttons.
 *
 * ```
 * TextModel = Layer.Core.Client.getMessageTypeModelClass('TextModel');
 * ButtonModel = Layer.Core.Client.getMessageTypeModelClass('ButtonsModel');
 * model = new ButtonModel({
 *   buttons: [
 *     {"type": "action", "text": "Kill Arthur", "event": "kill-arthur"},
 *     {"type": "action", "text": "Give Holy Grail", "event": "grant-grail"}
 *   ],
 *   contentModel: new TextModel({
 *     text: 'And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.',
 *     title: 'The Holy Hand Grenade',
 *     author: 'King Arthur'
 *   })
 * });
 * model.send({ conversation });
 * ```
 *
 * You can also create Action Buttons to use existing event definitions such as `open-url`:
 *
 * ```
 * ButtonModel = Layer.Core.Client.getMessageTypeModelClass('ButtonsModel');
 * model = new ButtonModel({
 *   buttons: [
 *     {"type": "action", "text": "Open Page", "event": "open-url", data: {url: "https://layer.com" }}
 *   ]
 * });
 * model.send({ conversation });
 * ```
 *
 * Finally, you can use Choice Buttons instead of or in addition to Action Buttons:
 *
 * ```
 * TextModel = Layer.Core.Client.getMessageTypeModelClass('TextModel');
 * ButtonModel = Layer.Core.Client.getMessageTypeModelClass('ButtonsModel');
 * model = new ButtonModel({
 *   buttons: [
 *     {"type": "action", "text": "Kill Arthur", "event": "kill-arthur"},
 *     {
 *        "type": "choice",
 *        "choices": [
 *          {"text": "Like It", "id": "like"},
 *          {"text": "Hate It", "id": "hate"},
 *        ],
 *        "data": {
 *          "responseName": "judgement-is"
 *        }
 *     }
 *   ],
 *   contentModel: new TextModel({
 *     text: 'And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.',
 *     title: 'The Holy Hand Grenade',
 *     author: 'King Arthur'
 *   })
 * });
 * model.send({ conversation });
 * ```
 *
 *
 * ### Technical Details
 *
 * Note that Choice Models are generated to represent Choice Buttons, and are unique in that they do not have a
 * Message Part that they represent.
 * That in turn means that their standard means of creating a Response Message that targets their Message Part
 * is invalid.  Instead, these Choice Models are provided with a `parentId` that points to this Model's Message Part;
 * this is used as the target for any Message Response.
 *
 * Implications:
 *
 * * A Buttons Message with multiple sets of Choice Buttons will have multiple types of responses being gathered.
 * * Each set of Choice Buttons needs to have its own `responseName` to distinguish it from other Choice Buttons
 * * The Buttons Message will have a `model.responses` property that contains all of the responses from all of its Choice Buttons
 * * In generating Choice Models, this Model will pass all of its `responses` into the Choice Model as an input.
 *
 * ### Importing
 *
 * Included with the standard build. For a custom build, import either of these:
 *
 * ```
 * import '@layerhq/web-xdk/ui/messages/buttons/layer-buttons-message-view';
 * import '@layerhq/web-xdk/ui/messages/buttons/layer-buttons-message-model';
 * ```
 *
 * @class Layer.UI.messages.ButtonsMessageModel
 * @extends Layer.Core.MessageTypeModel
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _core = require('../../../core');

var _utils = require('../../../utils');

var _layerChoiceMessageModel = require('../choice/layer-choice-message-model');

var _layerChoiceMessageModel2 = _interopRequireDefault(_layerChoiceMessageModel);

var _layerChoiceMessageModelItem = require('../choice/layer-choice-message-model-item');

var _layerChoiceMessageModelItem2 = _interopRequireDefault(_layerChoiceMessageModelItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } 


var ButtonsModel = function (_MessageTypeModel) {
  _inherits(ButtonsModel, _MessageTypeModel);

  function ButtonsModel() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, ButtonsModel);

    options.choices = {};
    return _possibleConstructorReturn(this, (ButtonsModel.__proto__ || Object.getPrototypeOf(ButtonsModel)).call(this, options));
  }

  /**
   * Generate all of the Layer.Core.MessagePart needed to represent this Model.
   *
   * Used for Sending the Buttons Message.
   *
   * @method generateParts
   * @private
   * @param {Function} callback
   * @param {Layer.Core.MessagePart[]} callback.parts
   */


  _createClass(ButtonsModel, [{
    key: 'generateParts',
    value: function generateParts(callback) {
      var _this2 = this;

      var body = {
        buttons: this.buttons.map(function (button) {
          if (button.type === 'choice') {
            var obj = (0, _utils.clone)(button);
            var data = obj.data;
            if (data) {
              obj.data = {};
              Object.keys(data).forEach(function (dataKey) {
                obj.data[(0, _utils.hyphenate)(dataKey, '_')] = data[dataKey];
              });
            }
            return obj;
          } else {
            return button;
          }
        })
      };

      this.part = new _core.MessagePart({
        mimeType: this.constructor.MIMEType,
        body: JSON.stringify(body)
      });

      // If a Content Model was provided, add it to this model and generate its Message Part(s)
      if (this.contentModel) {
        this.addChildModel(this.contentModel, 'content', function (parts) {
          _this2.contentModel.mergeAction(_this2.action);
          callback([_this2.part].concat(parts));
        });
      } else {
        callback([this.part]);
      }
    }

    // Override the parent generateMessage method so that we can insure everything is properly setup
    // prior to anyone receiving the generated message and trying to send it

  }, {
    key: 'generateMessage',
    value: function generateMessage(conversation, callback) {
      var _this3 = this;

      _get(ButtonsModel.prototype.__proto__ || Object.getPrototypeOf(ButtonsModel.prototype), 'generateMessage', this).call(this, conversation, function (message) {
        _this3._setupButtonModels();
        if (callback) callback(message);
      });
    }

    // If this.responses.part is set then _setupButtonModels was already called

  }, {
    key: 'parseMessage',
    value: function parseMessage() {
      _get(ButtonsModel.prototype.__proto__ || Object.getPrototypeOf(ButtonsModel.prototype), 'parseMessage', this).call(this);
      if (!this.responses.part) this._setupButtonModels();
    }
  }, {
    key: 'parseModelChildParts',
    value: function parseModelChildParts(_ref) {
      var parts = _ref.parts,
          init = _ref.init;

      this.contentModel = this.getModelsByRole('content')[0] || null;
      if (this.contentModel) this.contentModel.mergeAction(this.action);
    }
  }, {
    key: 'parseModelResponses',
    value: function parseModelResponses() {
      _get(ButtonsModel.prototype.__proto__ || Object.getPrototypeOf(ButtonsModel.prototype), 'parseModelResponses', this).call(this);
      this._setupButtonModels();
    }

    /**
     * For each Choice button set in the `buttons` array, setup a Layer.UI.messages.ChoiceMessageModel for it.
     *
     * Layer.UI.messages.ButtonsMessageModel.choices contains an index of all of these Choice Models.
     *
     *
     * @method _setupButtonModels
     * @private
     */

  }, {
    key: '_setupButtonModels',
    value: function _setupButtonModels() {
      var _this4 = this;

      if (!this.buttons) return;
      var choices = this.buttons.filter(function (button) {
        return button.type === 'choice';
      });

      // For Each Choice Button Set:
      choices.forEach(function (button, index) {
        var buttonData = button.data || {};
        button.data = {};
        Object.keys(buttonData).forEach(function (dataKey) {
          button.data[(0, _utils.camelCase)(dataKey)] = buttonData[dataKey];
        });

        // We don't yet have support for updating a Choice Model if one were to change on the server.
        // Only generate the ChoiceModel if it doesn't already exist.
        // Otherwise just make sure its `responses` get updated
        if (!_this4.choices[button.data.responseName || 'selection']) {

          // The Choice Model will be instantiated with these properties
          var obj = {
            choices: button.choices.map(function (choice) {
              return new _layerChoiceMessageModelItem2.default(choice);
            }),
            message: _this4.message,
            parentId: _this4.nodeId,
            responses: _this4.responses,
            id: ButtonsModel.prefixUUID + (0, _utils.uuid)(_this4.message.id) + '/parts/buttonchoice' + index
          };

          // Copy all data from button.data into the object for the Choice Model.
          // Assumes that anything in button.data is valid Choice Model properties...
          // this could be done more safely...
          Object.keys(button.data).forEach(function (key) {
            return obj[key] = button.data[key];
          });

          // Generate the model and add it to this.choices[model.responseName]
          var model = new _layerChoiceMessageModel2.default(obj);

          _this4.choices[model.responseName] = model;
          model.on('message-type-model:change', function (evt) {
            return _this4.trigger('message-type-model:change', evt);
          });

          // Update the preselectedChoice based on any responses
          if (_this4.responses.part) {
            model.responses.parseResponsePart(_this4.responses.part);
            model.parseModelResponses();
          }
        } else if (_this4.responses.part) {
          var _model = _this4.choices[button.data.responseName || 'selection'];
          _model.responses.parseResponsePart(_this4.responses.part);
          _model.parseModelResponses();
        }
      });
    }

    // Used by Layer.UI.messages.StandardMessageViewContainer which will be very unlikely to ever wrap a Buttons Message

  }, {
    key: 'getTitle',
    value: function getTitle() {
      return this.contentModel ? this.contentModel.getTitle() : '';
    }
  }, {
    key: 'getFooter',
    value: function getFooter() {
      return this.contentModel ? this.contentModel.getFooter() : '';
    }
  }, {
    key: 'getDescription',
    value: function getDescription() {
      return this.contentModel ? this.contentModel.getDescription() : '';
    }

    // Used to render Last Message in the Conversation List

  }, {
    key: 'getOneLineSummary',
    value: function getOneLineSummary() {
      if (this.contentModel) {
        return this.contentModel.getOneLineSummary();
      } else {
        return this.buttons.length > 1 || this.buttons[0].type === 'choice' && this.buttons[0].choices.length > 1 ? this.constructor.LabelPlural : this.constructor.LabelSingular;
      }
    }
  }, {
    key: 'getChoiceModelResponseTopic',
    value: function getChoiceModelResponseTopic() {
      if (this.contentModel && this.contentModel.getChoiceModelResponseTopic) {
        return this.contentModel.getChoiceModelResponseTopic();
      }
      return '';
    }
  }]);

  return ButtonsModel;
}(_core.MessageTypeModel);

/**
 * Array of button descriptions that will be rendered for this Message.
 *
 * @property {Object[]} buttons
 */


ButtonsModel.prototype.buttons = null;

/**
 * Optional Message Model that will be wrapped by this Message.
 *
 * @property {Layer.Core.MessageTypeModel} contentModel
 */
ButtonsModel.prototype.contentModel = null;

/**
 * Hash of Layer.UI.messages.ChoiceMessageModel Models representing all of the Choice Button Sets.
 *
 * Hash is indexed by each Choice Button Set's `responseName` property.  This means that you can
 * access the state of any Choice Button Set using that name:
 *
 * ```
 * alert('Selected id is ' + buttonsModel.choices[myResponseName].selectedChoice);
 * ```
 *
 * @property {Object} choices
 */
ButtonsModel.prototype.choices = null;

/**
 * One instance of this type
 *
 * @static
 * @property {String} [LabelSingular=Button]
 */
ButtonsModel.LabelSingular = 'Button';

/**
 * One instance of this type
 *
 * @static
 * @property {String} [LabelPlural=Buttons]
 */
ButtonsModel.LabelPlural = 'Buttons';

/**
 * Standard concise representation of this Message Type
 *
 * @static
 * @property {String} [SummaryTemplate=]
 */
ButtonsModel.SummaryTemplate = '';

/**
 * The MIME Type recognized by and used by the Buttons Model.
 *
 * @static
 * @property {String} [MIMEType=application/vnd.layer.buttons+json]
 */
ButtonsModel.MIMEType = 'application/vnd.layer.buttons+json';

/**
 * The UI Component to render the Buttons Model.
 *
 * @static
 * @property {String} [messageRenderer=layer-buttons-message-view]
 */
ButtonsModel.messageRenderer = 'layer-buttons-message-view';

// Register the Class
_core.Root.initClass.apply(ButtonsModel, [ButtonsModel, 'ButtonsModel', _core.MessageTypeModels]);

// Register the Message Model Class with the Client
_core.Client.registerMessageTypeModelClass(ButtonsModel, 'ButtonsModel');

module.exports = ButtonsModel;