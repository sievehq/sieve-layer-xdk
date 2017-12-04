// Basic Choice
ChoiceModel = Layer.Core.Client.getMessageTypeModelClass('ChoiceModel')
model = new ChoiceModel({
   label: "What is the airspeed velocity of an unladen swallow?",
   choices: [
      {text:  "Zero, it can not get off the ground!", id: "zero"},
      {text:  "Are we using Imperial or Metric units?", id: "clever bastard"},
      {text:  "What do you mean? African or European swallow?", id: "just a smart ass"},
    ],
 });
 model.generateMessage($("layer-conversation-view").conversation, message => message.send())

 // Custom responseName
 ChoiceModel = Layer.Core.Client.getMessageTypeModelClass('ChoiceModel')
 model = new ChoiceModel({
    label: "What is the airspeed velocity of an unladen swallow?",
    responseName: 'airselection',
    choices: [
       {text:  "Zero, it can not get off the ground!", id: "zero"},
       {text:  "Are we using Imperial or Metric units?", id: "clever bastard"},
       {text:  "What do you mean? African or European swallow?", id: "just a smart ass"},
     ],
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send())


// Preselected Choice
ChoiceModel = Layer.Core.Client.getMessageTypeModelClass('ChoiceModel')
model = new ChoiceModel({
   label: "What is the airspeed velocity of an unladen swallow?",
   preselectedChoice: 'clever bastard',
   choices: [
      {text:  "Zero, it can not get off the ground!", id: "zero"},
      {text:  "Are we using Imperial or Metric units?", id: "clever bastard"},
      {text:  "What do you mean? African or European swallow?", id: "just a smart ass"},
    ],
 });
 model.generateMessage($("layer-conversation-view").conversation, message => message.send())


 // Enabled for you but not me
 ChoiceModel = Layer.Core.Client.getMessageTypeModelClass('ChoiceModel')
 model = new ChoiceModel({
   label: "What is the airspeed velocity of an unladen swallow?",
   enabledFor: $("layer-conversation-view").conversation.participants.filter(user => user !== client.user).map(user => user.id),
   choices: [
      {text:  "Zero, it can not get off the ground!", id: "zero"},
      {text:  "Are we using Imperial or Metric units?", id: "clever bastard"},
      {text:  "What do you mean? African or European swallow?", id: "just a smart ass"},
    ],
 });
 model.generateMessage($("layer-conversation-view").conversation, message => message.send())

 // Enabled for me but not you
 ChoiceModel = Layer.Core.Client.getMessageTypeModelClass('ChoiceModel')
 model = new ChoiceModel({
   label: "What is the airspeed velocity of an unladen swallow?",
   enabledFor: [client.user.id],
   choices: [
      {text:  "Zero, it can not get off the ground!", id: "zero"},
      {text:  "Are we using Imperial or Metric units?", id: "clever bastard"},
      {text:  "What do you mean? African or European swallow?", id: "just a smart ass"},
    ],
 });
 model.generateMessage($("layer-conversation-view").conversation, message => message.send())


 // Custom Response Data {"hey": "ho"}
 ChoiceModel = Layer.Core.Client.getMessageTypeModelClass('ChoiceModel')
 model = new ChoiceModel({
   label: "What is the airspeed velocity of an unladen swallow?",
   customResponseData: {
     hey: "ho"
   },
   choices: [
      {text:  "Zero, it can not get off the ground!", id: "zero"},
      {text:  "Are we using Imperial or Metric units?", id: "clever bastard"},
      {text:  "What do you mean? African or European swallow?", id: "just a smart ass"},
    ],
 });
 model.generateMessage($("layer-conversation-view").conversation, message => message.send())

 // Custom Response Data per Choice (v2 feature)
 ChoiceModel = Layer.Core.Client.getMessageTypeModelClass('ChoiceModel')
 model = new ChoiceModel({
   label: "What is the airspeed velocity of an unladen swallow?",
   allowDeselect: true,
   customResponseData: {
     hey: "ho"
   },
   choices: [
      {
        text:  "Zero, it can not get off the ground!",
        id: "zero",
        customResponseData: {
          ho: "hum",
          hi: "there"
        }
      },
      {
        text:  "Are we using Imperial or Metric units?", id: "clever bastard",
        customResponseData: {
          hey: "hum1",
          hi: "there2"
        }
      },
      {
        text:  "What do you mean? African or European swallow?", id: "just a smart ass",
        customResponseData: {
          hey: "hum2",
          hi: "there3"
        }
      },
    ],
 });
 model.generateMessage($("layer-conversation-view").conversation, message => message.send())

// Change text between selected/unselected states (v2 feature)
 ChoiceModel = Layer.Core.Client.getMessageTypeModelClass('ChoiceModel')
 model = new ChoiceModel({
   label: "Pick a color",
   responseName: 'color',
   preselectedChoice: 'black',
   allowReselect: true,
   choices: [
      {text:  "red", id: "red"},
      {
        text: "blue",
        id: "blue",
        states: {
          selected: {
            text: "blueish"
          }
        }
      },
      {
        text:  "black",
        id: "black",
        states: {
          default: {
            text: "darkgray"
          }
        }
      },
    ],
 });
 model.generateMessage($("layer-conversation-view").conversation, message => message.send())

// Allow reselect
ChoiceModel = Layer.Core.Client.getMessageTypeModelClass('ChoiceModel')
 model = new ChoiceModel({
   label: "Pick a color",
   allowReselect: true,
   choices: [
      {text:  "red", id: "red"},
      {text:  "blue", id: "blue"},
      {text:  "black", id: "black"},
    ],
 });
 model.generateMessage($("layer-conversation-view").conversation, message => message.send())

 // Allow deselect
ChoiceModel = Layer.Core.Client.getMessageTypeModelClass('ChoiceModel')
model = new ChoiceModel({
  label: "Pick a color",
  allowDeselect: true,
  choices: [
     {text:  "red", id: "red"},
     {text:  "blue", id: "blue"},
     {text:  "black", id: "black"},
   ],
});
model.generateMessage($("layer-conversation-view").conversation, message => message.send())

// Allow multiselect
ChoiceModel = Layer.Core.Client.getMessageTypeModelClass('ChoiceModel')
model = new ChoiceModel({
  label: "Pick a color",
  allowMultiselect: true,
  choices: [
     {text:  "red", id: "red"},
     {text:  "blue", id: "blue"},
     {text:  "black", id: "black"},
   ],
});
model.generateMessage($("layer-conversation-view").conversation, message => message.send())
