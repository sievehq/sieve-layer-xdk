TextModel = layer.Core.Client.getMessageTypeModelClass('TextModel')
ButtonModel = layer.Core.Client.getMessageTypeModelClass('ButtonsModel')

model = new ButtonModel({
 buttons: [
   {"type": "action", "text": "Kill Arthur", "event": "kill-arthur"},
   {"type": "action", "text": "Give Holy Grail", "event": "grant-grail"}
 ]
});
model.generateMessage($("layer-conversation-view").conversation, message => message.send())

model = new ButtonModel({
 buttons: [
   {"type": "action", "text": "Kill Arthur, all his friends, his horse and his dog", "event": "kill-arthur"},
   {"type": "action", "text": "Give Holy Grail", "event": "grant-grail"}
 ]
});
model.generateMessage($("layer-conversation-view").conversation, message => message.send())

  ButtonModel = layer.Core.Client.getMessageTypeModelClass('ButtonsModel')
model = new ButtonModel({
 buttons: [
   {"type": "choice", "choices": [{"text": "like", "id": "like", "tooltip": "like"}, {"text": "dislike", "id": "dislike", "tooltip": "dislike"}], "data": {"responseName": "satisfaction", preselectedChoice: 'dislike', allowReselect: true}},
   {"type": "action", "text": "do nothing"},
   {"type": "choice", "choices": [{"text": "helpful", "id": "helpful", "tooltip": "helpful"}, {"text": "unhelpful", "id": "unhelpful", "tooltip": "unhelpful"}], "data": {"responseName": "helpfulness", allowReslect: true}},
 ]
});
model.generateMessage($("layer-conversation-view").conversation, message => message.send())

  ButtonModel = layer.Core.Client.getMessageTypeModelClass('ButtonsModel')
model = new ButtonModel({
 buttons: [
   {"type": "choice", "choices": [{"text": "like", "id": "like", "tooltip": "like"}, {"text": "dislike", "id": "dislike", "tooltip": "dislike"}], "data": {"responseName": "satisfaction", preselectedChoice: 'dislike', allowReselect: true, enabledFor: $("layer-conversation-view").conversation.participants.filter(user => user !== client.user).map(user => user.id)}},
   {"type": "action", "text": "do nothing"},
   {"type": "choice", "choices": [{"text": "helpful", "id": "helpful", "tooltip": "helpful"}, {"text": "unhelpful", "id": "unhelpful", "tooltip": "unhelpful"}], "data": {"responseName": "helpfulness", allowReslect: true}},
 ]
});
model.generateMessage($("layer-conversation-view").conversation, message => message.send())




ProductModel = client.getMessageTypeModelClassForMimeType('application/vnd.layer.product+json')
ImageModel = client.getMessageTypeModelClassForMimeType('application/vnd.layer.image+json')
ButtonModel = layer.Core.Client.getMessageTypeModelClass('ButtonsModel')
model = new ButtonModel({
 buttons: [
   {
     "type": "choice",
     "choices": [{"text": "like", "id": "like", "tooltip": "like", "icon": "custom-like-button"}, {"text": "dislike", "id": "dislike", "tooltip": "dislike", "icon": "custom-dislike-button"}],
     "data": {"responseName": "satisfaction", preselectedChoice: 'dislike', allowReselect: true}
   },
   {
     "type": "choice",
     "choices": [{"text": "\uD83D\uDC4D", "id": "like", "tooltip": "like", "icon": "custom-like-button"}, {"text": "\uD83D\uDC4E", "id": "dislike", "tooltip": "dislike", "icon": "custom-dislike-button"}],
     "data": {"responseName": "thumborientation", allowReselect: true, allowDeselect: false}
   },
   {
     "type": "choice",
     "choices": [{"text": "helpful", "id": "helpful", "tooltip": "helpful"}, {"text": "unhelpful", "id": "unhelpful", "tooltip": "unhelpful"}],
     "data": {"responseName": "helpfulness", allowReselect: false}
   },
 ],
 contentModel: new ProductModel({
   currency: 'USD',
   price: 175,
   quantity: 3,
   brand: "randomcrap.com",
   name: "A pretty picture",
   imageUrls: [ "https://farm5.staticflickr.com/4272/34912460025_be2700d3e7_k.jpg" ],
 })
});
model.generateMessage($("layer-conversation-view").conversation, message => message.send());



