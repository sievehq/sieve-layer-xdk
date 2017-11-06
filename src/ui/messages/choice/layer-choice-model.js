/**
  ChoiceModel = layer.Core.Client.getMessageTypeModelClass('ChoiceModel')
  model = new ChoiceModel({
     question: "What is the airspeed velocity of an unladen swallow?",
     responseName: 'airselection',
     selectedAnswer: 'clever bastard',
     choices: [
        {text:  "Zero, it can not get off the ground!", id: "zero"},
        {text:  "Are we using Imperial or Metric units?", id: "clever bastard"},
        {text:  "What do you mean? African or European swallow?", id: "just a smart ass"},
      ],
   });
   model.generateMessage($("layer-conversation-view").conversation, message => message.send())


   ChoiceModel = layer.Core.Client.getMessageTypeModelClass('ChoiceModel')
   model = new ChoiceModel({
     question: "What is the airspeed velocity of an unladen swallow?",
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
     question: "What is the airspeed velocity of an unladen swallow?",
     responseName: 'airselection',
     selectedAnswer: 'clever bastard',
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
     question: "What is the airspeed velocity of an unladen swallow?",
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
     question: "Pick a color",
     responseName: 'color',
     selectedAnswer: 'black',
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
     question: "Pick a color",
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
    question: "What is the airspeed velocity of an unladen swallow?",
    choices: [
        {text:  "Zero, it can not get off the ground!", id: "zero"},
        {text:  "Are we using Imperial or Metric units?", id: "clever bastard"},
        {text:  "What do you mean? African or European swallow?", id: "just a smart ass"},
      ]
   });
   model.generateMessage($("layer-conversation-view").conversation, message => message.send())
 *
 *
 * @class layer.UI.cards.ChoiceModel
 * @extends layer.model
 */
import { Client, MessagePart, Root, MessageTypeModel } from '../../../core';
import ResponseModel from '../response/layer-response-model';
import TextModel from '../text/layer-text-model';
import { ErrorDictionary } from '../../../core/layer-error';

class ChoiceModel extends MessageTypeModel {
  initializeProperties() {
    if (!this.enabledFor) this.enabledFor = [];
    if (this.allowMultiselect) this.allowDeselect = true;
    if (this.allowDeselect) this.allowReselect = true;
  }
  _generateParts(callback) {
    const body = this._initBodyWithMetadata([
      'question', 'selectedAnswer', 'type', 'responseName',
      'allowReselect', 'allowDeselect', 'allowMultiselect',
      'title', 'customResponseData',
    ]);
    body.choices = this.choices.map((choice) => {
      const obj = {};
      obj.id = choice.id;
      obj.text = choice.text;
      obj.tooltip = choice.tooltip;
      obj.states = choice.states;
      if (choice.customResponseData) obj.custom_response_data = choice.customResponseData;
      return obj;
    });
    if (this.enabledFor && this.enabledFor.length) body.enabled_for = this.enabledFor;
    this.part = new MessagePart({
      mimeType: this.constructor.MIMEType,
      body: JSON.stringify(body),
    });
    this._buildActionModels();
    // if (this.selectedAnswer) this.selectAnswer({ id: this.selectedAnswer });
    callback([this.part]);
  }

  _parseMessage(payload) {
    if (this.selectedAnswer) delete payload.selected_answer;
    super._parseMessage(payload);
    this.choices.forEach((choice) => {
      if (choice.custom_response_data) {
        choice.customResponseData = choice.custom_response_data;
        delete choice.custom_response_data;
      }
    });
    this._buildActionModels();
    if (this.responses) {
      this._processNewResponses();
    }
    if (this.selectedAnswer) this.__updateSelectedAnswer(this.selectedAnswer);
  }

  _buildActionModels() {
    this.actionModels = this.choices.map((choice, index) => ({
      type: 'action',
      text: this.getText(index),
      event: 'layer-choice-select',
      data: { id: choice.id },
    }));
  }

  isSelectionEnabled() {

    // Disable selection if there is a selection and reselection is not permitted
    if (!this.allowReselect && this.selectedAnswer) return false;

    // Disable selection if enabledFor is in use, but this user is not in the list
    if (this.enabledFor.length > 0 && this.enabledFor.indexOf(this.getClient().user.id) === -1) return false;

    // Disable selection if this user is the sender, and other participants have made selections.
    // Rationale: This user was requesting feedback, this user's selections do not get priority
    const data = this.responses ? this.responses.participantData : {};
    const responseIdentityIds = Object.keys(data).filter(participantId => data[participantId][this.responseName]);
    if (responseIdentityIds.length > 1 && this.message.sender === this.getClient().user) return false;

    return true;
  }

  isSelectionEnabledFor(index) {

    // This handles alloReselect among other tests
    if (!this.isSelectionEnabled()) return false;

    if (this.allowDeselect || this.allowMultiselect) return true;

    // if allowDeselect is false, then you may select anything except the selected index
    return !this.isSelectedIndex(index);
  }

