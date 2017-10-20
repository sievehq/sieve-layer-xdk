/*
ReceiptModel = client.getMessageTypeModelClassForMimeType('application/vnd.layer.receipt+json')
LocationModel = client.getMessageTypeModelClassForMimeType('application/vnd.layer.location+json')
ListModel = client.getMessageTypeModelClassForMimeType('application/vnd.layer.list+json')
ProductModel = client.getMessageTypeModelClassForMimeType('application/vnd.layer.product+json')
ImageModel = client.getMessageTypeModelClassForMimeType('application/vnd.layer.image+json')
   ChoiceModel = layer.Core.Client.getMessageTypeModelClass('ChoiceModel')

new ReceiptModel({
  currency: 'USD',
  order: {
    number: 'FRODO-DODO-ONE'
  },
  paymentMethod: "VISA ****1234",
  summary: {
    subtitle: 'Your Purchase is Complete',
    shipping_cost: 350.01,
    total_tax: 0.01,
    total_cost: 350.02
  },
  shippingAddressModel: new LocationModel({
    city: 'San Francisco',
    name: 'Layer Inc',
    postalCode: '94107',
    administrativeArea: 'CA',
    street1: '655 4th st',
    description: 'Description should not show'
  }),
  items: [
      new ProductModel({
          url: "http://www.neimanmarcus.com/Manolo-Blahnik-Fiboslac-Crystal-Embellished-Satin-Halter-Pump/prod200660136_cat13410734__/p.prod?icid=&searchType=EndecaDrivenCat&rte=%252Fcategory.service%253FitemId%253Dcat13410734%2526pageSize%253D30%2526No%253D0%2526Ns%253DPCS_SORT%2526refinements%253D299%252C381%252C4294910321%252C717%252C730&eItemId=prod200660136&xbcpath=cat13410734%2Ccat13030734%2Ccat000141%2Ccat000000&cmCat=product",
          price: 525,
          quantity: 1,
          currency: "USD",
          brand: "Prison Garb Inc",
          name: "Formal Strait Jacket",
          description: "The right choice for special occasions with your crazed inlaws.  This will make you feel like you at last belong.",
          imageUrls: [ "http://l7.alamy.com/zooms/e33f19042cbe4ec1807bba7f3720ba62/executive-in-a-strait-jacket-aakafp.jpg" ],
          options: [
            new ChoiceModel({
              question: 'Size',
              type: 'Label',
              selectedAnswer: 'small',
              choices: [
                {text:  "Small", id: "small"},
                {text:  "Medium", id: "medium"},
                {text:  "Large", id: "large"},
              ]
            }),
            new ChoiceModel({
              question: 'Color',
              type: 'Label',
              selectedAnswer: 'white',
              choices: [
                {text:  "White", id: "white"},
                {text:  "Black", id: "black"},
                {text:  "Gold", id: "gold"},
              ]
            })
          ]
      }),
      new ProductModel({
          url: "http://www.neimanmarcus.com/Manolo-Blahnik-Fiboslac-Crystal-Embellished-Satin-Halter-Pump/prod200660136_cat13410734__/p.prod?icid=&searchType=EndecaDrivenCat&rte=%252Fcategory.service%253FitemId%253Dcat13410734%2526pageSize%253D30%2526No%253D0%2526Ns%253DPCS_SORT%2526refinements%253D299%252C381%252C4294910321%252C717%252C730&eItemId=prod200660136&xbcpath=cat13410734%2Ccat13030734%2Ccat000141%2Ccat000000&cmCat=product",
          price: 525,
          quantity: 1,
          currency: "USD",
          brand: "Prison Garb Inc",
          name: "Formal Strait Jacket",
          description: "The right choice for special occasions with your crazed inlaws.  This will make you feel like you at last belong.",
          imageUrls: [ "http://l7.alamy.com/zooms/e33f19042cbe4ec1807bba7f3720ba62/executive-in-a-strait-jacket-aakafp.jpg" ],
          options: [
            new ChoiceModel({
              question: 'Size',
              type: 'Label',
              selectedAnswer: 'small',
              choices: [
                {text:  "Small", id: "small"},
                {text:  "Medium", id: "medium"},
                {text:  "Large", id: "large"},
              ]
            }),
            new ChoiceModel({
              question: 'Color',
              type: 'Label',
              selectedAnswer: 'white',
              choices: [
                {text:  "White", id: "white"},
                {text:  "Black", id: "black"},
                {text:  "Gold", id: "gold"},
              ]
            })
          ]
      }),
      new ProductModel({
        url: "http://www.neimanmarcus.com/Manolo-Blahnik-Fiboslac-Crystal-Embellished-Satin-Halter-Pump/prod200660136_cat13410734__/p.prod?icid=&searchType=EndecaDrivenCat&rte=%252Fcategory.service%253FitemId%253Dcat13410734%2526pageSize%253D30%2526No%253D0%2526Ns%253DPCS_SORT%2526refinements%253D299%252C381%252C4294910321%252C717%252C730&eItemId=prod200660136&xbcpath=cat13410734%2Ccat13030734%2Ccat000141%2Ccat000000&cmCat=product",
        price: 525,
        quantity: 3,
        currency: "USD",
        brand: "Prison Garb Inc",
        name: "Formal Strait Jacket",
        description: "The right choice for special occasions with your crazed inlaws.  This will make you feel like you at last belong.",
        imageUrls: [ "http://l7.alamy.com/zooms/e33f19042cbe4ec1807bba7f3720ba62/executive-in-a-strait-jacket-aakafp.jpg" ],
        options: [
          new ChoiceModel({
            question: 'Size',
            type: 'Label',
            selectedAnswer: 'small',
            choices: [
              {text:  "Small", id: "small"},
              {text:  "Medium", id: "medium"},
              {text:  "Large", id: "large"},
            ]
          }),
          new ChoiceModel({
            question: 'Color',
            type: 'Label',
            selectedAnswer: 'white',
            choices: [
              {text:  "White", id: "white"},
              {text:  "Black", id: "black"},
              {text:  "Gold", id: "gold"},
            ]
          })
        ]
    })
  ]
}).generateMessage($("layer-conversation-view").conversation, message => message.send());



ReceiptModel = client.getMessageTypeModelClassForMimeType('application/vnd.layer.receipt+json')
LocationModel = client.getMessageTypeModelClassForMimeType('application/vnd.layer.location+json')
ListModel = client.getMessageTypeModelClassForMimeType('application/vnd.layer.list+json')
ProductModel = client.getMessageTypeModelClassForMimeType('application/vnd.layer.product+json')
ImageModel = client.getMessageTypeModelClassForMimeType('application/vnd.layer.image+json')
new ReceiptModel({
  currency: 'USD',
  order: {
    number: 'FRODO-DODO-ONE'
  },
  paymentMethod: "VISA ****1234",
  summary: {
    subtitle: 'Your Purchase is Complete',
    shipping_cost: 350.01,
    total_tax: 0.01,
    total_cost: 350.02
  },
  shippingAddressModel: new LocationModel({
    city: 'San Francisco',
    name: 'Layer Inc',
    postalCode: '94107',
    administrativeArea: 'CA',
    street1: '655 4th st',
    description: 'Description should not show'
  }),
  items: [
    {
      currency: 'USD',
      image_url: "https://farm5.staticflickr.com/4272/34912460025_be2700d3e7_k.jpg",
      price: 50,
      quantity: 3,
      title: "A pretty picture",
      subtitle: "Hang it on your wall"
    },
    {
      currency: 'USD',
      image_url: "https://farm5.staticflickr.com/4272/34912460025_be2700d3e7_k.jpg",
      price: 50,
      quantity: 1,
      title: "A boring picture",
      subtitle: "You hanging around near your wall"
    },
    {
      currency: 'USD',
      image_url: "https://farm5.staticflickr.com/4272/34912460025_be2700d3e7_k.jpg",
      price: 150,
      quantity: 1,
      title: "A terrifying picture",
      subtitle: 'And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.'
    },
  ]
}).generateMessage($("layer-conversation-view").conversation, message => message.send());

* @class layer.UI.cards.ReceiptModel
* @extends layer.model
*/
import { Client, MessagePart, MessageTypeModel } from '../../../core';
import Util from '../../../util';