ProductModel = client.getMessageTypeModelClassForMimeType('application/vnd.layer.product+json')
ImageModel = client.getMessageTypeModelClassForMimeType('application/vnd.layer.image+json')
ButtonModel = layer.Core.Client.getMessageTypeModelClass('ButtonsModel')
model = new ButtonModel({
 buttons: [
   {
     "type": "choice",
     "choices": [{"text": "like", "id": "like", "tooltip": "like", "icon": "custom-like-button"}, {"text": "dislike", "id": "dislike", "tooltip": "dislike", "icon": "custom-dislike-button"}],
     "data": {"responseName": "satisfaction", preselectedChoice: 'dislike', allowReselect: true}
   },
   {
     "type": "choice",
     "choices": [{"text": "\uD83D\uDC4D", "id": "like", "tooltip": "like", "icon": "custom-like-button"}, {"text": "\uD83D\uDC4E", "id": "dislike", "tooltip": "dislike", "icon": "custom-dislike-button"}],
     "data": {"responseName": "thumborientation", allowReselect: true, allowDeselect: false, customResponseData: {howdy: "ho der"}}
   },
   {
     "type": "choice",
     "choices": [{"text": "helpful", "id": "helpful", "tooltip": "helpful"}, {"text": "unhelpful", "id": "unhelpful", "tooltip": "unhelpful"}],
     "data": {"responseName": "helpfulness", allowReselect: false}
   },
 ],
 contentModel: new ProductModel({
   currency: 'USD',
   price: 175,
   quantity: 3,
   brand: "randomcrap.com",
   name: "A pretty picture",
   imageUrls: [ "https://farm5.staticflickr.com/4272/34912460025_be2700d3e7_k.jpg" ],
 })
});
model.generateMessage($("layer-conversation-view").conversation, message => message.send());

ProductModel = client.getMessageTypeModelClassForMimeType('application/vnd.layer.product+json')
ImageModel = client.getMessageTypeModelClassForMimeType('application/vnd.layer.image+json')
ButtonModel = layer.Core.Client.getMessageTypeModelClass('ButtonsModel')
model = new ButtonModel({
 buttons: [
   {
     "type": "choice",
     "choices": [
       {
         "text": "like",
         "id": "like",
         "tooltip": "like",
         "style": "style name supported by UI Framework or provided by customer",
         "states": {
           "default": {
             "text": "love",
             "tooltip": "love",
             "style": "override the base style"
           },
           "selected": {
             "text": "please deselect me"
           },
           "disabled": {
             "text": "Feature not enabled",
             "style": "warning_button"
           }
         }
       },
       {
         "text": "dislike",
         "id": "dislike",
         "tooltip": "dislike"
       }],
     "data": {"responseName": "satisfaction", allowReselect: true}
   },
   {
     "type": "choice",
     "choices": [{"text": "\uD83D\uDC4D", "id": "up", "tooltip": "like", "icon": "custom-like-button"}, {"text": "\uD83D\uDC4E", "id": "down", "tooltip": "dislike", "icon": "custom-dislike-button"}],
     "data": {"responseName": "thumborientation", allowReselect: true, allowDeselect: false, customResponseData: {howdy: "ho der"}}
   },
   {
     "type": "choice",
     "choices": [{"text": "helpful", "id": "helpful", "tooltip": "helpful"}, {"text": "unhelpful", "id": "unhelpful", "tooltip": "unhelpful"}],
     "data": {"responseName": "helpfulness", allowReselect: false}
   },
 ],
 contentModel: new ProductModel({
   currency: 'USD',
   price: 175,
   quantity: 3,
   brand: "randomcrap.com",
   name: "A pretty picture",
   imageUrls: [ "https://farm5.staticflickr.com/4272/34912460025_be2700d3e7_k.jpg" ],
 })
});
model.generateMessage($("layer-conversation-view").conversation, message => message.send());



model = new ButtonModel({
 buttons: [
   {"type": "action", "text": "Kill Arthur", "event": "kill-arthur"},
   {"type": "action", "text": "Give Holy Grail", "event": "grant-grail"}
 ],
 contentModel: new TextModel({
   text: 'And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.',
   title: 'The Holy Hand Grenade',
   author: 'King Arthur'
 })
});
model.generateMessage($("layer-conversation-view").conversation, message => message.send())



model = new ButtonModel({
buttons: [
 {"type": "url", "text": "Open Layer", "url": "https://layer.com"},
 {"type": "action", "text": "Give Holy Grail", "event": "grant-grail"}
]
});
model.generateMessage($("layer-conversation-view").conversation, message => message.send());
