/*
  TextModel = client.getMessageTypeModelClassForMimeType('application/vnd.layer.text+json')
  CarouselModel = client.getMessageTypeModelClassForMimeType('application/vnd.layer.carousel+json')
  model = new CarouselModel({
    items: [
      new TextModel({text: "Carousel item 1", "title": "C 1"}),
      new TextModel({text: "Carousel item 2", "title": "C 2"}),
      new TextModel({text: "Carousel item 3", "title": "C 3"})
    ]
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send())


ButtonModel = layer.Core.Client.getMessageTypeModelClass('ButtonsModel')
TextModel = layer.Core.Client.getMessageTypeModelClass('TextModel');
CarouselModel = layer.Core.Client.getMessageTypeModelClass('CarouselModel');
model = new CarouselModel({
  items: [
    new ButtonModel({
      buttons: [
        {"type": "choice", "choices": [{"text": "\uD83D\uDC4D", "id": "like", "tooltip": "like", "icon": "custom-like-button"}, {"text": "\uD83D\uDC4E", "id": "dislike", "tooltip": "dislike", "icon": "custom-dislike-button"}], "data": {"responseName": "satisfaction", selectedAnswer: 'dislike', allowReselect: true}},
        {"type": "choice", "choices": [{"text": "Buy Me", "id": "buy", "tooltip": "buy"}], "data": {"responseName": "buy", allowReselect: false}},
      ],
      contentModel: new TextModel({
        text: 'And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. ',
        title: 'The Holy Hand Grenade',
        author: 'King Arthur'
      })
    }),
    new ButtonModel({
      buttons: [
        {"type": "choice", "choices": [{"text": "\uD83D\uDC4D", "id": "like", "tooltip": "like", "icon": "custom-like-button"}, {"text": "\uD83D\uDC4E", "id": "dislike", "tooltip": "dislike", "icon": "custom-dislike-button"}], "data": {"responseName": "satisfaction", selectedAnswer: 'dislike', allowReselect: true}},
        {"type": "choice", "choices": [{"text": "Buy Me", "id": "buy", "tooltip": "buy"}], "data": {"responseName": "buy", allowReselect: false}},
      ],
      contentModel: new TextModel({
        text: 'And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. ',
        title: 'The Holy Hand Grenade',
        author: 'King Arthur'
      })
    }),
    new ButtonModel({
      buttons: [
        {"type": "choice", "choices": [{"text": "\uD83D\uDC4D", "id": "like", "tooltip": "like", "icon": "custom-like-button"}, {"text": "\uD83D\uDC4E", "id": "dislike", "tooltip": "dislike", "icon": "custom-dislike-button"}], "data": {"responseName": "satisfaction", selectedAnswer: 'dislike', allowReselect: true}},
        {"type": "choice", "choices": [{"text": "Buy Me", "id": "buy", "tooltip": "buy"}], "data": {"responseName": "buy", allowReselect: false}},
      ],
      contentModel: new TextModel({
        text: 'And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. ',
        title: 'The Holy Hand Grenade',
        author: 'King Arthur'
      })
    })
  ]
});
model.generateMessage($("layer-conversation-view").conversation, message => message.send())

  // Product Carousel:

  ProductModel = client.getMessageTypeModelClassForMimeType('application/vnd.layer.product+json')
  ImageModel = client.getMessageTypeModelClassForMimeType('application/vnd.layer.image+json')
  CarouselModel = client.getMessageTypeModelClassForMimeType('application/vnd.layer.carousel+json')
     ButtonsModel = layer.Core.Client.getMessageTypeModelClass('ButtonsModel')
     ChoiceModel = layer.Core.Client.getMessageTypeModelClass('ChoiceModel')
  model = new CarouselModel({
    items: [
      new ButtonsModel({
        buttons: [
          {
            "type": "choice",
            "choices": [{"text": "\uD83D\uDC4D", "id": "like", "tooltip": "like", "icon": "custom-like-button"}, {"text": "\uD83D\uDC4E", "id": "dislike", "tooltip": "dislike", "icon": "custom-dislike-button"}],
            "data": {"responseName": "thumborientation", allowReselect: true, allowDeselect: true}
          },
          {"type": "choice", "choices": [{"text": "Buy Me", "id": "buy", "tooltip": "buy"}], "data": {"responseName": "buy", allowReselect: false}}
        ],
        contentModel: new ProductModel({
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
      }),
      new ButtonsModel({
        buttons: [
          {
            "type": "choice",
            "choices": [{"text": "\uD83D\uDC4D", "id": "like", "tooltip": "like", "icon": "custom-like-button"}, {"text": "\uD83D\uDC4E", "id": "dislike", "tooltip": "dislike", "icon": "custom-dislike-button"}],
            "data": {"responseName": "thumborientation", allowReselect: true, allowDeselect: true}
          },
          {"type": "choice", "choices": [{"text": "Buy Me", "id": "buy", "tooltip": "buy"}], "data": {"responseName": "buy", allowReselect: false}}
        ],
        contentModel: new ProductModel({
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
      }),
      new ButtonsModel({
        buttons: [
          {
            "type": "choice",
            "choices": [{"text": "\uD83D\uDC4D", "id": "like", "tooltip": "like", "icon": "custom-like-button"}, {"text": "\uD83D\uDC4E", "id": "dislike", "tooltip": "dislike", "icon": "custom-dislike-button"}],
            "data": {"responseName": "thumborientation", allowReselect: true, allowDeselect: true}
          },
          {"type": "choice", "choices": [{"text": "Buy Me", "id": "buy", "tooltip": "buy"}], "data": {"responseName": "buy", allowReselect: false}}
        ],
        contentModel: new ProductModel({
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
      }),
      new ButtonsModel({
        buttons: [
          {
            "type": "choice",
            "choices": [{"text": "\uD83D\uDC4D", "id": "like", "tooltip": "like", "icon": "custom-like-button"}, {"text": "\uD83D\uDC4E", "id": "dislike", "tooltip": "dislike", "icon": "custom-dislike-button"}],
            "data": {"responseName": "thumborientation", allowReselect: true, allowDeselect: true}
          },
          {"type": "choice", "choices": [{"text": "Buy Me", "id": "buy", "tooltip": "buy"}], "data": {"responseName": "buy", allowReselect: false}}
        ],
        contentModel: new ProductModel({
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
      }),
      new ButtonsModel({
        buttons: [
          {
            "type": "choice",
            "choices": [{"text": "\uD83D\uDC4D", "id": "like", "tooltip": "like", "icon": "custom-like-button"}, {"text": "\uD83D\uDC4E", "id": "dislike", "tooltip": "dislike", "icon": "custom-dislike-button"}],
            "data": {"responseName": "thumborientation", allowReselect: true, allowDeselect: true}
          },
          {"type": "choice", "choices": [{"text": "Buy Me", "id": "buy", "tooltip": "buy"}], "data": {"responseName": "buy", allowReselect: false}}
        ],
        contentModel: new ProductModel({
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
      }),
      new ButtonsModel({
        buttons: [
          {
            "type": "choice",
            "choices": [{"text": "\uD83D\uDC4D", "id": "like", "tooltip": "like", "icon": "custom-like-button"}, {"text": "\uD83D\uDC4E", "id": "dislike", "tooltip": "dislike", "icon": "custom-dislike-button"}],
            "data": {"responseName": "thumborientation", allowReselect: true, allowDeselect: true}
          },
          {"type": "choice", "choices": [{"text": "Buy Me", "id": "buy", "tooltip": "buy"}], "data": {"responseName": "buy", allowReselect: false}}
        ],
        contentModel: new ProductModel({
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
      }),
    ]
  }).generateMessage($("layer-conversation-view").conversation, message => message.send())


    TextModel = layer.Core.Client.getMessageTypeModelClass('TextModel');
  CarouselModel = layer.Core.Client.getMessageTypeModelClass('CarouselModel');
  new CarouselModel({
    items: [
      new TextModel({text: "Carousel item 1", title: "Title 1"}),
      new TextModel({text: "Carousel item 2", title: "Title 2"}),
      new TextModel({text: "Carousel item 3", title: "Title 3"}),
      new TextModel({text: "Bacon ipsum dolor amet non in minim, incididunt capicola bresaola brisket exercitation commodo nulla ex chuck dolore beef ribs.  Et beef prosciutto pig pork.  Pancetta pork loin ullamco ea nostrud minim reprehenderit labore kevin, brisket est.  Short ribs nostrud ex, beef ribs dolor tenderloin swine tail.  Minim ut corned beef, prosciutto shoulder ut exercitation pig rump leberkas pork adipisicing.  Eu beef ribs aute meatball.  Pork belly sausage in sirloin excepteur laboris, non est pancetta qui leberkas anim eiusmod spare ribs.", title: "Title 4"}),
      new TextModel({text: "Carousel item 3", title: "Title 5"}),
      new TextModel({text: "Carousel item 3", title: 'And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.'})
    ]
  }).generateMessage($("layer-conversation-view").conversation, message => message.send())

* @class layer.UI.cards.CarouselModel
* @extends layer.model
*/
import { Client, MessagePart, MessageTypeModel }  from '../../../core';
import Util from '../../../util';

