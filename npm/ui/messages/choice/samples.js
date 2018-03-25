'use strict';

ChoiceModel = Layer.Core.Client.getMessageTypeModelClass('ChoiceModel');
TextModel = Layer.Core.Client.getMessageTypeModelClass('TextModel');

new TextModel({ text: "Basic Choice" }).send({ conversation: $("layer-conversation-view").conversation });

model = new ChoiceModel({
  label: "What is the airspeed velocity of an unladen swallow?",
  choices: [{ text: "Zero, it can not get off the ground!", id: "zero" }, { text: "Are we using Imperial or Metric units?", id: "clever bastard" }, { text: "What do you mean? African or European swallow?", id: "just a smart ass" }]
}).send({ conversation: $("layer-conversation-view").conversation });

new TextModel({ text: "Name property for a custom response message" }).send({ conversation: $("layer-conversation-view").conversation });

model = new ChoiceModel({
  label: "What is the airspeed velocity of an unladen swallow?",
  choices: [{ text: "Zero, it can not get off the ground!", id: "zero" }, { text: "Are we using Imperial or Metric units?", id: "clever bastard" }, { text: "What do you mean? African or European swallow?", id: "just a smart ass" }],
  name: "Airspeed Question"
});
model.send({ conversation: $("layer-conversation-view").conversation });

new TextModel({ text: "Custom responseName" }).send({ conversation: $("layer-conversation-view").conversation });

ChoiceModel = Layer.Core.Client.getMessageTypeModelClass('ChoiceModel');
model = new ChoiceModel({
  label: "What is the airspeed velocity of an unladen swallow?",
  responseName: 'airselection',
  choices: [{ text: "Zero, it can not get off the ground!", id: "zero" }, { text: "Are we using Imperial or Metric units?", id: "clever bastard" }, { text: "What do you mean? African or European swallow?", id: "just a smart ass" }]
});
model.send({ conversation: $("layer-conversation-view").conversation });

new TextModel({ text: "Preselected Choice" }).send({ conversation: $("layer-conversation-view").conversation });

ChoiceModel = Layer.Core.Client.getMessageTypeModelClass('ChoiceModel');
model = new ChoiceModel({
  label: "What is the airspeed velocity of an unladen swallow?",
  preselectedChoice: 'clever bastard',
  choices: [{ text: "Zero, it can not get off the ground!", id: "zero" }, { text: "Are we using Imperial or Metric units?", id: "clever bastard" }, { text: "What do you mean? African or European swallow?", id: "just a smart ass" }]
});
model.send({ conversation: $("layer-conversation-view").conversation });

new TextModel({ text: "Enabled for you but not me" }).send({ conversation: $("layer-conversation-view").conversation });

ChoiceModel = Layer.Core.Client.getMessageTypeModelClass('ChoiceModel');
model = new ChoiceModel({
  label: "What is the airspeed velocity of an unladen swallow?",
  enabledFor: $("layer-conversation-view").conversation.participants.filter(function (user) {
    return user !== client.user;
  }).map(function (user) {
    return user.id;
  }),
  choices: [{ text: "Zero, it can not get off the ground!", id: "zero" }, { text: "Are we using Imperial or Metric units?", id: "clever bastard" }, { text: "What do you mean? African or European swallow?", id: "just a smart ass" }]
});
model.send({ conversation: $("layer-conversation-view").conversation });

new TextModel({ text: "Enabled for me but not you" }).send({ conversation: $("layer-conversation-view").conversation });

ChoiceModel = Layer.Core.Client.getMessageTypeModelClass('ChoiceModel');
model = new ChoiceModel({
  label: "What is the airspeed velocity of an unladen swallow?",
  enabledFor: [client.user.id],
  choices: [{ text: "Zero, it can not get off the ground!", id: "zero" }, { text: "Are we using Imperial or Metric units?", id: "clever bastard" }, { text: "What do you mean? African or European swallow?", id: "just a smart ass" }]
});
model.send({ conversation: $("layer-conversation-view").conversation });

