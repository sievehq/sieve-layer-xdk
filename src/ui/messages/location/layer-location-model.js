/*
 * Generating Samples:

   LocationModel = layer.Core.Client.getMessageTypeModelClass('LocationModel');

   model = new LocationModel({
     latitude: 37.7734858,
     longitude: -122.3916087,
     heading: 23.45,
     altitude: 35.67,
     title: "Here I am.  Right there on the dot. I'm stuck on the dot.  Please free me.",
     description: "Dot prisoner 455 has attempted to escape.  Send in the puncutation and make a very strong point about dot prisoner escapes",
     accuracy: 0.8,
     createdAt: new Date(),
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send());

  LocationModel = layer.Core.Client.getMessageTypeModelClass('LocationModel');
  model = new LocationModel({
    city: 'San Francisco',
    title: 'Layer Inc',
    postalCode: '94107',
    administrativeArea: 'CA',
    street1: '655 4th st'
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send());

  model = new LocationModel({
     latitude: 37.7734858,
     longitude: -122.3916087
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send());

  LocationModel = layer.Core.Client.getMessageTypeModelClass('LocationModel');
  ButtonsModel = layer.Core.Client.getMessageTypeModelClass('ButtonsModel');
  model = new ButtonsModel({
    buttons: [{"type": "action", "text": "Navigate", "event": "open-map"}],
    contentModel: new LocationModel({
      latitude: 37.7734858,
      longitude: -122.3916087,
      heading: "North",
      altitude: 35,
      title: "Here I am.  Right there on the dot. I'm stuck on the dot.  Please free me.",
      description: "Dot prisoner 455 has attempted to escape.  Send in the puncutation and make a very strong point about dot prisoner escapes",
      accuracy: 0.8,
      createdAt: new Date()
    })
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send());

  LocationModel = layer.Core.Client.getMessageTypeModelClass('LocationModel');
  new LocationModel({
      city: 'San Francisco',
      title: 'Layer Inc',
      postalCode: '94107',
      administrativeArea: 'CA',
      street1: '655 4th st',
      description:  'And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.'
    }).generateMessage($("layer-conversation-view").conversation, message => message.send());;
 * @class layer.UI.cards.LocationModel
 * @extends layer.model
 */
import { Client, MessagePart, MessageTypeModel } from '../../../core';


class LocationModel extends MessageTypeModel {
  _generateParts(callback) {
    const body = this._initBodyWithMetadata(['latitude', 'longitude', 'heading', 'accuracy', 'createdAt', 'altitude', 'description', 'title', 'city', 'country', 'postalCode', 'administrativeArea', 'street1', 'street2']);

    this.part = new MessagePart({
      mimeType: this.constructor.MIMEType,
      body: JSON.stringify(body),
    });
    callback([this.part]);
  }

  getDescription() {
    if (this.description && this.showAddress !== true) {
      return this.description;
    } else if (this.street1 || this.city || this.postalCode) {
      return this.street1 + (this.street2 ? '<br/>' + this.street2 : '') + `<br/>${this.city} ${this.administrativeArea}${this.postalCode ? ', ' + this.postalCode : ''}`;
    }
  }
}

LocationModel.prototype.latitude = 0;
LocationModel.prototype.longitude = 0;
LocationModel.prototype.zoom = 16;
LocationModel.prototype.heading = null;
LocationModel.prototype.altitude = null;
LocationModel.prototype.title = '';
LocationModel.prototype.accuracy = null;
LocationModel.prototype.createdAt = null;
LocationModel.prototype.description = '';
LocationModel.prototype.city = '';
LocationModel.prototype.country = '';
LocationModel.prototype.postalCode = '';
LocationModel.prototype.administrativeArea = '';
LocationModel.prototype.street1 = '';
LocationModel.prototype.street2 = '';
LocationModel.prototype.showAddress = null; // 3 state: true: show the address; false: show the description, null: permit default behavior.  Set by Parent Card via API and NOT set via model

LocationModel.Label = 'Location';
LocationModel.defaultAction = 'open-map';
LocationModel.messageRenderer = 'layer-location-view';
LocationModel.MIMEType = 'application/vnd.layer.location+json';

// Register the Card Model Class with the Client
Client.registerMessageTypeModelClass(LocationModel, 'LocationModel');

module.exports = LocationModel;
