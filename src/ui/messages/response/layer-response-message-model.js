/**
 * Response Message Model is used to update a Message with Response Data.
 *
 * 1. A Response Message is sent with properties describing the user's action, or some
 * change in the Message's state.
 * 2. Each participant in the Conversation will see a Message stating what the user did.
 * 3. The server copies those properties into the Message that was Responded to;
 *    these properties are namespaced with the sender's Identity ID, and do not replace
 *    any properties of the Message.
 * 4. Each client will receive an update to their Message with the new state, which will be stored
 *    in the Message's `responses` property, where the model can then process it and where
 *    the UI can then rerender/update itself.
 *
 * ```
 * ResponseModel = Layer.Core.Client.getMessageTypeModelClass('ResponseModel')
 * var responseModel = new ResponseModel({
 *     // The change in state to the Message based on the user's actions:
 *     participantData: {
 *        color: 'black',
 *        size: 'toy',
 *        type: 'poodle'
 *     },
 *
 *     // The Message whose state is being changed
 *     responseTo: 'layer:///messages/4e01d3b4-e3e3-4fd2-a991-69e94511a17b',
 *
 *     // Sometimes a response is to the Root Node of a Message... and sometimes,
 *     // its to a subnode of the message.  Identity the Message Part (node) that this is
 *     // a response to
 *     responseToNodeId: '4e01d3b1-e3e2-4fd3-a994-69e94511a275',
 *
 *     // Visually represent the Message to all users as a state change
 *     // While any Submodel can be used here, only TextModels are recommended.
 *     displayModel: new TextModel({
 *       text: 'John picked a black toy poodle'
 *     }),
 * });
 * responseModel.send({ conversation });
 * ```
 *
 * Currently,a Response Message that does not contain a `displayModel` is not well supported,
 * its recommended that a `displayModel` always be included.
 *
 * ### Importing
 *
 * Included with the standard build. For custom build, Import with:
 *
 * ```
 * import '@layerhq/web-xdk/ui/messages/response/layer-response-message-view';
 * ```
 *
 * @class Layer.UI.messages.ResponseMessageModel
 * @extends Layer.Core.MessageTypeModel
 */
import Core, { MessagePart, MessageTypeModel } from '../../../core';
import { registerStatusModel } from '../../ui-utils';


class ResponseModel extends MessageTypeModel {

  /**
   * Generate all of the Layer.Core.MessagePart needed to represent this Model.
   *
   * Used for Sending the Response Message.
   *
   * @method generateParts
   * @private
   * @param {Function} callback
   * @param {Layer.Core.MessagePart[]} callback.parts
   */
  generateParts(callback) {
    const body = this.initBodyWithMetadata(['responseTo', 'responseToNodeId', 'participantData']);
    body.changes = this._operationsToSend.map(op => op.toSerializableObject());

    this.part = new MessagePart({
      mimeType: this.constructor.MIMEType,
      body: JSON.stringify(body),
    });
    const parts = [this.part];

    // Add the displayModel's MessagePart, if there is one
    if (this.displayModel) {
      this.addChildModel(this.displayModel, 'status', (moreParts) => {
        moreParts.forEach(p => parts.push(p));
        callback(parts);
      });
    } else {
      callback(parts);
    }
  }

  /**
   * On receiving a new Layer.Core.Message, parse it and setup this Model's properties.
   *
   * @method parseModelChildParts
   * @private
   */
  parseModelChildParts({ parts, init }) {
    super.parseModelChildParts({ parts, init });

    // Find the displayModel in the MessageParts and create that Model.
    this.displayModel = this.getModelsByRole('status')[0] || null;

    // This code is for backwards compatability with Web XDK 1.0.0-pre1.X and will likely be removed by Web XDK 3.0.0
    if (!this.displayModel) {
      const part = this.message.getPartsMatchingAttribute({ role: 'message' })[0];
      if (part) {
        const StatusModel = Core.Client.getMessageTypeModelClass('StatusModel');
        this.displayModel = new StatusModel({ text: JSON.parse(part.body).text });
        this.displayModel.part = part;
      }
    }
  }

  // Used to render Last Message in the Conversation List
  getOneLineSummary() {
    const result = super.getOneLineSummary();
    return (result === this.constructor.LabelSingular) ? '' : result;
  }

  // No notification if there is no displayModel
  getNotification() {
    if (this.displayModel) {
      return super.getNotification();
    } else {
      return {};
    }
  }

  addOperations(operations) {
    if (!this._operationsToSend) this._operationsToSend = [];
    this._operationsToSend.push(...operations);
  }
}

ResponseModel.prototype._operationsToSend = null;

/**
 * Contains all of the participants data indexed by Identity ID.
 *
 * ```
 * // Get the color selected by a user with the specified Identity ID
 * var color = model.participantData[identityId].color;
 *
 * // If multiple users can set a color status, gather all colors sent by all users
 * var colors = Object.keys(model.participantData).map((identityId) => {
 *    return model.participantData[identityId].color;
 * }).filter(function(color) { return color !== undefined; });
 * ```
 *
 * @property {Object} [participantData={}]
 */
ResponseModel.prototype.participantData = null;
ResponseModel.prototype.sharedData = null;

/**
 * Message ID of the message that this is a Response to.  Used by the server,
 * to identify which Message to update.
 *
 * @property {String} responseTo
 */
ResponseModel.prototype.responseTo = '';

/**
 * Node ID of the MessagePart that this is a Response to.
 *
 * Used by the server, to identify which MessagePart to update.  In the event that
 * a Carousel contains Choice Buttons/Choice Messages, the Response Message is a response
 * to the Choice Message, not the Carousel and needs to target it specifically.
 *
 * @property {String} responseToNodeId
 */
ResponseModel.prototype.responseToNodeId = '';

/**
 * The displayable portion of this message that is shown to users, represented as a Message Model.
 *
 * @property {Layer.Core.MessageTypeModel}
 */
ResponseModel.prototype.displayModel = null;

/**
 * One instance of this type
 *
 * @static
 * @property {String} [LabelSingular=Response]
 */
ResponseModel.LabelSingular = 'Response';

/**
 * One instance of this type
 *
 * @static
 * @property {String} [LabelPlural=Responses]
 */
ResponseModel.LabelPlural = 'Responses';

/**
 * Standard concise representation of this Message Type
 *
 * @static
 * @property {String} [SummaryTemplate=${itemCount} ${label}]
 */
ResponseModel.SummaryTemplate = '${displayModel}'; // eslint-disable-line no-template-curly-in-string


/**
 * The MIME Type recognized by and used by the Response Model.
 *
 * @static
 * @property {String} [MIMEType=application/vnd.layer.response+json]
 */
ResponseModel.MIMEType = 'application/vnd.layer.response-v2+json';

/**
 * The UI Component to render the Response Model.
 *
 * @static
 * @property {String} [messageRenderer=layer-response-message-view]
 */
ResponseModel.messageRenderer = 'layer-response-message-view';

// Register the Message Model Class with the Client
Core.Client.registerMessageTypeModelClass(ResponseModel, 'ResponseModel');

// Register the message to be handled as a Status Message
registerStatusModel(ResponseModel);

module.exports = ResponseModel;
