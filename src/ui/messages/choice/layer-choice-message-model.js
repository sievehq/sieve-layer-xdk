/**
 * The Choice Message is used to ask a participant a question, and receive their response.
 *
 * Responses are handled via the Layer.UI.messages.ResponseMessageModel, which will add
 * the user's selection to the Layer.UI.messages.ChoiceMessageModel.responses property for each
 * participant, and will in turn, update the Layer.UI.messages.ChoiceMessageModel.selectedAnswer property
 * for each participant.
 *
 * Each choice needs to be identified by an `id`; the `id` is what is written to `selectedAnswer`.
 * The text that was selected can be localized while the `id` remains consistent.
 *
 * A basic Choice Message can be created with:
 *
 * ```
 * ChoiceModel = Layer.Core.Client.getMessageTypeModelClass('ChoiceModel')
 * model = new ChoiceModel({
 *    label: "What is the airspeed velocity of an unladen swallow?",
 *    choices: [
 *      {text:  "Zero, it can not get off the ground!", id: "zero"},
 *      {text:  "Are we using Imperial or Metric units?", id: "clever bastard"},
 *      {text:  "What do you mean? African or European swallow?", id: "just a smart ass"},
 *   ],
 * });
 * model.send({ conversation });
 * ```
 *
 * See property defintions below for more details on configuration of this Message.
 *
 * For more information on what goes into each Choice in the `choices` array,
 * see Layer.UI.messages.ChoiceMessageItemModel.
 *
 * ## Customization
 *
 * The model triggers an event before sending a Layer.UI.messages.ResponseMessageModel which allows an app to:
 *
 * * Prevent the Response Message from being sent
 * * Customize the text of the Response Message
 * * Subscribe to events from either the Layer.Core.Client or via the DOM
 *
 * Typically one would subscribe to these events at the UI level, but they are also exposed at the model _and_ Layer.Core.Client level as well:
 *
 * ```
 * client.on('message-type-model:customization', function(evt) {
 *   if (evt.type === 'layer-choice-model-generate-response-message') {
 *     evt.returnValue(`${evt.name}: ${Client.user.displayName} has ${evt.action} ${evt.choice.text}`);
 *   }
 * });
 * ```
 *
 * ### Importing
 *
 * Not included with the standard build. Import using either:
 *
 * ```
 * import '@layerhq/web-xdk/ui/messages/choice/layer-choice-message-view';
 * import '@layerhq/web-xdk/ui/messages/choice/layer-choice-message-model';
 * ```
 *
 * @class Layer.UI.messages.ChoiceMessageModel
 * @extends Layer.Core.MessageTypeModel
 */
import { client as Client } from '../../../settings';
import Core, { Identity, MessagePart, Root, MessageTypeModel } from '../../../core';
import ResponseModel from '../response/layer-response-message-model';
import StatusModel from '../status/layer-status-message-model';
import ChoiceItem from './layer-choice-message-model-item';
import { ErrorDictionary } from '../../../core/layer-error';
import { CRDT_TYPES } from '../../../constants';

class ChoiceModel extends MessageTypeModel {
  constructor(options = {}) {
    if (!options.enabledFor) options.enabledFor = [];
    if (options.preselectedChoice) options.selectedAnswer = options.preselectedChoice;
    super(options);
    this._normalizeChoices();
    this._sanitizeProperties();
    this.responses.registerState('custom_response_data', CRDT_TYPES.LAST_WRITER_WINS_NULLABLE);
  }

  _normalizeChoices() {
    this.choices = (this.choices || []).map((choice) => {
      if (choice instanceof ChoiceItem) {
        return choice;
      } else {
        return new ChoiceItem(choice);
      }
    });
  }

  _sanitizeProperties() {
    if (this.allowMultiselect) this.allowDeselect = true;
    if (this.allowDeselect) this.allowReselect = true;
  }

  /**
   * Generate the Message Parts representing this model so that the Choice Message can be sent.
   *
   * @method generateParts
   * @protected
   * @param {Function} callback
   * @param {Layer.Core.MessagePart[]} callback.parts
   */
  generateParts(callback) {
    const body = this.initBodyWithMetadata([
      'label', 'type', 'responseName', 'name',
      'allowReselect', 'allowDeselect', 'allowMultiselect',
      'title', 'customResponseData', 'preselectedChoice',
    ]);

    // Convert each choices properties to snake-case
    body.choices = this.choices.map(choice => choice.toSnakeCase());

    // Add enabledFor to the body if its specfied
    if (this.enabledFor && this.enabledFor.length) body.enabled_for = this.enabledFor;

    // Generate the Message Part
    this.part = new MessagePart({
      mimeType: this.constructor.MIMEType,
      body: JSON.stringify(body),
    });
    this._buildActionButtonProps();
    this._registerResponseName();
    callback([this.part]);
  }

