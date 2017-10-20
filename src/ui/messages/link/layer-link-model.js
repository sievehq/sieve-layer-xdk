/*
 * Generating Samples:

  LinkModel = layer.Core.Client.getMessageTypeModelClass('LinkModel')

  model = new LinkModel({
    url: "https://layer.com/introducing-the-layer-conversation-design-system/",
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send());


   model = new LinkModel({
    url: "https://layer.com/introducing-the-layer-conversation-design-system/",
    description: ""
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send());


 model = new LinkModel({
    url: "https://layer.com/introducing-the-layer-conversation-design-system/",
    title: "Introducing the Layer Conversation Design System",
    imageUrl: "https://layer.com/wp-content/uploads/2017/07/bezier-blog-header-2x.png",
    description: "The Layer Conversation Design System helps you imagine and design the perfect customer conversation across devices."
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send());


  model = new LinkModel({
    url: "https://github.com/layerhq/layer-websdk",
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send());

  model = new LinkModel({
    url: "https://github.com/layerhq/layer-websdk",
    title: "Layer Web SDK"
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send());

  model = new LinkModel({
    url: "https://github.com/layerhq/layer-websdk",
    title: "Layer Web SDK",
    author: "Michael Kantor"
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send());

  model = new LinkModel({
    url: "https://github.com/layerhq/layer-websdk",
    title: "Layer Web SDK",
    author: "Michael Kantor",
    description: "SDKs for accessing layer's services from web, mobile web and WebViews",
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send());

  model = new LinkModel({
    url: "https://github.com/layerhq/layer-websdk",
    title: "Layer Web SDK",
    author: "Michael Kantor",
    description: "The Layer Web SDK is a JavaScript library for adding chat services to your web application. For detailed documentation, tutorials and guides please visit our Web SDK documentation. Supported Browsers: IE 11 and Edge, Safari 7, Chrome 42 and up, Firefox 40 and up.  Older versions of Chrome and Firefox will likely work.",
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send());

  LinkModel = layer.Core.Client.getMessageTypeModelClass('LinkModel')

  model = new LinkModel({
    url: "https://layer.com/introducing-the-layer-conversation-design-system/",
    description:  'And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.'
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send());
 * @class layer.UI.cards.LinkModel
 * @extends layer.model
 */
import { Client, MessagePart, MessageTypeModel, xhr }  from '../../../core';

const TitleRegEx = new RegExp(/<meta [^>]*property\s*=\s*['"]og:title['"].*?\/>/);
const DescriptionRegEx = new RegExp(/<meta [^>]*property\s*=\s*['"]og:description['"].*?\/>/);
const AuthorRegEx = new RegExp(/<meta [^>]*property\s*=\s*['"]og:author['"].*?\/>/);
const ImageRegEx = new RegExp(/<meta [^>]*property\s*=\s*['"]og:image['"].*?\/>/);

class LinkModel extends MessageTypeModel {
  _generateParts(callback) {
    const body = this._initBodyWithMetadata(['imageUrl', 'author', 'title', 'description', 'url']);
    ['image_url', 'author', 'title', 'description'].forEach(key => {
      if (body[key] === null) delete body[key];
    });

    this.part = new MessagePart({
      mimeType: this.constructor.MIMEType,
      body: JSON.stringify(body),
    });
    callback([this.part]);
  }

  getFooter() { return this.author; }
  getDescription() { return this.description; }

  getOneLineSummary() {
    return `${this.constructor.Label} ${this.title || this.url}`;
  }

  // TODO: This should have a callback so that a message sender can send the message once this has
  // finished populating
  gatherMetadata(callback) {
    xhr({
      method: 'GET',
      url: this.url,
    }, (result) => {
      if (result.success) {
        this.html = result.data;
        if (!this.title) this.title = this._getArticleMeta(TitleRegEx);
        if (!this.description) this.description = this._getArticleMeta(DescriptionRegEx);
        if (!this.imageUrl) this.imageUrl = this._getArticleMeta(ImageRegEx);
        if (!this.author) this.author = this._getArticleMeta(AuthorRegEx);
        this.trigger('change');
      }
      callback(result.success, result);
    });
  }

  _getArticleMeta(regex) {
    const matches = this.html.match(regex);
    if (matches) {
      const metatag = matches[0];
      if (metatag) {
        let contentMatches = metatag.match(/content\s*=\s*"(.*?[^/])"/);
        if (!contentMatches) contentMatches = metatag.match(/content\s*=\s*'(.*?[^/])'/);
        if (contentMatches) return contentMatches[1];
      }
    }
    return '';
  }
}

LinkModel.prototype.imageUrl = null;
LinkModel.prototype.author = null;
LinkModel.prototype.title = null;
LinkModel.prototype.description = null;
LinkModel.prototype.url = '';
LinkModel.prototype.html = '';

LinkModel.Label = 'Link to';
LinkModel.defaultAction = 'open-url';
LinkModel.messageRenderer = 'layer-link-view';

LinkModel.MIMEType = 'application/vnd.layer.link+json';

// Register the Card Model Class with the Client
Client.registerMessageTypeModelClass(LinkModel, 'LinkModel');

module.exports = LinkModel;
