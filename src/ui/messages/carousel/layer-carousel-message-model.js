/**
 * A Carousel of Message Models
 *
 * This is a relatively trivial class that simply manages an array of Message Models
 * that will be rendered within any Viewer associated with this model.
 *
 * ```
 * CarouselModel = Layer.Core.Client.getMessageTypeModelClass('CarouselModel');
 * ButtonsModel = Layer.Core.Client.getMessageTypeModelClass('ButtonsModel');
 * model = new CarouselModel({
 *    items: [
 *       new ButtonModel({
 *         buttons: [{type: "action", event: "do-something"}]
 *         contentModel: new TextModel({
 *           text: 'Text 1',
 *           title: 'Title 1'
 *         })
 *       }),
 *       new ButtonModel({
 *         buttons: [{type: "action", event: "do-something"}]
 *         contentModel: new TextModel({
 *           text: 'Text 2',
 *           title: 'Title 2'
 *         })
 *       }),
 *       new ButtonModel({
 *         buttons: [{type: "action", event: "do-something"}]
 *         contentModel: new TextModel({
 *           text: 'Text 3',
 *           title: 'Title 3'
 *         })
 *       })
 *     ]
 * });
 * model.generateMessage(conversation, message => message.send());
 * ```
 *
 * @class Layer.UI.messages.CarouselMessageModel
 * @extends Layer.Core.MessageTypeModel
 */
import { Client, MessagePart, MessageTypeModel, Root } from '../../../core';

class CarouselModel extends MessageTypeModel {
  /**
   * Generate the Message Parts representing this model so that the Carousel Message can be sent.
   *
   * Requires generating one or more Message Parts per submodel in the `items` array
   *
   * @method _generateParts
   * @protected
   * @param {Function} callback
   * @param {Layer.Core.MessagePart[]} callback.parts
   */
  _generateParts(callback) {
    const body = this._initBodyWithMetadata(['title']);

    this.part = new MessagePart({
      mimeType: this.constructor.MIMEType,
      body: JSON.stringify(body),
    });

    let asyncCount = 0;
    const parts = [this.part];

    // Generate the parts for each carousel-item, attach the carousel-item role and call the callback when done
    this.items.forEach((item) => {
      this._addModel(item, 'carousel-item', (moreParts) => {
        moreParts.forEach(p => parts.push(p));
        asyncCount++;
        if (asyncCount === this.items.length) {
          callback(parts);
        }
      });
    });

    // This is done independently of generating the parts; should not modify the Parts that are being generrated,
    // and is here as there is no `afterMessageCreated` callback or event.
    this.items.forEach(item => item._mergeAction(this.action));
  }


  /**
   * On receiving a new Layer.Core.Message, parse it and setup this Model's properties.
   *
   * This primarily consists of importing all of the `carousel-item` Message Parts.
   *
   * @method _parseMessage
   * @protected
   * @param {Object} payload
   */
  _parseMessage(payload) {
    super._parseMessage(payload);
    const parts = this.childParts.filter(part => part.mimeAttributes.role === 'carousel-item');
    this.items = parts.map(part => part.createModel());

    // Setup the actions for each Carousel Item Model.
    this.items.forEach(item => item._mergeAction(this.action));
  }

  /**
   * Any time the action property is set, update the actions of all of the Carousel Items.
   *
   * > *Note*
   * >
   * > One must set the action, not a property of the action for this to work.
   *
   * @method __updateAction
   * @private
   * @param {Object} newValue
   */
  __updateAction(newValue) {
    if (this.items) this.items.forEach(item => item._mergeAction(newValue));
  }

  // Used to render Last Message in the Conversation List
  getOneLineSummary() {
    return this.items.length + ' ' + this.constructor.Label;
  }
}

// Defined in parent class, but must be redefined here for __updateAction to be hit whenever setting the action.
CarouselModel.prototype.action = null;

/**
 * Array of Layer.Core.MessageTypeModel Models, each representing a Carousel Item.
 *
 * @property {Layer.Core.MessageTypeModel[]} items
 */
CarouselModel.prototype.items = null;

/**
 * Set a title for the Carousel; if no title, titlebar is hidden, and layout is more spacious.
 *
 * @experimental Not supported on mobile devices
 * @property {String} title
 */
CarouselModel.prototype.title = '';

/**
 * Textual label representing all instances of Carousel Message.
 *
 * @static
 * @property {String} [Label=Items]
 */
CarouselModel.Label = 'Items';

/**
 * The MIME Type recognized by and used by the Carousel Model.
 *
 * @static
 * @property {String} [MIMEType=application/vnd.layer.carousel+json]
 */
CarouselModel.MIMEType = 'application/vnd.layer.carousel+json';

/**
 * The UI Component to render the Carousel Model.
 *
 * @static
 * @property {String} [messageRenderer=layer-carousel-message-view]
 */
CarouselModel.messageRenderer = 'layer-carousel-message-view';

// Finish setting up the Class
Root.initClass.apply(CarouselModel, [CarouselModel, 'CarouselModel']);

// Register the Message Model Class with the Client
Client.registerMessageTypeModelClass(CarouselModel, 'CarouselModel');

module.exports = CarouselModel;