  _registerResponseName() {
    let type;
    if (this.allowMultiselect) {
      type = CRDT_TYPES.SET;
    } else if (this.allowDeselect) {
      type = CRDT_TYPES.LAST_WRITER_WINS_NULLABLE;
    } else if (this.allowReselect) {
      type = CRDT_TYPES.LAST_WRITER_WINS;
    } else {
      type = CRDT_TYPES.FIRST_WRITER_WINS;
    }
    this.responses.registerState(this.responseName, type);
  }

  // See parent class
  parseModelPart({ payload, isEdit }) {
    // Explicitly protect us from this illegal usage.
    delete payload.selectedAnswer;

    // Copy in the properties... minus selected_answer
    super.parseModelPart({ payload, isEdit });

    this._normalizeChoices();
    this._registerResponseName();

    // Generate the data for an Action Button from our Choices
    this._buildActionButtonProps();
  }

  /**
   * Initialize or process changes to this Message Type Model's sub-message-parts.
   *
   * `parseModelChildParts` is called for intialization, and is also recalled
   * whenever the sub-parts are added or modified.
   *
   * @method parseModelChildParts
   * @protected
   * @param {Object} options
   * @param {Object[]} options.changes
   * @param {String} options.changes.type  (one of `added`, `removed`, `changed`)
   * @param {Layer.Core.MessagePart} options.changes.part   The Part that has changed.
   */
  parseModelChildParts({ changes, init }) {
    super.parseModelChildParts({ changes, init });
    if (this.__selectedAnswer === null && this.preselectedChoice) this.selectedAnswer = this.preselectedChoice;
  }

  /**
   * Generate the action button parameters needed to represent these Choices
   *
   * Sets Layer.UI.messages.ChoiceMessageModel.actionButtons with the parameters.
   *
   * @method _buildActionButtonProps
   * @private
   */
  _buildActionButtonProps() {
    this.actionModels = this.choices.map((choice, index) => ({
      type: 'action',
      text: this.getText(index),
      event: 'layer-choice-select',
      data: { id: choice.id },
    }));
  }

  /**
   * Returns whether Selection is enabled for this model.
   *
   * * Its disabled if `allowReselect` is `false` and a selection has already been made
   * * Its disabled if `enabledFor` is part of the model, and doesn't list the current user
   * * Its disabled if this user is the sender and other users have made selections;
   *
   * @method isSelectionEnabled
   * @returns {Boolean}
   */
  isSelectionEnabled() {

    // Disable selection if there is a selection and reselection is not permitted
    if (!this.allowReselect && this.selectedAnswer) return false;

    // Disable selection if enabledFor is in use, but this user is not in the list
    if (this.enabledFor.length > 0 && this.enabledFor.indexOf(Client.user.id) === -1) return false;

    // Disable selection if this user is the sender, and other participants have made selections.
    // Rationale: This user was requesting feedback, this user's selections do not get priority
    const data = this.responses.getStates(this.responseName, this.enabledFor && this.enabledFor.length ? this.enabledFor : null);

    // If someone else has answered, disable this user from answering
    if (data.filter(item => Identity.prefixUUID + item.identityId !== Client.user.id).length) return false;

    return true;
  }

  /**
   * Returns whether selection is enabled for the specified Choice (specified by Index in the choices array).
   *
   * * Its disabled if Layer.UI.messages.ChoiceMessageModel.isSelectionEnabled returns false
   * * Its disabled if Layer.UI.messages.ChoiceMessageModel.allowDeselect is `false` and this index is already selected.
   *
   * @method isSelectionEnabledFor
   * @param {Number} index
   * @returns {Boolean}
   */
  isSelectionEnabledFor(index) {

    // This handles alloReselect among other tests
    if (!this.isSelectionEnabled()) return false;

    if (this.allowDeselect || this.allowMultiselect) return true;

    // if allowDeselect is false, then you may select anything except the selected index
    return !this.isSelectedIndex(index);
  }

