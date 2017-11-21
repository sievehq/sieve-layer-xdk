ChoiceModel = layer.Core.Client.getMessageTypeModelClass('ChoiceModel')
model = new ChoiceModel({
   label: "What is the airspeed velocity of an unladen swallow?",
   responseName: 'airselection',
   preselectedChoice: 'clever bastard',
   choices: [
      {text:  "Zero, it can not get off the ground!", id: "zero"},
      {text:  "Are we using Imperial or Metric units?", id: "clever bastard"},
      {text:  "What do you mean? African or European swallow?", id: "just a smart ass"},
    ],
 });
 model.generateMessage($("layer-conversation-view").conversation, message => message.send())


 ChoiceModel = layer.Core.Client.getMessageTypeModelClass('ChoiceModel')
 model = new ChoiceModel({
   label: "What is the airspeed velocity of an unladen swallow?",
   responseName: 'airselection',
   enabledFor: $("layer-conversation-view").conversation.participants.filter(user => user !== client.user).map(user => user.id),
   choices: [
      {text:  "Zero, it can not get off the ground!", id: "zero"},
      {text:  "Are we using Imperial or Metric units?", id: "clever bastard"},
      {text:  "What do you mean? African or European swallow?", id: "just a smart ass"},
    ],
 });
 model.generateMessage($("layer-conversation-view").conversation, message => message.send())


 ChoiceModel = layer.Core.Client.getMessageTypeModelClass('ChoiceModel')
 model = new ChoiceModel({
   label: "What is the airspeed velocity of an unladen swallow?",
   responseName: 'airselection',
   preselectedChoice: 'clever bastard',
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

 ChoiceModel = layer.Core.Client.getMessageTypeModelClass('ChoiceModel')
 model = new ChoiceModel({
   label: "What is the airspeed velocity of an unladen swallow?",
   responseName: 'airselection',
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


 ChoiceModel = layer.Core.Client.getMessageTypeModelClass('ChoiceModel')
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

ChoiceModel = layer.Core.Client.getMessageTypeModelClass('ChoiceModel')
 model = new ChoiceModel({
   label: "Pick a color",
   responseName: 'color',
   allowMultiselect: true,
   customResponseData: {
     hey: "ho"
   },
   choices: [
      {text:  "red", id: "red"},
      {text:  "blue", id: "blue"},
      {text:  "black", id: "black"},
    ],
 });
 model.generateMessage($("layer-conversation-view").conversation, message => message.send())

model = new ChoiceModel({
  allowReselect: true,
  label: "What is the airspeed velocity of an unladen swallow?",
  choices: [
      {text:  "Zero, it can not get off the ground!", id: "zero"},
      {text:  "Are we using Imperial or Metric units?", id: "clever bastard"},
      {text:  "What do you mean? African or European swallow?", id: "just a smart ass"},
    ]
 });
 model.generateMessage($("layer-conversation-view").conversation, message => message.send())