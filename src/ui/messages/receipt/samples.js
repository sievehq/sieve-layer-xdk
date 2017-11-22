ReceiptModel = client.getMessageTypeModelClassForMimeType('application/vnd.layer.receipt+json')
LocationModel = client.getMessageTypeModelClassForMimeType('application/vnd.layer.location+json')
ListModel = client.getMessageTypeModelClassForMimeType('application/vnd.layer.list+json')
ProductModel = client.getMessageTypeModelClassForMimeType('application/vnd.layer.product+json')
ImageModel = client.getMessageTypeModelClassForMimeType('application/vnd.layer.image+json')
ChoiceModel = Layer.Core.Client.getMessageTypeModelClass('ChoiceModel')

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
  shippingAddress: new LocationModel({
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
  shippingAddress: new LocationModel({
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