  /**
   * Select an answer to the question; select one of the provided Choices.
   *
   * ```
   * choiceModel.selectAnswer({id: "red"});
   * ```
   *
   * Selecting a Choice will:
   *
   * 1. Update the Model and UI state
   * 2. Send a Response Message to update other participants and to persist the state changes
   *
   * The ID must match the ID of one of the choices.  No other properties are used.
   *
   * @method selectAnswer
   * @param {Object} answerData
   * @param {String} answerData.id   ID of the choice that is to be selected
   */
  selectAnswer(answerData) {
    // If selection is not enabled, just quit.
    if (!this.isSelectionEnabled()) return;

    if (!this.message) throw new Error(ErrorDictionary.messageMissing);
    if (this.allowMultiselect) {
      this._selectMultipleAnswers(answerData);
    } else {
      this._selectSingleAnswer(answerData);
    }
  }


  /**
   * Handles selecting an answer when Layer.UI.messages.ChoiceMessageModel.allowMultiple is enabled.
   *
   * @method _selectMultipleAnswers
   * @private
   * @param {Object} answerData
   * @param {String} answerData.id   ID of the choice that is to be selected
   */
  _selectMultipleAnswers(answerData) {
    let action;
    const id = answerData.id;
    const initialSelectedAnswer = this.selectedAnswer;

    // Get the customResponseData of the specified Choice
    const choiceItem = this.getChoiceById(id);

    const selectedIndex = this.getChoiceIndexById(id);
    const selectedText = this.getText(selectedIndex);

    // this.selectedAnswer is a comma separated string where each selected id is an
    // element in the list; access that as an array.
    const selectedAnswers = this.selectedAnswer ? this.selectedAnswer.split(/\s*,\s*/) : [];

    // If the selection was already selected, then deselect it
    // otherwise add the new selection to the selectedAnswers array
    const answerDataIndex = selectedAnswers.indexOf(id);
    if (answerDataIndex !== -1) {
      selectedAnswers.splice(answerDataIndex, 1);
      action = 'deselected';
    } else {
      selectedAnswers.push(id);
      action = 'selected';
    }


    const messageText = this._generateResponseMessage({
      selectedText,
      action,
    });

    if (action === 'selected') {
      this.responses.addState(this.responseName, id);
    } else {
      this.responses.removeState(this.responseName, id);
    }

    const customResponseData = {};
    if (this.customResponseData) {
      Object.keys(this.customResponseData).forEach(key => (customResponseData[key] = this.customResponseData[key]));
    }

    if (action === 'selected' && choiceItem.customResponseData) {
      Object.keys(choiceItem.customResponseData).forEach((key) => {
        customResponseData[key] = choiceItem.customResponseData[key];
      });
    }

    if (Object.keys(customResponseData).length) {
      this.responses.addState('custom_response_data', customResponseData);
    }

    this.responses.setResponseMessageText(messageText);

    // Update the selected answer and update the UI
    // TODO: Use function to look at all state and get selectedAnswer
    this.selectedAnswer = this.responses.getState(this.responseName, Client.user).join(',');


    // Tell the UIs to update
    this._triggerAsync('message-type-model:change', {
      property: 'selectedAnswer',
      newValue: this.selectedAnswer,
      oldValue: initialSelectedAnswer,
    });
  }