class ReceiptModel extends MessageTypeModel {
  _generateParts(callback) {
    const body = this._initBodyWithMetadata(['createdAt', 'currency', 'discounts', 'paymentMethod',  'order']);
    body.summary = {};
    Object.keys(this.summary).forEach((keyName) => {
      const newKeyName = Util.hyphenate(keyName);
      body.summary[newKeyName] = this.summary[keyName];
    });

    this.part = new MessagePart({
      mimeType: this.constructor.MIMEType,
      body: JSON.stringify(body),
    });
    const parts = [this.part];

    const expectedCount = this.constructor.modelSet.filter(modelDef => this[modelDef.model]).length;
    let currentCount = 0;

    this.constructor.modelSet.forEach((modelDef) => {
      if (this[modelDef.model]) {
        if (modelDef.model === 'items') {
          this.items.forEach((item) => {
            this._addModel(item, modelDef.role, moreParts => moreParts.forEach(p => parts.push(p)));
          });
          currentCount++;
          if (currentCount === expectedCount) callback(parts);
        } else {
          this._addModel(this[modelDef.model], modelDef.role, (moreParts) => {
            moreParts.forEach(p => parts.push(p));
            currentCount++;
            if (currentCount === expectedCount) callback(parts);
          });
        }
      }
    });
  }

