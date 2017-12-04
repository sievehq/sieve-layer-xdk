/**
  FeedbackModel = layer.Core.Client.getMessageTypeModelClass('FeedbackModel')
  model = new FeedbackModel({
    title: "Experience Rooting", // Optional, defaults to Experience Rating
    prompt: "Rate your experiment 1-5 beakers", // Optional, defaults to Rate your experience 1-5 stars
    placeholder: "Tell us that you love us", // Optional, defaults to "Add a comment..."
    enabledFor: "layer:///identities/user_id",
    customResponseData: {hey: "ho"},
   });
   model.generateMessage($("layer-conversation-view").conversation, message => message.send())
 * ```
 *
 *
 * @class Layer.UI.messages.FeedbackModel
 * @extends Layer.Core.MessageTypeModel
 */
import { Client, MessagePart, Root, MessageTypeModel } from '../../../core';
import ResponseModel from '../response/layer-response-model';
import { ErrorDictionary } from '../../../core/layer-error';
import { registerMessageActionHandler } from '../../base';

class FeedbackModel extends MessageTypeModel {
  _generateParts(callback) {
    const body = this._initBodyWithMetadata([
      'title', 'prompt', 'placeholder', 'enabledFor', 'customResponseData',
    ]);
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
    if (this.rating !== rating || this.comment !== comment) {
      this._triggerAsync('change');
    }
  }

  isEditable() {
    if (this.sentAt) return false;
    if (this.getClient().user.id !== this.enabledFor) return false;
    return true;
  }

  sendFeedback() {
    if (this.getClient().user.id !== this.enabledFor) return;

    var responseText = `${this.getClient().user.displayName} rated the experience ${this.rating} stars`;
    this.sentAt = new Date();

    const participantData = {
      rating: this.rating,
      comment: this.comment,
      sentAt: this.sentAt.toISOString(),
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

    this._triggerAsync('change');
  }

  _processNewResponses() {
    const data = this.responses.participantData[this.enabledFor.substring('layer:///identities/'.length)];
    if (data.rating) {
      this.rating = data.rating;
      this.comment = data.comment;
      this.sentAt = new Date(data.sentAt);
    }
  }

  getOneLineSummary() {
    return this.title;
  }

  getSummary() {
    return this.summary.replace(/(\$\{.*?\})/g, (match) => {
      const key = match.substring(2, match.length - 1);
      switch(key) {
        case 'sender':
          return (this.getClient().user.id === this.enabledFor) ? 'You' : this.getClient().getIdentity(this.enabledFor).displayName;
        default:
          return this[key];
      }
    });
  }
}


FeedbackModel.prototype.title = 'Experience Rating';
FeedbackModel.prototype.prompt = 'Rate your experience 1-5 stars';
FeedbackModel.prototype.summary = '${sender} rated the experience ${rating} stars';
FeedbackModel.prototype.placeholder = 'Add a comment...';
FeedbackModel.prototype.enabledFor = '';
FeedbackModel.prototype.customResponseData = null;
FeedbackModel.prototype.rating = 0;
FeedbackModel.prototype.comment = '';
FeedbackModel.prototype.sentAt = null;

FeedbackModel.Label = 'Feedback Request';
FeedbackModel.defaultAction = 'layer-model-expanded-view';
FeedbackModel.messageRenderer = 'layer-feedback-view';
FeedbackModel.messageRendererExpanded = 'layer-feedback-expanded-view';
FeedbackModel.MIMEType = 'application/vnd.layer.feedback+json';

Root.initClass.apply(FeedbackModel, [FeedbackModel, 'FeedbackModel']);

// Register the Message Model Class with the Client
Client.registerMessageTypeModelClass(FeedbackModel, 'FeedbackModel');

module.exports = FeedbackModel;

registerMessageActionHandler('layer-model-expanded-view', function openExpandedViewHandler(customData) {
  var dialog = document.createElement('layer-message-viewer-expanded');
  dialog.model = this.model;

  let node = this;
  while (node.parentNode) {
    node = node.parentNode;
    if (node.parentNode.tagName === 'BODY' || node.parentNode.tagName === 'LAYER-CONVERSATION-VIEW') break;
  }

  node.appendChild(dialog);
});

