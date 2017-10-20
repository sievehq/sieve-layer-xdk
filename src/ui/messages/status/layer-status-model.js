/*
 * Generating Samples:

   StatusModel = layer.Core.Client.getMessageTypeModelClass('StatusModel')
   model = new StatusModel({text: "Your brains have been eaten."})
   model.generateMessage($("layer-conversation-view").conversation, message => message.send())

 * @class layer.ui.messages.StatusMessageModel
 * @extends layer.model
 */
import { Client, MessagePart, Root, MessageTypeModel } from '../../../core';
import { statusMimeTypes } from '../../base';

class StatusModel extends MessageTypeModel {
  _generateParts(callback) {
    const body = this._initBodyWithMetadata(['text']);

    this.part = new MessagePart({
      mimeType: this.constructor.MIMEType,
      body: JSON.stringify(body),
    });
    callback([this.part]);
  }

  getDescription() { return ''; }
  getFooter() { return ''; }

  getOneLineSummary() {
    return this.text;
  }
}

StatusModel.prototype.text = '';

StatusModel.Label = 'Status';
StatusModel.MIMEType = 'application/vnd.layer.status+json';
StatusModel.messageRenderer = 'layer-status-view';
Root.initClass.apply(StatusModel, [StatusModel, 'StatusModel']);

// Register the Message Model Class with the Client
Client.registerMessageTypeModelClass(StatusModel, 'StatusModel');
statusMimeTypes.push(StatusModel.MIMEType);

module.exports = StatusModel;

