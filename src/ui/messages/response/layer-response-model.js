import { Client, MessagePart, MessageTypeModel }  from '../../../core';

class ResponseModel extends MessageTypeModel {
  _generateParts(callback) {
    const messageId = this.responseTo.replace(/\/parts\/.*/, '');

    const body = this._initBodyWithMetadata(['responseTo', 'responseToNodeId', 'participantData', 'sharedData']);

    this.part = new MessagePart({
      mimeType: this.constructor.MIMEType,
      body: JSON.stringify(body),
    });
    const parts = [this.part];

    if (this.displayModel) {
      this._addModel(this.displayModel, 'message', (moreParts) => {
        moreParts.forEach(p => parts.push(p));
        callback(parts);
      });
    } else {
      callback(parts);
    }
  }

  // Reads identity_id and data out of the MessagePart.body and into this model
  _parseMessage(payload) {
    super._parseMessage(payload);

    const messagePart = this.childParts.filter(part => part.mimeAttributes.role === 'message')[0];
    if (messagePart) {
      this.displayModel = this.getClient().createMessageTypeModel(this.message, messagePart);
    }
  }

  getOneLineSummary() {
    return this.displayModel ? this.displayModel.getOneLineSummary() : '';
  }
}

ResponseModel.prototype.participantData = null;
ResponseModel.prototype.sharedData = null;
ResponseModel.prototype.responseTo = null;
ResponseModel.prototype.responseToNodeId = null;
ResponseModel.prototype.displayModel = null;

ResponseModel.messageRenderer = 'layer-response-view';
ResponseModel.MIMEType = 'application/vnd.layer.response+json';

// Register the Message Model Class with the Client
Client.registerMessageTypeModelClass(ResponseModel, 'ResponseModel');

module.exports = ResponseModel;