  selectAnswer(answerData) {
    if (!this.message) throw new Error(ErrorDictionary.messageMissing);
    if (this.enabledFor.length === 0 || this.enabledFor.indexOf(this.getClient().user.id) !== -1) {
      if (this.allowMultiselect) {
        this._selectMultipleAnswers(answerData);
      } else {
        this._selectSingleAnswer(answerData);
      }
    }
  }

  _selectMultipleAnswers(answerData) {
    const { id, text, customResponseData } = this.getChoiceById(answerData.id);
    const selectedText = text;
    const selectedAnswers = this.selectedAnswer ? this.selectedAnswer.split(/\s*,\s*/) : [];
    const answerDataIndex = selectedAnswers.indexOf(answerData.id);
    let action;

    // Deselect it
    if (answerDataIndex !== -1) {
      selectedAnswers.splice(answerDataIndex, 1);
      action = 'deselected';
    } else {
      selectedAnswers.push(id);
      action = 'selected';
    }

    const participantData = {
      [this.responseName]: selectedAnswers.join(','),
    };

    if (this.customResponseData) {
      Object.keys(this.customResponseData).forEach(key => (participantData[key] = this.customResponseData[key]));
    }

    if (action === 'selected' && customResponseData) {
      Object.keys(customResponseData).forEach(key => (participantData[key] = customResponseData[key]));
    }

    const responseModel = new ResponseModel({
      participantData,
      responseTo: this.message.id,
      responseToNodeId: this.parentId || this.nodeId,
      displayModel: new TextModel({
        text: this._getSelectionMessageText(action, selectedText),
      }),
    });
    if (!this.message.isNew()) {
      responseModel.generateMessage(this.message.getConversation(), message => this._sendResponse(message));
    }
    this.selectedAnswer = selectedAnswers.join(',');
    this.trigger('change');
    if (this.pauseUpdateTimeout) clearTimeout(this.pauseUpdateTimeout);

    // We generate local changes, we generate more local changes then the server sends us the first changes
    // which we need to ignore. Pause 6 seconds and wait for all changes to come in before rendering changes
    // from the server after a user change.
    this.pauseUpdateTimeout = setTimeout(() => {
      this.pauseUpdateTimeout = 0;
      if (this.responses && this.message && !this.message.isNew()) this._processNewResponses();
    }, 6000);
  }

  /**
   * Get a displayable name to label responses to this Choice Model with.
   *
   * Example: "User XXX did YYY for ZZZ" where the name of the Choice Model is ZZZ.
   * @method
   * @private
   * @returns {String}
   */
  _getNameOfChoice() {
    const client = this.getClient();
    if (this.parentId) {
      const parentNode = this.getParentPart();
      if (parentNode) {
        const model = client.createMessageTypeModel(this.message, parentNode);
        if (model && model.getChoiceModelResponseTopic && model.getChoiceModelResponseTopic()) {
          return model.getChoiceModelResponseTopic();
        }
      }
    }

    if (this.question) {
      return this.question;
    }
  }

  _selectSingleAnswer(answerData) {
    const { customResponseData } = this.getChoiceById(answerData.id);
    let selectedIndex = this.getChoiceIndexById(answerData.id);
    let selectedId = selectedIndex === -1 ? '' : this.choices[selectedIndex].id;
    if (!this.selectedAnswer || this.allowReselect && selectedIndex !== -1) {
      let action = 'selected';
      const selectedText = this.getText(selectedIndex);

      if (this.isSelectionEnabledFor(selectedIndex) && this.isSelectedIndex(selectedIndex)) {
        selectedIndex = -1;
        selectedId = '';
        action = 'deselected';
      }

      const participantData = {
        [this.responseName]: selectedId,
      };
      if (this.customResponseData) {
        Object.keys(this.customResponseData).forEach(key => (participantData[key] = this.customResponseData[key]));
      }

      if (action === 'selected' && customResponseData) {
        Object.keys(customResponseData).forEach(key => (participantData[key] = customResponseData[key]));
      }

      const responseModel = new ResponseModel({
        participantData,
        responseTo: this.message.id,
        responseToNodeId: this.parentId || this.nodeId,
        displayModel: new TextModel({
          text: this._getSelectionMessageText(action, selectedText),
        }),
      });
      if (!this.message.isNew()) {
        responseModel.generateMessage(this.message.getConversation(), message => this._sendResponse(message));
      }
      this.selectedAnswer = selectedId;
      this.trigger('change');
      if (this.pauseUpdateTimeout) clearTimeout(this.pauseUpdateTimeout);

      // We generate local changes, we generate more local changes then the server sends us the first changes
      // which we need to ignore. Pause 6 seconds and wait for all changes to come in before rendering changes
      // from the server after a user change.
      this.pauseUpdateTimeout = setTimeout(() => {
        this.pauseUpdateTimeout = 0;
        if (this._hasPendingResponse) this._processNewResponses();
      }, 6000);
    }
  }