class CarouselModel extends MessageTypeModel {
  _generateParts(callback) {
    const body = this._initBodyWithMetadata(['title']);

    this.part = new MessagePart({
      mimeType: this.constructor.MIMEType,
      body: JSON.stringify(body),
    });

    let asyncCount = 0;
    let parts = [this.part];
    this.items.forEach((item) => {
      this._addModel(item, 'carousel-item', (moreParts) => {
        moreParts.forEach(p => parts.push(p));
        asyncCount++;
        if (asyncCount === this.items.length) {
          callback(parts);
        }
      });
    });
    this.items.forEach(item => item._mergeAction(this.action));
  }

  _parseMessage(payload) {
    super._parseMessage(payload);

    // Gather all of the parts that represent a high level list element (ignoring any subparts they may bring with them)
    // Exclucde our main list part that defines the list rather than its list items
    const parts = this.childParts.filter(part => part.mimeAttributes.role === 'carousel-item');
    this.items = parts.map(part => this.getClient().createMessageTypeModel(this.message, part));
    this.items.forEach(item => item._mergeAction(this.action));
  }

  __updateAction(newValue) {
    if (this.items) this.items.forEach(item => item._mergeAction(newValue));
  }

  getOneLineSummary() {
    return this.items.length + ' ' + this.constructor.Label;
  }
}

CarouselModel.prototype.action = null;
CarouselModel.prototype.items = null;
CarouselModel.prototype.title = '';

CarouselModel.Label = 'Items';
CarouselModel.messageRenderer = 'layer-carousel-view';
CarouselModel.MIMEType = 'application/vnd.layer.carousel+json';

// Register the Message Model Class with the Client
Client.registerMessageTypeModelClass(CarouselModel, 'CarouselModel');

module.exports = CarouselModel;


