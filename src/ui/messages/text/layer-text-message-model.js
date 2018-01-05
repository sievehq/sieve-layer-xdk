/**
 * Text Message Model is used to represent a Text Message.
 *
 * A Text Message represents standard communications between participants via text:
 *
 * ```
 * TextModel = Layer.Core.Client.getMessageTypeModelClass('TextModel')
 * model = new TextModel({ text: "hello world" }).send({ conversation });
 * ```
 *
 * The Text Message can also represent a more formal and structured message with
 * titles, subtitles, authors, etc...:
 *
 * ```
 * TextModel = Layer.Core.Client.getMessageTypeModelClass('TextModel')
 * model = new TextModel({
 *    text: "'License' shall mean the terms and conditions for use, reproduction, and distribution as defined by Sections 1 through 9 of this document.  'Licensor' shall mean the copyright owner or entity authorized by the copyright owner that is granting the License.",
 *    title: 'Apache Licence 2.0',
 *    subtitle: 'Please note our licensing',
 *    author: 'The Apache Software Foundation'
 * }).send({ conversation });
 * ```
 *
 * A Text Message should be sent by instantiating a Text Message Model, calling `generateMessage()`
 * and sending the generated message.
 *
 * @class Layer.UI.messages.TextMessageModel
 * @extends Layer.Core.MessageTypeModel
 */
import { Client, MessagePart, Root, MessageTypeModel } from '../../../core';
import { register } from '../../handlers/message/message-handlers';
import { STANDARD_MIME_TYPES } from '../../../constants';

class TextModel extends MessageTypeModel {

  /**
   * Generate all of the Layer.Core.MessagePart needed to represent this Model.
   *
   * Used for Sending the Text Message.
   *
   * @method _generateParts
   * @param {Function} callback
   * @param {Layer.Core.MessagePart[]} callback.parts
   * @private
   */
  _generateParts(callback) {
    const body = this._initBodyWithMetadata(['text', 'author', 'summary', 'title', 'subtitle']);

    this.part = new MessagePart({
      mimeType: this.constructor.MIMEType,
      body: JSON.stringify(body),
    });
    callback([this.part]);
  }

  // Used by Layer.UI.messages.StandardMessageViewContainer
  getDescription() { return this.subtitle; }
  getFooter() { return this.author; }

  // Used to render Last Message in the Conversation List
  getOneLineSummary() {
    return this.title || this.text;
  }
}

/**
 * The text of the Text Message.
 *
 * @property {String}
 */
TextModel.prototype.text = '';

/**
 * Not yet supported
 *
 * @property {String}
 */
TextModel.prototype.summary = '';

/**
 * The author of the Text Message; used as the Footer in the
 * Layer.UI.messages.StandardMessageViewContainer.
 *
 * @property {String}
 */
TextModel.prototype.author = '';

/**
 * The title to show under the text of the Text Message.
 *
 * @property {String}
 */
TextModel.prototype.title = '';

/**
 * Subtitle for the Text Message, used as the Description by
 * Layer.UI.messages.StandardMessageViewContainer.
 *
 * @property {String}
 */
TextModel.prototype.subtitle = '';

/**
 * Not yet supported
 *
 * @property {String}
 */
TextModel.prototype.mimeType = 'text/plain';

/**
 * Textual label representing all instances of Text Message.
 *
 * @static
 * @property {String} [Label=Text]
 */
TextModel.Label = 'Text';

/**
 * The MIME Type recognized by and used by the Text Model.
 *
 * @static
 * @property {String} [MIMEType=application/vnd.layer.text+json]
 */
TextModel.MIMEType = STANDARD_MIME_TYPES.TEXT;

/**
 * The UI Component to render the Text Model.
 *
 * @static
 * @property {String} [messageRenderer=layer-text-message-view]
 */
TextModel.messageRenderer = 'layer-text-message-view';

// Finish setting up the Class
Root.initClass.apply(TextModel, [TextModel, 'TextModel']);

// Register the Message Model Class with the Client
Client.registerMessageTypeModelClass(TextModel, 'TextModel');


/*
 * This Message Handler is NOT the main "layer-message-viewer" Message Handler;
 * rather, this Viewer detects text/plain messages, converts them to
 * Text Cards, and THEN lets the <layer-message-viewer /> component handle it from there
 */
register({
  tagName: 'layer-message-viewer',
  handlesMessage(message, container) {
    const isCard = Boolean(message.getPartsMatchingAttribute({ role: 'root' })[0]);
    if (!isCard && message.parts[0].mimeType === 'text/plain') {
      message.parts[0].body = `{"text": "${message.parts[0].body}"}`;
      message.parts[0].mimeType = TextModel.MIMEType + '; role=root';
      message._addToMimeAttributesMap(message.parts[0]);
      return true;
    }
  },
});

module.exports = TextModel;