  _getSelectionMessageText(action, selectedText) {
    const nameOfChoice = this._getNameOfChoice();
    return `${this.getClient().user.displayName} ${action} "${selectedText}"` + (nameOfChoice ? ` for "${nameOfChoice}"` : '');
  }
  // primarily here to simplify unit testing
  _sendResponse(message) {
    message.send();
  }

  _processNewResponses() {
    if (!this.pauseUpdateTimeout) {
      this._hasPendingResponse = false;
      const senderId = this.message.sender.userId;
      const data = this.responses.participantData;
      let responseIdentityIds = Object.keys(data).filter(participantId => data[participantId][this.responseName]);
      if (responseIdentityIds.length > 1) responseIdentityIds = responseIdentityIds.filter(id => senderId !== id);

      if (responseIdentityIds.length) {
        this.selectedAnswer = data[responseIdentityIds[0]][this.responseName];
      }
    } else {
      this._hasPendingResponse = true;
    }
  }

  __updateSelectedAnswer(newValue) {
    this._triggerAsync('change');
  }

  getOneLineSummary() {
    return this.question || this.title;
  }


  __getCurrentMessageRenderer() {
    switch (this.type) {
      case 'standard':
        return 'layer-choice-view';
      // case 'TiledChoices':
      // return 'layer-choice-tiles-view';
      case 'Label':
        return 'layer-choice-label-view';
    }
  }

  __updateAllowDeselect(newValue) {
    if (newValue) {
      this.allowReselect = true;
    }
  }

  __updateAllowMultiselect(newValue) {
    if (newValue) {
      this.allowDeselect = true;
    }
  }

  getChoiceById(id) {
    for (let i = 0; i < this.choices.length; i++) {
      if (this.choices[i].id === id) return this.choices[i];
    }
    return null;
  }

  getChoiceIndexById(id) {
    const choice = this.getChoiceById(id);
    return this.choices.indexOf(choice);
  }

  isSelectedIndex(choiceIndex) {
    if (choiceIndex >= this.choices.length) return false;
    const indexId = this.choices[choiceIndex].id;
    if (this.allowMultiselect) {
      const selectedAnswers = this.selectedAnswer ? this.selectedAnswer.split(/\s*,\s*/) : [];
      return selectedAnswers.indexOf(indexId) !== -1;
    } else {
      return indexId === this.selectedAnswer;
    }
  }

  getText(choiceIndex) {
    const choice = this.choices[choiceIndex];
    let text = choice.text;
    const state = this.getState(choiceIndex);
    if (choice.states && choice.states[state] && choice.states[state].text) {
      text = choice.states[state].text;
    }
    return text;
  }
  getTooltip(choiceIndex) {
    const choice = this.choices[choiceIndex];
    let tooltip = choice.tooltip;
    const state = this.getState(choiceIndex);
    if (choice.states && choice.states[state] && choice.states[state].tooltip) {
      tooltip = choice.states[state].tooltip;
    }
    return tooltip;
  }
  getState(choiceIndex) {
    if (this.isSelectedIndex(choiceIndex)) {
      return 'selected';
    } else {
      return 'default';
    }
  }

  destroy() {
    clearTimeout(this.pauseUpdateTimeout);
    super.destroy();
  }
}

ChoiceModel.prototype.enabledFor = null;
ChoiceModel.prototype.pauseUpdateTimeout = 0;
ChoiceModel.prototype.allowReselect = false;
ChoiceModel.prototype.allowDeselect = false; // if true, allowReselect is forced to true
ChoiceModel.prototype.allowMultiselect = false; // if true, allowReselect is forced to true and allowDeselect is forced to true
ChoiceModel.prototype.type = 'standard';
ChoiceModel.prototype.title = 'Choose One';
ChoiceModel.prototype.question = '';
ChoiceModel.prototype.choices = null;
ChoiceModel.prototype.responseName = 'selection';
ChoiceModel.prototype.responses = null;
ChoiceModel.prototype.currentMessageRenderer = null;
ChoiceModel.prototype.selectedAnswer = ''; // allowing this in the Model Constructor introduces various bugs and is not supported at this time
ChoiceModel.prototype.customResponseData = null;

ChoiceModel.Label = 'Choose One';
ChoiceModel.defaultAction = 'layer-choice-select';
ChoiceModel.messageRenderer = 'layer-choice-view';
ChoiceModel.MIMEType = 'application/vnd.layer.choice+json';

Root.initClass.apply(ChoiceModel, [ChoiceModel, 'ChoiceModel']);

// Register the Message Model Class with the Client
Client.registerMessageTypeModelClass(ChoiceModel, 'ChoiceModel');

module.exports = ChoiceModel;

