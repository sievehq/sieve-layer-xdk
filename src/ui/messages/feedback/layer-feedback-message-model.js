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
   model.generateMessage($("layer-conversation-view").conversation, message => message.send())
 * ```
 *
 *### Importing
 *
 * Not included with the standard build. Import using either:
 *
 * ```
 * import '@layerhq/web-xdk/lib/ui/messages/choice/layer-feedback-message-view';
 * import '@layerhq/web-xdk/lib/ui/messages/choice/layer-feedback-message-model';
 * ```
 *
 * @class Layer.UI.messages.FeedbackMessageModel
 * @extends Layer.Core.MessageTypeModel
 */
import { Client, MessagePart, Root, MessageTypeModel } from '../../../core';
import ResponseModel from '../response/layer-response-message-model';

class FeedbackModel extends MessageTypeModel {
  _generateParts(callback) {
    const body = this._initBodyWithMetadata([
      'title', 'prompt', 'promptWait', 'responseMessage',
      'summary', 'placeholder', 'customResponseData',
    ]);
    if (this.enabledFor && this.enabledFor.length) body.enabled_for = this.enabledFor;

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

    if (this.responses) {
      this._processNewResponses();
    }
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
    if (this.enabledFor[0] !== this.getClient().user.id) return false;
    return true;
  }

  sendFeedback() {
    if (this.enabledFor[0] !== this.getClient().user.id) return;

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

    const TextModel = Client.getMessageTypeModelClass('TextModel');
    const responseModel = new ResponseModel({
      participantData,
      responseTo: this.message.id,
      responseToNodeId: this.nodeId,
      displayModel: new TextModel({
        text: responseText,
      }),
    });
    if (!this.message.isNew()) {
      responseModel.generateMessage(this.message.getConversation(), message => message.send());
    }

    this._triggerAsync('message-type-model:change', {
      property: 'sentAt',
      oldValue: null,
      newValue: this.sentAt,
    });
  }

  _processNewResponses() {
    const data = this.responses.participantData[this.enabledFor[0].substring('layer:///identities/'.length)];
    if (data.rating) {
      this.rating = data.rating;
      this.comment = data.comment;
      this.sentAt = new Date(data.sent_at);
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

  getOneLineSummary() {
    return this.title;
  }

  getSummary(template, useYou) {
    return template.replace(/(\$\{.*?\})/g, (match) => {
      const key = match.substring(2, match.length - 1);
      switch (key) {
        case 'customer':
          if (useYou && this.enabledFor[0] === this.getClient().user.userId) {
            return 'You';
          } else {
            return this.getClient().getIdentity(this.enabledFor[0]).displayName || FeedbackModel.anonymousUserName;
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
FeedbackModel.prototype.summary = '${customer} rated the experience ${rating} stars';
FeedbackModel.prototype.responseMessage = '${customer} rated the experience ${rating} stars';
FeedbackModel.prototype.placeholder = 'Add a comment...';
FeedbackModel.prototype.enabledFor = '';
FeedbackModel.prototype.customResponseData = null;
FeedbackModel.prototype.rating = 0;
FeedbackModel.prototype.comment = '';
FeedbackModel.prototype.sentAt = null;
FeedbackModel.prototype.customer = '';

FeedbackModel.anonymousUserName = 'Customer';
FeedbackModel.Label = 'Feedback Request';
FeedbackModel.defaultAction = 'layer-open-expanded-view';
FeedbackModel.messageRenderer = 'layer-feedback-message-view';
FeedbackModel.messageRendererExpanded = 'layer-feedback-message-expanded-view';
FeedbackModel.MIMEType = 'application/vnd.layer.feedback+json';

Root.initClass.apply(FeedbackModel, [FeedbackModel, 'FeedbackModel']);

// Register the Message Model Class with the Client
Client.registerMessageTypeModelClass(FeedbackModel, 'FeedbackModel');

module.exports = FeedbackModel;


