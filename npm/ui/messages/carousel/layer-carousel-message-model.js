/**
 * A Carousel of Message Models
 *
 * This is a relatively trivial class that simply manages an array of Message Models
 * that will be rendered within any Viewer associated with this model.
 *
 * ```
 * CarouselModel = Layer.Core.Client.getMessageTypeModelClass('CarouselModel');
 * ButtonsModel = Layer.Core.Client.getMessageTypeModelClass('ButtonsModel');
 * model = new CarouselModel({
 *    items: [
 *       new ButtonModel({
 *         buttons: [{type: "action", event: "do-something"}]
 *         contentModel: new TextModel({
 *           text: 'Text 1',
 *           title: 'Title 1'
 *         })
 *       }),
 *       new ButtonModel({
 *         buttons: [{type: "action", event: "do-something"}]
 *         contentModel: new TextModel({
 *           text: 'Text 2',
 *           title: 'Title 2'
 *         })
 *       }),
 *       new ButtonModel({
 *         buttons: [{type: "action", event: "do-something"}]
 *         contentModel: new TextModel({
 *           text: 'Text 3',
 *           title: 'Title 3'
 *         })
 *       })
 *     ]
 * });
 * model.send({ conversation });
 * ```
 *
 * ### Importing
 *
 * Not included with the standard build. Import using either of these:
 *
 * ```
 * import '@layerhq/web-xdk/ui/messages/carousel/layer-carousel-message-view';
 * import '@layerhq/web-xdk/ui/messages/carousel/layer-buttons-message-model';
 * ```
 *
 * @class Layer.UI.messages.CarouselMessageModel
 * @extends Layer.Core.MessageTypeModel
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _core = require('../../../core');

var _core2 = _interopRequireDefault(_core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } 


var CarouselModel = function (_MessageTypeModel) {
  _inherits(CarouselModel, _MessageTypeModel);

  function CarouselModel() {
    _classCallCheck(this, CarouselModel);

    return _possibleConstructorReturn(this, (CarouselModel.__proto__ || Object.getPrototypeOf(CarouselModel)).apply(this, arguments));
  }

  _createClass(CarouselModel, [{
    key: 'generateParts',

    /**
     * Generate the Message Parts representing this model so that the Carousel Message can be sent.
     *
     * Requires generating one or more Message Parts per submodel in the `items` array
     *
     * @method generateParts
     * @protected
     * @param {Function} callback
     * @param {Layer.Core.MessagePart[]} callback.parts
     */
    value: function generateParts(callback) {
      var _this2 = this;

      var body = this.initBodyWithMetadata(['title']);

      this.part = new _core.MessagePart({
        mimeType: this.constructor.MIMEType,
        body: JSON.stringify(body)
      });

      var asyncCount = 0;
      var parts = [this.part];

      // Generate the parts for each carousel-item, attach the carousel-item role and call the callback when done
      this.items.forEach(function (item, index) {
        _this2.addChildModel(item, 'carousel-item', function (moreParts) {
          moreParts[0].mimeAttributes['item-order'] = index * 100 + 100;
          moreParts.forEach(function (p) {
            return parts.push(p);
          });
          asyncCount++;
          if (asyncCount === _this2.items.length) {
            callback(parts);
          }
        });
      });

      // This is done independently of generating the parts; should not modify the Parts that are being generrated,
      // and is here as there is no `afterMessageCreated` callback or event.
      this.items.forEach(function (item) {
        return item.mergeAction(_this2.action);
      });
    }

    /**
     * On receiving a new Layer.Core.Message, parse it and setup this Model's properties.
     *
     * This primarily consists of importing all of the `carousel-item` Message Parts.
     *
     * @method parseModelChildParts
     * @protected
     * @param {Object} payload
     */

  }, {
    key: 'parseModelChildParts',
    value: function parseModelChildParts(_ref) {
      var _this3 = this;

      var parts = _ref.parts,
          init = _ref.init;

      _get(CarouselModel.prototype.__proto__ || Object.getPrototypeOf(CarouselModel.prototype), 'parseModelChildParts', this).call(this, { parts: parts, init: init });
      this.items = this.getModelsByRole('carousel-item').sort(function (a, b) {
        var orderA = Number(a.part.mimeAttributes['item-order']);
        var orderB = Number(b.part.mimeAttributes['item-order']);
        return orderA - orderB;
      });

      // Setup the actions for each Carousel Item Model.
      this.items.forEach(function (item) {
        return item.mergeAction(_this3.action);
      });
    }

    /**
     * Any time the action property is set, update the actions of all of the Carousel Items.
     *
     * > *Note*
     * >
     * > One must set the action, not a property of the action for this to work.
     *
     * @method __updateAction
     * @private
     * @param {Object} newValue
     */

  }, {
    key: '__updateAction',
    value: function __updateAction(newValue) {
      if (this.items) this.items.forEach(function (item) {
        return item.mergeAction(newValue);
      });
    }
  }, {
    key: '__getItemCount',
    value: function __getItemCount() {
      return this.items.length;
    }
  }, {
    key: '__getItemLabel',
    value: function __getItemLabel() {
      return this.items.length > 1 ? this.constructor.ItemPlural : this.constructor.ItemSingular;
    }
  }]);

  return CarouselModel;
}(_core.MessageTypeModel);