new TextModel({ text: "Custom Response Data {\"hey\": \"ho\"}" }).send({ conversation: $("layer-conversation-view").conversation });

ChoiceModel = Layer.Core.Client.getMessageTypeModelClass('ChoiceModel');
model = new ChoiceModel({
  label: "What is the airspeed velocity of an unladen swallow?",
  customResponseData: {
    hey: "ho"
  },
  choices: [{ text: "Zero, it can not get off the ground!", id: "zero" }, { text: "Are we using Imperial or Metric units?", id: "clever bastard" }, { text: "What do you mean? African or European swallow?", id: "just a smart ass" }]
});
model.send({ conversation: $("layer-conversation-view").conversation });

new TextModel({ text: "Custom Response Data per Choice (v2 feature)" }).send({ conversation: $("layer-conversation-view").conversation });

ChoiceModel = Layer.Core.Client.getMessageTypeModelClass('ChoiceModel');
model = new ChoiceModel({
  label: "What is the airspeed velocity of an unladen swallow?",
  allowDeselect: true,
  customResponseData: {
    hey: "ho"
  },
  choices: [{
    text: "Zero, it can not get off the ground!",
    id: "zero",
    customResponseData: {
      ho: "hum",
      hi: "there"
    }
  }, {
    text: "Are we using Imperial or Metric units?", id: "clever bastard",
    customResponseData: {
      hey: "hum1",
      hi: "there2"
    }
  }, {
    text: "What do you mean? African or European swallow?", id: "just a smart ass",
    customResponseData: {
      hey: "hum2",
      hi: "there3"
    }
  }]
});
model.send({ conversation: $("layer-conversation-view").conversation });

new TextModel({ text: "Change text between selected/unselected states (v2 feature)" }).send({ conversation: $("layer-conversation-view").conversation });

ChoiceModel = Layer.Core.Client.getMessageTypeModelClass('ChoiceModel');
model = new ChoiceModel({
  label: "Pick a color",
  responseName: 'color',
  preselectedChoice: 'black',
  allowReselect: true,
  choices: [{ text: "red", id: "red" }, {
    text: "blue",
    id: "blue",
    states: {
      selected: {
        text: "blueish"
      }
    }
  }, {
    text: "black",
    id: "black",
    states: {
      default: {
        text: "darkgray"
      }
    }
  }]
});
model.send({ conversation: $("layer-conversation-view").conversation });

new TextModel({ text: "Allow reselect" }).send({ conversation: $("layer-conversation-view").conversation });

ChoiceModel = Layer.Core.Client.getMessageTypeModelClass('ChoiceModel');
model = new ChoiceModel({
  label: "Pick a color",
  allowReselect: true,
  choices: [{ text: "red", id: "red" }, { text: "blue", id: "blue" }, { text: "black", id: "black" }]
});
model.send({ conversation: $("layer-conversation-view").conversation });

new TextModel({ text: "Allow deselect" }).send({ conversation: $("layer-conversation-view").conversation });

ChoiceModel = Layer.Core.Client.getMessageTypeModelClass('ChoiceModel');
model = new ChoiceModel({
  label: "Pick a color",
  allowDeselect: true,
  choices: [{ text: "red", id: "red" }, { text: "blue", id: "blue" }, { text: "black", id: "black" }]
});
model.send({ conversation: $("layer-conversation-view").conversation });

new TextModel({ text: "Allow multiselect" }).send({ conversation: $("layer-conversation-view").conversation });

ChoiceModel = Layer.Core.Client.getMessageTypeModelClass('ChoiceModel');
model = new ChoiceModel({
  label: "Pick a color",
  allowMultiselect: true,
  choices: [{ text: "red", id: "red" }, { text: "blue", id: "blue" }, { text: "black", id: "black" }]
});
model.send({ conversation: $("layer-conversation-view").conversation });