  /**
   * Send the response message unless the app calls `evt.preventDefault()` on the `message-type-model:customization` event.
   *
   * @method _generateResponseMessage
   * @param {Object} options
   *
   */
  _generateResponseMessage({ action, selectedText, choiceItem, participantData }) {
    // Generate the Response Message
    let text = `${Client.user.displayName} ${action} "${selectedText}"` + (this.name ? ` for "${this.name}"` : '');
    return text;
    /**
     * Whenever the Choice Model is about to send a Response Message, this event is triggered.
     *
     * Use this event to customize or prevent the Response Message
     *
     * ```
     * client.on('message-type-model:customization', function(evt) {
     *     if (evt.detail.type === 'generate-response-message') {
     *         evt.returnValue("I have " + (evt.detail.choice === 'selected' ? "clicked " : "unclicked ") + evt.detail.choice.text);
     *     }
     * });
     * ```
     *
     * The value provided to the event via Layer.Core.LayerEvent.returnValue will become the Status Message
     * used within the Response Message.
     *
     * One could also prevent the Response Message from containing a Status Message (sub-model); by returning `null`; this would mean:
     *
     * * The Response Message is not rendered
     * * No notification is presented to recipients
     *
     * ```
     * client.on('message-type-model:customization', function(evt) {
     *     if (evt.detail.type === 'generate-response-message') {
     *         evt.returnValue(null);
     *     }
     * });
     * ```
     *
     * Alternatively, one could call `evt.preventDefault()`; this will prevent the Response Message from being sent.
     *
     * @event message-type-model:customization
     * @param {CustomEvent} evt
     * @param {Object} evt.detail
     * @param {Boolean} evt.detail.cancelable   This event is cancelable and will respond to `evt.preventDefault()`
     * @param {String} evt.detail.type          "layer-choice-model-generate-response-message" will accompany events for this model
     * @param {String} evt.detail.text          This is the text that the Choice Model will use for its Response Message
     * @param {Object} evt.detail.choice        This is the Choice Object that the user selected
     * @param {String} evt.detail.action        Either "selected" or "deselected"
     * @param {Layer.UI.messages.ChoiceMessageModel} evt.detail.model  This Choice Model
     * @param {String} evt.detail.name          Suggested name to describe the choice message the use is responding to; can be used to help your `evt.returnValue()` call.
     */

    // UI will trigger evt.type (choice-model-generate-response-message)
    const evt = this.trigger('message-type-model:customization', {
      cancelable: true,
      type: 'layer-choice-model-generate-response-message',
      choice: choiceItem,
      model: this,
      text,
      action,
      name: this.name,
    });

    // If evt.cancel() was called (or from the UI event: evt.preventDefault()) do not send the Response Message
    if (evt.canceled) return;

    // If evt.returnValue(text) was called  (or from the UI event evt.detail.returnValue(text)  ) then use the provided text for the Response Message
    if (evt.returnedValue !== null) text = evt.returnedValue;

    const responseModel = new ResponseModel({
      participantData,
      responseTo: this.message.id,
      responseToNodeId: this.parentId || this.nodeId,
      displayModel: text ? new StatusModel({ text }) : null,
    });

    // Technically, one shouldn't ever perform these actions on a message that hasn't yet been sent.
    // however rather than reject that entirely, we simply insure that we only send a Response Message
    // for a Message that is shared among the participants.
    if (!this.message.isNew()) {
      responseModel.send({ conversation: this.message.getConversation() });
    }
  }

  /**
   * Handles selecting an answer when Layer.UI.messages.ChoiceMessageModel.allowMultiple is disabled.
   *
   * @method _selectSingleAnswer
   * @private
   * @param {Object} answerData
   * @param {String} answerData.id   ID of the choice that is to be selected
   */
  _selectSingleAnswer(answerData) {
    const initialSelectedAnswer = this.selectedAnswer;
    let action = 'selected';
    const id = answerData.id;
    const choiceItem = this.getChoiceById(id);

    // Get the index and text of the selected answer
    const selectedIndex = this.getChoiceIndexById(answerData.id);
    const selectedText = this.getText(selectedIndex);

    // If we are actually deselecting, clear the index, id and action
    if (this.isSelectionEnabledFor(selectedIndex) && this.isSelectedIndex(selectedIndex)) {
      action = 'deselected';
    }

    const messageText = this._generateResponseMessage({
      selectedText,
      action,
    });

    if (action === 'selected') {
      this.responses.addState(this.responseName, id);
    } else {
      this.responses.removeState(this.responseName, id);
    }

    const customResponseData = {};
    if (this.customResponseData) {
      Object.keys(this.customResponseData).forEach(key => (customResponseData[key] = this.customResponseData[key]));
    }

    if (action === 'selected' && choiceItem.customResponseData) {
      Object.keys(choiceItem.customResponseData).forEach((key) => {
        customResponseData[key] = choiceItem.customResponseData[key];
      });
    }

    if (Object.keys(customResponseData).length) {
      this.responses.addState('custom_response_data', customResponseData);
    }

    this.responses.setResponseMessageText(messageText);

    // Update the selected answer and update the UI
    // TODO: Use function to look at all state and get selectedAnswer
    this.selectedAnswer = this.responses.getState(this.responseName, Client.user);

    this._triggerAsync('message-type-model:change', {
      property: 'selectedAnswer',
      newValue: this.selectedAnswer,
      oldValue: initialSelectedAnswer,
    });
  }