  _parseMessage(payload) {
    super._parseMessage(payload);
    if (!this.items) this.items = [];

    const summary = payload.summary;
    this.summary = {
      totalCost: 0,
    };
    if (summary) {
      Object.keys(summary).forEach((propertyName) => {
        this.summary[Util.camelCase(propertyName)] = summary[propertyName];
      });
    }

    this.items = this.getModelsFromPart('product-items');
    this.billingAddressModel = this.getModelFromPart('billing-address');
    this.shippingAddressModel = this.getModelFromPart('shipping-address');
    /*this.merchantModel = this.getModelFromPart('merchant');
    this.recipientModel = this.getModelFromPart('recipient');*/
  }

  getOneLineSummary() {
    return (this.message.sender.sessionOwner ? 'A ' : 'Your ') + this.constructor.Label;
  }
}

ReceiptModel.prototype.billingAddressModel = null;
ReceiptModel.prototype.shippingAddressModel = null;
ReceiptModel.prototype.createdAt = null;
ReceiptModel.prototype.currency = 'USD';
ReceiptModel.prototype.discounts = null;
ReceiptModel.prototype.items = null;
ReceiptModel.prototype.paymentMethod = '';

/* For use in v2 with Full Screen receipts
ReceiptModel.prototype.merchantModel = null;
ReceiptModel.prototype.recipientModel = null;
*/

// Expected fields: number, url
ReceiptModel.prototype.order = null;

// Expected fields: subtitle, shipping_cost, total_tax, total_cost
ReceiptModel.prototype.summary = null;
ReceiptModel.prototype.title = '';

ReceiptModel.Label = 'Receipt';
ReceiptModel.modelSet = [
  { model: 'items', role: 'product-items' },
  { model: 'shippingAddressModel', role: 'shipping-address' },
  { model: 'billingAddressModel', role: 'billing-address' },
  { model: 'merchantModel', role: 'merchant' },
  { model: 'recipientModel', role: 'recipient' },
];

ReceiptModel.Label = 'Receipt';
ReceiptModel.MIMEType = 'application/vnd.layer.receipt+json';
ReceiptModel.messageRenderer = 'layer-receipt-view';

// Register the Message Model Class with the Client
Client.registerMessageTypeModelClass(ReceiptModel, 'ReceiptModel');

module.exports = ReceiptModel;
