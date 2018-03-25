'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _core = require('../../../core');

var _core2 = _interopRequireDefault(_core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               TextModel = Layer.Core.Client.getMessageTypeModelClass('TextModel');
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               MessageTypeListModel = Layer.Core.Client.getMessageTypeModelClass('MessageTypeListModel');
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 model = new MessageTypeListModel({
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   items: [
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     new TextModel({text: "Hello world", "title": "This is a Welcome"}),
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     new TextModel({text: "The world is not enough"}),
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     new TextModel({text: "Farewell world, I'm off to find a better planet"})
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   ]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 });
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 model.send({ conversation });
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * @class Layer.UI.cards.MessageTypeListModel
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * @extends layer.model
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               */


var MessageTypeListModel = function (_MessageTypeModel) {
  _inherits(MessageTypeListModel, _MessageTypeModel);

  function MessageTypeListModel() {
    _classCallCheck(this, MessageTypeListModel);

    return _possibleConstructorReturn(this, (MessageTypeListModel.__proto__ || Object.getPrototypeOf(MessageTypeListModel)).apply(this, arguments));
  }

  _createClass(MessageTypeListModel, [{
    key: 'generateParts',
    value: function generateParts(callback) {
      var _this2 = this;

      var body = this.initBodyWithMetadata([]);

      this.part = new _core.MessagePart({
        mimeType: this.constructor.MIMEType,
        body: JSON.stringify(body)
      });

      var asyncCount = 0;
      var parts = [this.part];
      this.items.forEach(function (item) {
        _this2.addChildModel(item, 'message-item', function (moreParts) {
          moreParts.forEach(function (p) {
            return parts.push(p);
          });
          asyncCount++;
          if (asyncCount === _this2.items.length) {
            callback(parts);
          }
        });
      });
      this.items.forEach(function (item) {
        return item.mergeAction(_this2.action);
      });
    }
  }, {
    key: 'parseModelChildParts',
    value: function parseModelChildParts() {
      var _this3 = this;

      _get(MessageTypeListModel.prototype.__proto__ || Object.getPrototypeOf(MessageTypeListModel.prototype), 'parseModelChildParts', this).call(this);

      // Gather all of the parts that represent a high level list element (ignoring any subparts they may bring with them)
      // Exclucde our main list part that defines the list rather than its list items
      var parts = this.childParts.filter(function (part) {
        return part.mimeAttributes.role === 'message-item';
      });
      this.items = parts.map(function (part) {
        return part.createModel();
      });
      this.items.forEach(function (item) {
        return item.mergeAction(_this3.action);
      });
    }
  }, {
    key: 'getOneLineSummary',
    value: function getOneLineSummary() {
      return this.items[this.items.length - 1].text;
    }
  }]);

  return MessageTypeListModel;
}(_core.MessageTypeModel);

MessageTypeListModel.prototype.action = null;
MessageTypeListModel.prototype.items = null;

MessageTypeListModel.Label = 'Messages';
MessageTypeListModel.messageRenderer = 'layer-message-type-list-view';
MessageTypeListModel.MIMEType = 'application/x.layer.message-type-list+json';

// Register the Message Model Class with the Client
_core2.default.Client.registerMessageTypeModelClass(MessageTypeListModel, 'MessageTypeListModel');

module.exports = MessageTypeListModel;