  /**
   * Whenever a new Layer.Core.MessageTypeModel.responses value is set, update our state.
   *
   * A new Responses value typically means a change of selected answer for this Choice.
   *
   * Read in the new values, and update `this.selectedAnswer`.
   *
   * @method parseModelResponses
   * @protected
   */
  parseModelResponses() {
    // If still within the _pauseUpdateTimeout, simply indicate that we have a pending response
    if (this._pauseUpdateTimeout) {
      this._hasPendingResponse = true;
    } else {
      const initialSelectedAnswer = this.selectedAnswer;

      this._hasPendingResponse = false;
      const senderId = this.message.sender.userId;
      let data = this.responses.getStates(this.responseName, this.enabledFor && this.enabledFor.length ? this.enabledFor : null);

      // If multiple users have resonded to this Choice Message, ignore any responses from the Choice
      // Message Sender.
      if (data.length > 1) data = data.filter(response => response.identityId !== senderId);

      // Assuming we have remaining responses, update selectedAnswer with them.
      // TODO: Work out some way to aggregate multiple user's responses
      if (data.length) {
        this.selectedAnswer = data[0].value;

        // Trigger a change event if there was a prior answer
        if (this.selectedAnswer !== initialSelectedAnswer) {
          this._triggerAsync('message-type-model:change', {
            propertyName: 'selectedAnswer',
            oldValue: initialSelectedAnswer,
            newValue: this.selectedAnswer,
          });
        }
      }
    }
  }


  /*
   * Get the selected answer; we use this because we want to allow `null` to indicate that this is unset but still return '' as the actual value.
   *
   * @method __getSelectedAnswer
   * @returns {String}
   */
  __getSelectedAnswer() {
    return this.__selectedAnswer || '';
  }

  /*
   * Get the selected answer text
   *
   * @method __getSelectedChoice
   * @returns {String}
   */
  __getSelectedChoice() {
    if (this.allowMultiselect) return null;

    const selectedId = this.__selectedAnswer;
    if (!selectedId) return '';

    const index = this.getChoiceIndexById(selectedId);
    return this.choices[index];
  }


  // Used to render Last Message in the Conversation List
  getOneLineSummary() {
    return this.label || this.title || this.constructor.LabelSingular;
  }

  /**
   * Getter for the Layer.Core.MessageTypeModel.currentMessageRenderer property.
   *
   * Insures that the property retrns an appropiate value based on the model's
   * Layer.UI.messages.ChoiceMessageModel.type property
   *
   * @method __getCurrentMessageRenderer
   * @private
   */
  __getCurrentMessageRenderer() {
    switch (this.type.toLowerCase()) {
      case 'standard':
        return 'layer-choice-message-view';
      // case 'TiledChoices':
      // return 'layer-choice-tiles-message-view';
      case 'label':
        return 'layer-choice-label-message-view';
    }
  }

  /**
   * Get the Choice by `id`.
   *
   * @method getChoiceById
   * @param {String} id
   * @returns {Object} choice
   */
  getChoiceById(id) {
    for (let i = 0; i < this.choices.length; i++) {
      if (this.choices[i].id === id) return this.choices[i];
    }
    return null;
  }

  /**
   * Returns the index of the choice associated with this id within the choices array.
   *
   * @method getChoiceIndexById
   * @param {String} id
   * @returns {Number}
   */
  getChoiceIndexById(id) {
    const choice = this.getChoiceById(id);
    return this.choices.indexOf(choice);
  }

  /**
   * Returns whether or not the specified index is selected.
   *
   * Why not just we getSelectedIndex() or some similar method?
   * Because multiselect means that many indexes may be selected,
   * so simplest just to ask if a given index is selected.
   *
   * @method isSelectedIndex
   * @param {Number} choiceIndex
   * @returns {Boolean}
   */
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

  /**
   * Gets the text for the choice at the specified index.
   *
   * Note that text can be modified based on state, such that just using
   * `choice.text` is insuficient.
   *
   * @method getText
   * @param {Number} choiceIndex
   * @returns {String}
   */
  getText(choiceIndex) {
    const state = this.getState(choiceIndex);
    const choiceItem = this.choices[choiceIndex];
    return state === 'selected' ? choiceItem.getSelectedText() : choiceItem.getDefaultText();
  }