// Defined in parent class, but must be redefined here for __updateAction to be hit whenever setting the action.


CarouselModel.prototype.action = null;

/**
 * Array of Layer.Core.MessageTypeModel Models, each representing a Carousel Item.
 *
 * @property {Layer.Core.MessageTypeModel[]} items
 */
CarouselModel.prototype.items = null;

/**
 * Set a title for the Carousel; if no title, titlebar is hidden, and layout is more spacious.
 *
 * @experimental Not supported on mobile devices
 * @property {String} title
 */
CarouselModel.prototype.title = '';

/**
 * Get the number of carousel items
 *
 * @readonly
 * @property {String} [itemCount=0]
 */
CarouselModel.prototype.itemCount = 0;

CarouselModel.prototype.itemLabel = '';

/**
 * One instance of this type
 *
 * @static
 * @property {String} [LabelSingular=Carousel]
 */
CarouselModel.LabelSingular = 'Carousel';

/**
 * One instance of this type
 *
 * @static
 * @property {String} [LabelPlural=Carousels]
 */
CarouselModel.LabelPlural = 'Carousels';

/**
 * One instance of this type
 *
 * @static
 * @property {String} [ItemSingular=item]
 */
CarouselModel.ItemSingular = 'item';

/**
 * One instance of this type
 *
 * @static
 * @property {String} [ItemPlural=items]
 */
CarouselModel.ItemPlural = 'items';

/**
 * Standard concise representation of this Message Type
 *
 * @static
 * @property {String} [SummaryTemplate=${itemCount} ${itemLabel}]
 */
CarouselModel.SummaryTemplate = '${itemCount} ${itemLabel}'; // eslint-disable-line no-template-curly-in-string

/**
 * The MIME Type recognized by and used by the Carousel Model.
 *
 * @static
 * @property {String} [MIMEType=application/vnd.layer.carousel+json]
 */
CarouselModel.MIMEType = 'application/vnd.layer.carousel+json';

/**
 * The UI Component to render the Carousel Model.
 *
 * @static
 * @property {String} [messageRenderer=layer-carousel-message-view]
 */
CarouselModel.messageRenderer = 'layer-carousel-message-view';

// Finish setting up the Class
_core.Root.initClass.apply(CarouselModel, [CarouselModel, 'CarouselModel']);

// Register the Message Model Class with the Client
_core2.default.Client.registerMessageTypeModelClass(CarouselModel, 'CarouselModel');

module.exports = CarouselModel;