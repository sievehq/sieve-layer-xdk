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
import { client as Client } from '../../../settings';
import Core, { MessagePart, Root, MessageTypeModel } from '../../../core';
import ResponseModel from '../response/layer-response-message-model';

class FeedbackModel extends MessageTypeModel {
  _generateParts(callback) {
    const body = this._initBodyWithMetadata([
      'title', 'prompt', 'promptWait', 'responseMessage',
      'summary', 'placeholder', 'customResponseData',
    ]);
    if (this.enabledFor && this.enabledFor.length) {
      body.enabled_for = this.enabledFor;
    } else {
      throw new Error('enabled_for is required');
    }

    this.part = new MessagePart({
      mimeType: this.constructor.MIMEType,
      body: JSON.stringify(body),
    });
    callback([this.part]);
  }

  _parseMessage(payload) {
    this.enabledFor = payload.enabled_for;// shouldn't be needed; review sequencing of parsing response data vs property data in parent method
    const rating = this.rating;
    const comment = this.comment;
    super._parseMessage(payload);

    if (this.rating !== rating) {
      this._triggerAsync('message-type-model:change', {
        property: 'rating',
        newValue: this.rating,
        oldValue: rating,
      });
    }
    if (this.comment !== comment) {
      this._triggerAsync('message-type-model:change', {
        property: 'comment',
        newValue: this.comment,
        oldValue: comment,
      });
    }
  }

  isEditable() {
    if (this.sentAt) return false;
    if (this.enabledFor[0] !== Client.user.id) return false;
    return true;
  }

  sendFeedback() {
    if (this.enabledFor[0] !== Client.user.id) return;

    const responseText = this.getSummary(this.responseMessage, false);
    this.sentAt = new Date();

    const participantData = {
      rating: this.rating,
      comment: this.comment,
      sent_at: this.sentAt.toISOString(),
    };

    if (this.customResponseData) {
      Object.keys(this.customResponseData).forEach(key => (participantData[key] = this.customResponseData[key]));
    }

    const StatusModel = Core.Client.getMessageTypeModelClass('StatusModel');
    const responseModel = new ResponseModel({
      participantData,
      responseTo: this.message.id,
      responseToNodeId: this.nodeId,
      displayModel: new StatusModel({
        text: responseText,
      }),
    });
    if (!this.message.isNew()) {
      responseModel.send({ conversation: this.message.getConversation() });
    }

    this._triggerAsync('message-type-model:change', {
      property: 'sentAt',
      oldValue: null,
      newValue: this.sentAt,
    });
  }

  _processNewResponses() {
    const rating = this.responses.getResponse('rating', this.enabledFor[0]);
    if (rating) {
      this.rating = rating;
      this.comment = this.responses.getResponse('comment', this.enabledFor[0]);
      this.sentAt = new Date(this.responses.getResponse('sent_at', this.enabledFor[0]));
    }
  }

  __setRating(newValue, oldValue) {
    this._triggerAsync('message-type-model:change', {
      property: 'rating',
      oldValue,
      newValue,
    });
  }

  __setComment(newValue, oldValue) {
    this._triggerAsync('message-type-model:change', {
      property: 'comment',
      oldValue,
      newValue,
    });
  }

  getSummary(template, useYou) {
    return template.replace(/(\$\{.*?\})/g, (match) => {
      const key = match.substring(2, match.length - 1);
      switch (key) {
        case 'customer':
          if (useYou && this.enabledFor[0] === Client.user.userId) {
            return 'You';
          } else {
            return Client.getIdentity(this.enabledFor[0]).displayName || FeedbackModel.anonymousUserName;
          }
        default:
          return this[key];
      }
    });
  }
}

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

Root.initClass.apply(FeedbackModel, [FeedbackModel, 'FeedbackModel']);

// Register the Message Model Class with the Client
Core.Client.registerMessageTypeModelClass(FeedbackModel, 'FeedbackModel');

module.exports = FeedbackModel;