  /**
   * Gets the tooltip for the choice at the specified index.
   *
   * Note that tooltip can be modified based on state, such that just using
   * `choice.tooltip` is insuficient.
   *
   * @method getTooltip
   * @param {Number} choiceIndex
   * @returns {String}
   */
  getTooltip(choiceIndex) {
    const state = this.getState(choiceIndex);
    const choiceItem = this.choices[choiceIndex];
    return state === 'selected' ? choiceItem.getSelectedTooltip() : choiceItem.getDefaultTooltip();
  }

  /**
   * Get the state of the specified index; its either 'selected' or 'default'
   *
   * @method getState
   * @param {Number} choiceIndex
   * @returns {String}
   */
  getState(choiceIndex) {
    if (this.isSelectedIndex(choiceIndex)) {
      return 'selected';
    } else {
      return 'default';
    }
  }

  // Getter for the expandedType property
  __getExpandedType() {
    return this.__expandedType || this.type;
  }

  // Backwards compat but unsupported use links question to label
  __getQuestion() {
    return this.label;
  }
  __updateQuestion(value) {
    this.label = value;
  }

  destroy() {
    clearTimeout(this._pauseUpdateTimeout);
    super.destroy();
  }
}

/**
 * Specifies who can make changes to this Choice Model.
 *
 * If left unset, everyone can make changes. Else only Identities listed in this Message are allowed
 * to make changes.
 *
 * Note that this is enforced at the UI and model level, but should not be treated as a security feature.
 *
 * ```
 * choiceModel.enabledFor = ["layer:///identities/frodo-the-dodo"];
 * ```
 *
 * @property {String[]}
 */
ChoiceModel.prototype.enabledFor = null;

/**
 * Is this Choice Model for a one time selection or can users change their answers?
 *
 * @property {Boolean} [allowReselect=false]
 */
ChoiceModel.prototype.allowReselect = false;

/**
 * Can users deselect a choice; thus potentially leaving no choices selected?
 *
 * If this is `true`, Layer.UI.messages.ChoiceMessageModel.allowReselect is forced to `true`
 *
 * @property {Boolean} [allowDeselect=false]
 */
ChoiceModel.prototype.allowDeselect = false;

/**
 * Can users select multiple choices?
 *
 * If this is `true`, Layer.UI.messages.ChoiceMessageModel.allowDeselect is forced to `true`
 *
 * @property {Boolean} [allowMultiselect=false]
 */
ChoiceModel.prototype.allowMultiselect = false;

/**
 * What type of Choice Model is this; used to select a renderer for the Model.
 *
 * * `standard`: Use a `<layer-choice-message-view />` to render a choice message for the user to make a selection from.
 * * `label`: Use a `<layer-choice-label-message-view />` to render a label indicating the current value
 *
 * @property {String} [type=standard]
 */
ChoiceModel.prototype.type = 'standard';

/**
 * What type of Choice Model renderer should represent this in an expanded or full-screen view?
 *
 * * `standard`: Use a `<layer-choice-message-view />` to render a choice message for the user to make a selection from.
 * * `label`: Use a `<layer-choice-label-message-view />` to render a label indicating the current value
 *
 * If left unset, the Layer.UI.messages.ChoiceMessageModel.type property value will be used instead.
 *
 * @property {String} [expandedType]
 */
ChoiceModel.prototype.expandedType = '';

/**
 * Title for the Choice Message; set to empty string to remove the titlebar entirely
 *
 * @property {String} [title=Choose One]
 */
ChoiceModel.prototype.title = 'Choose One';

/**
 * String to describe the choice to be made.
 *
 * Typically this would be a question "How much do you hate your toes" ["A lot", "A little"].
 * But it may also just be a word next to a value or set of values "Size" ["small", "medium", "large"]
 * or "Color" ["red", "black"]
 *
 * @property {String} [label]
 */
ChoiceModel.prototype.label = '';
ChoiceModel.prototype.question = ''; // deprecated

/**
 * Array of Layer.UI.messages.ChoiceMessageItemModel representing the choices for the user to pick from.
 *
 * @property {Layer.UI.messages.ChoiceMessageItemModel[]} choices
 */
ChoiceModel.prototype.choices = null;

/**
 * The responseName identifies the value that has changed.
 *
 * The Choice Model sends a Response Message when a change has been made.  A Message however might have
 * many different Response Messages related to many different states that are sent, so its important
 * to be able to clearly identity and define each one.  This can be done by providing a custom value
 * for this property.
 *
 * @property {String} [responseName=selection]
 */
