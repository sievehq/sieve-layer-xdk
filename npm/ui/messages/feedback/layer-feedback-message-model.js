/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 FeedbackModel = Layer.Core.Client.getMessageTypeModelClass('FeedbackModel')
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 model = new FeedbackModel({
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   title: "Experience Rooting", // Optional, defaults to Experience Rating
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   prompt: "Rate your experiment 1-5 beakers", // Optional, defaults to Rate your experience 1-5 stars
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   promptWait: "Waiting for more Beakers",
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   // ${rating} extracts this.rating; ${customer} gets the customer's displayName... or "You" if rated by the customer viewing it.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   summary: "${rating} stars by ${customer}",
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   // ${rating} extracts this.rating; ${customer} gets the customer's displayName (but not "You" as all users will see the same message)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   responseMessage: "Rated ${rating} beakers by ${customer}",
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   placeholder: "Tell us that you love us", // Optional, defaults to "Add a comment..."
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   enabledFor: ["layer:///identities/user_id"], // Only a single Identity is supported
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   customResponseData: {hey: "ho"},
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  });
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  model.send({ conversation });
 * ```
 *
 *### Importing
 *
 * Not included with the standard build. Import using either:
 *
 * ```
 * import '@layerhq/web-xdk/ui/messages/choice/layer-feedback-message-view';
 * import '@layerhq/web-xdk/ui/messages/choice/layer-feedback-message-model';
 * ```
 *
 * @class Layer.UI.messages.FeedbackMessageModel
 * @extends Layer.Core.MessageTypeModel
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _settings = require('../../../settings');

var _core = require('../../../core');

var _core2 = _interopRequireDefault(_core);

var _layerResponseMessageModel = require('../response/layer-response-message-model');

var _layerResponseMessageModel2 = _interopRequireDefault(_layerResponseMessageModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } 


var FeedbackModel = function (_MessageTypeModel) {
  _inherits(FeedbackModel, _MessageTypeModel);

  function FeedbackModel() {
    _classCallCheck(this, FeedbackModel);

    return _possibleConstructorReturn(this, (FeedbackModel.__proto__ || Object.getPrototypeOf(FeedbackModel)).apply(this, arguments));
  }

  _createClass(FeedbackModel, [{
    key: 'generateParts',
    value: function generateParts(callback) {
      var body = this.initBodyWithMetadata(['title', 'prompt', 'promptWait', 'responseMessage', 'summary', 'placeholder', 'customResponseData']);
      if (this.enabledFor && this.enabledFor.length) {
        body.enabled_for = this.enabledFor;
      } else {
        throw new Error('enabled_for is required');
      }

      this.part = new _core.MessagePart({
        mimeType: this.constructor.MIMEType,
        body: JSON.stringify(body)
      });
      callback([this.part]);
    }

    // See parent class

  }, {
    key: 'parseModelPart',
    value: function parseModelPart(_ref) {
      var payload = _ref.payload,
          isEdit = _ref.isEdit;

      this.enabledFor = payload.enabled_for; // shouldn't be needed; review sequencing of parsing response data vs property data in parent method
      var rating = this.rating;
      var comment = this.comment;
      _get(FeedbackModel.prototype.__proto__ || Object.getPrototypeOf(FeedbackModel.prototype), 'parseModelPart', this).call(this, { payload: payload, isEdit: isEdit });

      if (this.rating !== rating) {
        this._triggerAsync('message-type-model:change', {
          property: 'rating',
          newValue: this.rating,
          oldValue: rating
        });
      }
      if (this.comment !== comment) {
        this._triggerAsync('message-type-model:change', {
          property: 'comment',
          newValue: this.comment,
          oldValue: comment
        });
      }
    }
  }, {
    key: 'parseModelResponses',
    value: function parseModelResponses() {
      var rating = this.responses.getResponse('rating', this.enabledFor[0]);
      if (rating) {
        this.rating = rating;
        this.comment = this.responses.getResponse('comment', this.enabledFor[0]);
        this.sentAt = new Date(this.responses.getResponse('sent_at', this.enabledFor[0]));
      }
    }
  }, {
    key: 'isEditable',
    value: function isEditable() {
      if (this.sentAt) return false;
      if (this.enabledFor[0] !== _settings.client.user.id) return false;
      return true;
    }
  }, {
    key: 'sendFeedback',
    value: function sendFeedback() {
      var _this2 = this;

      if (this.enabledFor[0] !== _settings.client.user.id) return;

      var responseText = this.getSummary(this.responseMessage, false);
      this.sentAt = new Date();

      var participantData = {
        rating: this.rating,
        comment: this.comment,
        sent_at: this.sentAt.toISOString()
      };

      if (this.customResponseData) {
        Object.keys(this.customResponseData).forEach(function (key) {
          return participantData[key] = _this2.customResponseData[key];
        });
      }

      var StatusModel = _core2.default.Client.getMessageTypeModelClass('StatusModel');
      var responseModel = new _layerResponseMessageModel2.default({
        participantData: participantData,
        responseTo: this.message.id,
        responseToNodeId: this.nodeId,
        displayModel: new StatusModel({
          text: responseText
        })
      });
      if (!this.message.isNew()) {
        responseModel.send({ conversation: this.message.getConversation() });
      }

      this._triggerAsync('message-type-model:change', {
        property: 'sentAt',
        oldValue: null,
        newValue: this.sentAt
      });
    }
  }, {
    key: '__setRating',
    value: function __setRating(newValue, oldValue) {
      this._triggerAsync('message-type-model:change', {
        property: 'rating',
        oldValue: oldValue,
        newValue: newValue
      });
    }
  }, {
    key: '__setComment',
    value: function __setComment(newValue, oldValue) {
      this._triggerAsync('message-type-model:change', {
        property: 'comment',
        oldValue: oldValue,
        newValue: newValue
      });
    }
  }, {
    key: 'getSummary',
    value: function getSummary(template, useYou) {
      var _this3 = this;

      return template.replace(/(\$\{.*?\})/g, function (match) {
        var key = match.substring(2, match.length - 1);
        switch (key) {
          case 'customer':
            if (useYou && _this3.enabledFor[0] === _settings.client.user.userId) {
              return 'You';
            } else {
              return _settings.client.getIdentity(_this3.enabledFor[0]).displayName || FeedbackModel.anonymousUserName;
            }
          default:
            return _this3[key];
        }
      });
    }
  }]);

  return FeedbackModel;
}(_core.MessageTypeModel);

FeedbackModel.prototype.title = 'Experience Rating';
FeedbackModel.prototype.prompt = 'Rate your experience 1-5 stars';
FeedbackModel.prototype.promptWait = 'Waiting for Feedback';
FeedbackModel.prototype.summary = '${customer} rated the experience ${rating} stars'; // eslint-disable-line no-template-curly-in-string
FeedbackModel.prototype.responseMessage = '${customer} rated the experience ${rating} stars'; // eslint-disable-line no-template-curly-in-string
FeedbackModel.prototype.placeholder = 'Add a comment...';
FeedbackModel.prototype.enabledFor = '';
FeedbackModel.prototype.customResponseData = null;
FeedbackModel.prototype.rating = 0;
FeedbackModel.prototype.comment = '';
FeedbackModel.prototype.sentAt = null;
FeedbackModel.prototype.customer = '';

FeedbackModel.anonymousUserName = 'Customer';

/**
 * One instance of this type
 *
 * @static
 * @property {String} [LabelSingular=Feedback Request]
 */
FeedbackModel.LabelSingular = 'Feedback Request';

/**
 * One instance of this type
 *
 * @static
 * @property {String} [LabelPlural=Feedback Requests]
 */
FeedbackModel.LabelPlural = 'Feedback Requests';

/**
 * Standard concise representation of this Message Type
 *
 * @static
 * @property {String} [SummaryTemplate=${prompt}]
 */
FeedbackModel.SummaryTemplate = '${prompt}'; // eslint-disable-line no-template-curly-in-string

FeedbackModel.defaultAction = 'layer-open-expanded-view';
FeedbackModel.messageRenderer = 'layer-feedback-message-view';
FeedbackModel.messageRendererExpanded = 'layer-feedback-message-expanded-view';
FeedbackModel.MIMEType = 'application/vnd.layer.feedback+json';

_core.Root.initClass.apply(FeedbackModel, [FeedbackModel, 'FeedbackModel']);

// Register the Message Model Class with the Client
_core2.default.Client.registerMessageTypeModelClass(FeedbackModel, 'FeedbackModel');

module.exports = FeedbackModel;