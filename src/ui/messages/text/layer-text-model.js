/*
 * Generating Samples:

   TextModel = layer.Core.Client.getMessageTypeModelClass('TextModel')

  // Full Metadata
  model = new TextModel({
    text: 'And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.',
    title: 'The Holy Hand Grenade',
    subtitle: 'This quote totally blows',
    author: 'King Arthur'
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send());

  // No subtitle
   model = new TextModel({
    text: 'And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.',
    title: 'The Holy Hand Grenade',
    author: 'King Arthur'
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send());

  // No author
  model = new TextModel({
    text: 'And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.',
    title: 'The Holy Hand Grenade',
    subtitle: 'This quote totally blows'
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send());

  // No title
  model = new TextModel({
    text: 'And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.',
    subtitle: 'This quote totally blows',
    author: 'King Arthur'
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send());


  // Only author
    model = new TextModel({
    text: 'And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.',
    author: 'King Arthur'
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send());

  // Only subtitle
model = new TextModel({
    text: 'And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.',
    subtitle: 'This quote totally blows'
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send());

  // Only title
  model = new TextModel({
    text: 'And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.',
    title: 'The Holy Hand Grenade',
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send());


    // External Content:
    TextModel = layer.Core.Client.getMessageTypeModelClass('TextModel')
    model = new TextModel({
    text: 'And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.',
    title: 'The Holy Hand Grenade',
    subtitle: 'This quote totally blows'
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send());

  // Custom Action
   model = new TextModel({
    text: 'And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.',
    title: 'The Holy Hand Grenade',
    action: {
      event: "open-url",
      data: {
        url: "https://layer.com"
      }
    }
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send());

  // Custom Data
  model = new TextModel({
    text: 'And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.',
    title: 'The Holy Hand Grenade',
    customData: {
      frodo: "the dodo"
    }
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send());

 * @class layer.ui.messages.TextMessageModel
 * @extends layer.model
 */
import { Client, MessagePart, Root, MessageTypeModel } from '../../../core';
import { registerMessageHandler } from '../../base';

class TextModel extends MessageTypeModel {
  _generateParts(callback) {
    const body = this._initBodyWithMetadata(['text', 'author', 'summary', 'title', 'subtitle']);

    this.part = new MessagePart({
      mimeType: this.constructor.MIMEType,
      body: JSON.stringify(body),
    });
    callback([this.part]);
  }

  getDescription() { return this.subtitle; }
  getFooter() { return this.author; }

  getOneLineSummary() {
    return this.title || this.text;
  }
}

TextModel.prototype.text = '';
TextModel.prototype.summary = '';
TextModel.prototype.author = '';
TextModel.prototype.title = '';
TextModel.prototype.subtitle = '';
TextModel.prototype.mimeType = 'text/plain';

TextModel.Label = 'Text';
TextModel.MIMEType = 'application/vnd.layer.text+json';
TextModel.messageRenderer = 'layer-text-view';
Root.initClass.apply(TextModel, [TextModel, 'TextModel']);

// Register the Message Model Class with the Client
Client.registerMessageTypeModelClass(TextModel, 'TextModel');


/*
 * This Message Handler is NOT the main "layer-message-viewer" Message Handler;
 * rather, this Viewer detects text/plain messages, converts them to
 * Text Cards, and THEN lets the <layer-message-viewer /> component handle it from there
 */
registerMessageHandler({
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