ChoiceModel.prototype.responseName = 'selection';

// Defined in parent class, but must be redefined here for the getter/setter functions to work
ChoiceModel.prototype.currentMessageRenderer = null;

/**
 * Get/set the currently selected answer.
 *
 * Setting this property will trigger a `change` event, but will *not* send a Response Message.
 * To send a Response Message use Layer.UI.messages.ChoiceMessageModel.selectAnswer() instead.
 *
 * ```
 * if (choiceModel.selectedAnswer == 'red') {
 *    alert('red');
 * }
 * ```
 *
 * NOTE: The getter will return empty string if it has no value.
 *
 * @property {String} selectedAnswer
 */
ChoiceModel.prototype.selectedAnswer = null;


/**
 * Get the currently selected choice object; returns null if `allowMultiselect=true`
 *
 * ```
 * if (choiceModel.selectedChoice.id == 'red') {
 *    alert('red');
 * }
 * ```
 *
 * NOTE: The getter will return empty string if it has no value.
 *
 * @property {String} selectedChoice
 * @readonly
 */
ChoiceModel.prototype.selectedChoice = null;

/**
 * Provide a preselectedChoice for any new Message that needs a choice preselected.
 *
 * Example: You want to create a Product Message that has a Size option and you know at sending time that
 * the preferred size is "Medium":
 *
 * ```
 * new ChoiceModel({
 *     preselectedChoice: "m",
 *     choices: [
 *         {"text": "Medium", id: "m"},
 *         {"text": "Large", id: "l"},
 *     ]
 * });
 * ```
 *
 * @property {String} preselectedChoice
 */
ChoiceModel.prototype.preselectedChoice = '';

/**
 * Provide Custom Response Data that will be inserted into any Response Message sent on behalf of the User.
 *
 * If the user makes a selection, a Custom Response Message will be sent with the selection information in its data.
 * Use this property to add additional information such as Product ID, or other clarifying details.
 *
 * @property {Object} customResponseData
 */
ChoiceModel.prototype.customResponseData = null;

/**
 * The name property is used for a concise description of this Message.
 *
 * The concise description is used to describe it from outside of the message; most commonly within a Response Message.
 *
 * If the name is "Bad Hobbit Moves", then the user's Response Message will say `Frodo-the-dodo has selected "swallow the ring" for "Bad Hobbit Moves"`.
 * However if there is no name property, then the user's Response Message will just say `Frodo-the-dodo has selected "swallow the ring"`.
 *
 * @property {String} [name=]
 */
ChoiceModel.prototype.name = '';

/**
 * setTimeout id used to insure that changes made to the UI and changes generated from the server
 * don't conflict with each other.
 *
 * @property {Number}
 * @private
 */
ChoiceModel.prototype._pauseUpdateTimeout = 0;

/**
 * One instance of this type
 *
 * @static
 * @property {String} [LabelSingular=Choice]
 */
ChoiceModel.LabelSingular = 'Choice';

/**
 * One instance of this type
 *
 * @static
 * @property {String} [LabelPlural=Choices]
 */
ChoiceModel.LabelPlural = 'Choices';

/**
 * Standard concise representation of this Message Type
 *
 * @static
 * @property {String} [SummaryTemplate=]
 */
ChoiceModel.SummaryTemplate = '';

/**
 * There is no default action when clicking on a Choice Message; only clicking on the Choice Buttons should cause an action.
 *
 * @static
 * @property {String} [defaultAction=]
 */
ChoiceModel.defaultAction = '';

/**
 * The MIME Type recognized by and used by the Choice Model.
 *
 * @static
 * @property {String} [MIMEType=application/vnd.layer.choice+json]
 */
ChoiceModel.MIMEType = 'application/vnd.layer.choice+json';

/**
 * The UI Component to render the Choice Model.
 *
 * @static
 * @property {String} [messageRenderer=layer-choice-message-view]
 */
ChoiceModel.messageRenderer = 'layer-choice-message-view';

ChoiceModel._supportedEvents = [

].concat(MessageTypeModel._supportedEvents);

// Register the Class
Root.initClass.apply(ChoiceModel, [ChoiceModel, 'ChoiceModel']);

// Register the Message Model Class with the Client
Core.Client.registerMessageTypeModelClass(ChoiceModel, 'ChoiceModel');

module.exports = ChoiceModel;

