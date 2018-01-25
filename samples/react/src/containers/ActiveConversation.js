/**
 * This is a Container with direct access to all actions and state, and
 * is responsible for managing the UI of the right panel of the app.
 * That consists of the Conversation Header and the Conversation Panel
 */

import React, { Component, PropTypes } from 'react';
import ReactDom from 'react-dom';

import { bindActionCreators } from 'redux';
import { connect as connectRedux } from 'react-redux';
import { connectQuery } from 'layer-react';
import * as MessengerActions from '../actions/messenger';
import ConversationHeader from '../components/ConversationHeader';
import { LayerReactUI, Layer, layerClient } from '../get-layer';
import { googleMapsKey } from '../../common/identityServices';

const { ConversationView, SendButton, FileUploadButton, MenuButton }  = LayerReactUI;
const LayerUIUtil = Layer.UI.UIUtils;
const QueryBuilder = Layer.Core.QueryBuilder;
const ResponseModel = Layer.Core.Client.getMessageTypeModelClass('ResponseModel');

/**
 * Copy data from reducers into our properties
 */
function mapStateToProps({ activeConversationState, router }) {
  return {
    ...activeConversationState,
    activeConversation: activeConversationState.conversation,
    activeConversationId: router.params.conversationId ? `layer:///conversations/${router.params.conversationId}` : ''
  };
}

/**
 * Copy all actions into this.props.actions
 */
function mapDispatchToProps(dispatch) {
  return { actions: bindActionCreators(MessengerActions, dispatch) };
}

@connectRedux(mapStateToProps, mapDispatchToProps)
export default class ActiveConversation extends Component {
  componentDidMount() {
    var node = ReactDom.findDOMNode(this.refs.conversationPanel);
    var button = document.createElement('button');
    button.innerHTML = 'Sample Button';
    node.composeButtons = [
      document.createElement('layer-file-upload-button'),
      button,
      document.createElement('layer-send-button'),
    ];
  }

  getMenuOptions() {
    const conversation = layerClient.getConversation(this.props.activeConversationId);
    return [
      {
        text: "Create Text Message",
        method: function() {
          const TextModel = Layer.Core.Client.getMessageTypeModelClass('TextModel');
          const model = new TextModel({
            text: 'And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.',
            title: 'The Holy Hand Grenade',
            author: 'King Arthur'
          });
          model.generateMessage(conversation, message => message.send());
        }.bind(this)
      },
      {
        text: 'Create Link Message',
        method: function() {
          const LinkModel = Layer.Core.Client.getMessageTypeModelClass('LinkModel');
          const model = new LinkModel({
            url: "https://layer.com/introducing-the-layer-conversation-design-system/",
            title: "Introducing the Layer Conversation Design System",
            imageUrl: "https://layer.com/wp-content/uploads/2017/07/bezier-blog-header-2x.png",
            description: "The Layer Conversation Design System helps you imagine and design the perfect customer conversation across devices."
          });
          model.generateMessage(conversation, message => message.send());
        }.bind(this),
      },
      {
        text: 'Create Image Message',
        method: function() {
          const ImageModel = Layer.Core.Client.getMessageTypeModelClass('ImageModel');
          const model = new ImageModel({
            sourceUrl: "https://78.media.tumblr.com/1b019b4237ab18f789381941eca98784/tumblr_nlmlir7Lhk1u0k6deo1_400.gif",
            artist: "Monty Python",
            title: "Tis only a flesh wound",
            subtitle: "Your arm's off!"
          });
          model.generateMessage(conversation, message => message.send())
        }.bind(this),
      },
      {
        text: 'Create File Message',
        method: function() {
          const FileModel = Layer.Core.Client.getMessageTypeModelClass('FileModel');
          const model = new FileModel({
            sourceUrl: "https://raw.githubusercontent.com/layerhq/web-xdk/master/README.md?token=AAPUfjxdAz2WZ_0AcEaMHgD4w8yPi2v7ks5Z8h15wA%3D%3D",
            mimeType: "text/markdown",
            title: "Web XDK Readme",
            author: "layer.com"
          })
          model.generateMessage(conversation, message => message.send())
        }.bind(this),
      },
      {
        text: 'Create Location Message',
        method: function() {
          if (!window.googleMapsAPIKey) {
            alert('Please add a Google Maps API Key to your LayerConfiguration.json file using the key name "google_maps_key"');
          } else {
            const LocationModel = Layer.Core.Client.getMessageTypeModelClass('LocationModel');

            const model = new LocationModel({
              latitude: 37.7734858,
              longitude: -122.3916087,
              heading: 23.45,
              altitude: 35.67,
              title: "Here I am.  Right there on the dot. I'm stuck on the dot.  Please free me.",
              description: "Dot prisoner 455 has attempted to escape.  Send in the puncutation and make a very strong point about dot prisoner escapes",
              accuracy: 0.8,
              createdAt: new Date(),
            });
            model.generateMessage(conversation, message => message.send());
          }
        }.bind(this),
      },
      {
        text: 'Create Button Message',
        method: function() {
          const ButtonsModel = Layer.Core.Client.getMessageTypeModelClass('ButtonsModel');
          const TextModel = Layer.Core.Client.getMessageTypeModelClass('TextModel');

          const model = new ButtonsModel({
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
          model.generateMessage(conversation, message => message.send());

          if (!this.buttonSampleSetup) {
            this.buttonSampleSetup = true;
            document.body.addEventListener('kill-arthur', function() {
              alert('Hah! Tis only a flesh wound!');
            });

            document.body.addEventListener('grant-grail', function() {
              alert('We\'ve already got one!');
            });
          }
        }.bind(this),
      },
      {
        text: 'Create Button Message with Choices',
        method: function() {
          const ButtonsModel = Layer.Core.Client.getMessageTypeModelClass('ButtonsModel');
          const TextModel = Layer.Core.Client.getMessageTypeModelClass('TextModel');

          const model = new ButtonsModel({
            buttons: [
              {
                "type": "choice",
                "choices": [
                  {"text": "Kill Arthur", "id": "kill"},
                  {"text": "Give Holy Grail", "id": "grail"}
                ],
                "data": {
                  "responseName": "deal-with-arthur",
                  "allowReselect": true
                }
              }
            ],
            contentModel: new TextModel({
              text: 'And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.',
              title: 'The Holy Hand Grenade',
              author: 'King Arthur'
            })
          });
          model.generateMessage(conversation, message => message.send());

          if (!this.buttonSampleSetup) {
            this.buttonSampleSetup = true;
            document.body.addEventListener('kill-arthur', function() {
              alert('Hah! Tis only a flesh wound!');
            });

            document.body.addEventListener('grant-grail', function() {
              alert('We\'ve already got one!');
            });
          }
        }.bind(this),
      },
      {
        text: 'Create Product Message',
        method: function() {
          const ProductModel = Layer.Core.Client.getMessageTypeModelClass('ProductModel');
          const ChoiceModel = Layer.Core.Client.getMessageTypeModelClass('ChoiceModel')

          const model = new ProductModel({
             customData: {
               product_id: "Frodo-the-dodo",
               sku: "frodo-is-ascew"
             },
             url: 'https://static.giantbomb.com/uploads/original/0/7465/1296890-apple3.jpg',
             currency: 'USD',
             price: 175,
             quantity: 3,
             brand: 'Apple',
             name: 'Apple 2 plus desktop computer',
             description: 'This computer will last you a lifetime.  Its processing power far outweighs your old calculator.  Its DOS based interface is the most modern available anywhere in the world. Keyboard is built-in and ergonomic.',
             imageUrls: ['https://static.giantbomb.com/uploads/original/0/7465/1296890-apple3.jpg'],
             options: [
               new ChoiceModel({
                 label: 'RAM',
                 type: 'label',
                 allowReselect: true,
                 preselectedChoice: 'large',
                 choices: [
                   {text:  "2K", id: "small"},
                   {text:  "4K", id: "medium"},
                   {text:  "8K", id: "large"},
                 ]
               }),
               new ChoiceModel({
                 label: 'Color',
                 type: 'label',
                 allowReselect: true,
                 preselectedChoice: 'offwhite',
                 choices: [
                   {text:  "Off White", id: "offwhite"},
                   {text:  "Awful White", id: "awfwhite"}
                 ]
               }),
             ]
         });
         model.generateMessage(conversation, message => message.send());
        }.bind(this)
      },
      {
        text: 'Create Receipt Message',
        method: function() {
          const ReceiptModel = Layer.Core.Client.getMessageTypeModelClass('ReceiptModel')
          const LocationModel = Layer.Core.Client.getMessageTypeModelClass('LocationModel')
          const ListModel =   Layer.Core.Client.getMessageTypeModelClass('ListModel')
          const ProductModel =Layer.Core.Client.getMessageTypeModelClass('ProductModel')
          const ImageModel =  Layer.Core.Client.getMessageTypeModelClass('ImageModel')
          const ChoiceModel = Layer.Core.Client.getMessageTypeModelClass('ChoiceModel')

          const model = new ReceiptModel({
            currency: 'USD',
            order: {
              number: 'FRODO-DODO-ONE'
            },
            paymentMethod: 'VISA ****1234',
            summary: {
              subtitle: 'Your Purchase is Complete',
              shippingCost: 350.01,
              totalTax: 0.01,
              totalCost: 350.02
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
                    url: 'http://l7.alamy.com/zooms/e33f19042cbe4ec1807bba7f3720ba62/executive-in-a-strait-jacket-aakafp.jpg',
                    price: 525,
                    quantity: 1,
                    currency: 'USD',
                    brand: 'Prison Garb Inc',
                    name: 'Formal Strait Jacket',
                    description: 'The right choice for special occasions with your crazed inlaws.  This will make you feel like you at last belong.',
                    imageUrls: [ 'http://l7.alamy.com/zooms/e33f19042cbe4ec1807bba7f3720ba62/executive-in-a-strait-jacket-aakafp.jpg' ],
                    options: [
                      new ChoiceModel({
                        label: 'Size',
                        type: 'label',
                        preselectedChoice: 'small',
                        choices: [
                          {text:  'Small', id: 'small'},
                          {text:  'Medium', id: 'medium'},
                          {text:  'Large', id: 'large'},
                        ]
                      }),
                      new ChoiceModel({
                        label: 'Color',
                        type: 'label',
                        preselectedChoice: 'white',
                        choices: [
                          {text:  'White', id: 'white'},
                          {text:  'Black', id: 'black'},
                          {text:  'Gold', id: 'gold'},
                        ]
                      })
                    ]
                }),
                new ProductModel({
                    url: 'http://l7.alamy.com/zooms/e33f19042cbe4ec1807bba7f3720ba62/executive-in-a-strait-jacket-aakafp.jpg',
                    price: 525,
                    quantity: 1,
                    currency: 'USD',
                    brand: 'Prison Garb Inc',
                    name: 'Formal Strait Jacket',
                    description: 'The right choice for special occasions with your crazed inlaws.  This will make you feel like you at last belong.',
                    imageUrls: [ 'http://l7.alamy.com/zooms/e33f19042cbe4ec1807bba7f3720ba62/executive-in-a-strait-jacket-aakafp.jpg' ],
                    options: [
                      new ChoiceModel({
                        label: 'Size',
                        type: 'label',
                        preselectedChoice: '',
                        choices: [
                          {text:  'Small', id: 'small'},
                          {text:  'Medium', id: 'medium'},
                          {text:  'Large', id: 'large'},
                        ]
                      }),
                      new ChoiceModel({
                        label: 'Color',
                        type: 'label',
                        preselectedChoice: 'gold',
                        choices: [
                          {text:  'White', id: 'white'},
                          {text:  'Black', id: 'black'},
                          {text:  'Gold', id: 'gold'},
                        ]
                      })
                    ]
                }),
                new ProductModel({
                  url: 'http://l7.alamy.com/zooms/e33f19042cbe4ec1807bba7f3720ba62/executive-in-a-strait-jacket-aakafp.jpg',
                  price: 525,
                  quantity: 3,
                  currency: 'USD',
                  brand: 'Prison Garb Inc',
                  name: 'Formal Strait Jacket',
                  description: 'The right choice for special occasions with your crazed inlaws.  This will make you feel like you at last belong.',
                  imageUrls: [ 'http://l7.alamy.com/zooms/e33f19042cbe4ec1807bba7f3720ba62/executive-in-a-strait-jacket-aakafp.jpg' ],
                  options: [
                    new ChoiceModel({
                      label: 'Size',
                      type: 'label',
                      preselectedChoice: 'medium',
                      choices: [
                        {text:  'Small', id: 'small'},
                        {text:  'Medium', id: 'medium'},
                        {text:  'Large', id: 'large'},
                      ]
                    }),
                    new ChoiceModel({
                      label: 'Color',
                      type: 'label',
                      choices: [
                        {text:  'White', id: 'white'},
                        {text:  'Black', id: 'black'},
                        {text:  'Gold', id: 'gold'},
                      ]
                    })
                  ]
              })
            ]
          })
          model.generateMessage(conversation, message => message.send());
        }.bind(this),
      },
      {
        text: 'Create Choice Message',
        method: function() {
          const ChoiceModel = Layer.Core.Client.getMessageTypeModelClass('ChoiceModel')
          const model = new ChoiceModel({
            label: 'What is the airspeed velocity of an unladen swallow?',
            responseName: 'airspeedselection',
            choices: [
               {text:  'Zero, it can not get off the ground!', id: 'zero'},
               {text:  'Are we using Imperial or Metric units?', id: 'clever bastard'},
               {text:  'What do you mean? African or European swallow?', id: 'just a smart ass'},
             ],
          });
          model.generateMessage(conversation, message => message.send())
        }.bind(this),
      },
      {
        text: 'Create Carousel Message',
        method: function() {
          const CarouselModel = Layer.Core.Client.getMessageTypeModelClass('CarouselModel');
          const FileModel = Layer.Core.Client.getMessageTypeModelClass('FileModel');

          const model = new CarouselModel({
            items: [
              new FileModel({
                sourceUrl: 'https://raw.githubusercontent.com/layerhq/web-xdk/master/README.md?token=AAPUfjxdAz2WZ_0AcEaMHgD4w8yPi2v7ks5Z8h15wA%3D%3D',
                mimeType: 'text/markdown',
                title: 'Web XDK Readme',
                author: 'layer.com'
              }),
              new FileModel({
                sourceUrl: 'https://raw.githubusercontent.com/layerhq/web-xdk/master/LICENSE?token=AAPUfnbqKuuGEE-LceF93on0O8nSKpdMks5Z8h7AwA%3D%3D',
                mimeType: 'text/plain',
                title: 'Web XDK License',
                author: 'Apache'
              }),
              new FileModel({
                sourceUrl: 'https://raw.githubusercontent.com/layerhq/web-xdk/master/CHANGELOG.md?token=AAPUfnbZwMpC-aul50GSng2SkX-174Rbks5Z8h8VwA%3D%3D',
                mimeType: 'text/markdown',
                title: 'Web XDK Changelog',
                author: 'layer.com'
              })
            ]
          });
          model.generateMessage(conversation, message => message.send());
        }.bind(this),
      },
      {
        text: 'Create Status Message',
        method: function() {
          const StatusModel = Layer.Core.Client.getMessageTypeModelClass('StatusModel');
          const model = new StatusModel({
            text: 'You have just received a status message. This could be something important.'
          });
          model.generateMessage(conversation, message => message.send());
        }.bind(this),
      },
      {
        text: 'Create Feedback Message',
        method: function() {
          const FeedbackModel = Layer.Core.Client.getMessageTypeModelClass('FeedbackModel');
          const model = new FeedbackModel({
            enabledFor: [client.user.id],
          });
          model.generateMessage(conversation, message => message.send());
        }.bind(this),
      }
    ];
  };

  filterMessages(message) {
    return true;// remove this to enable filtering
    const model = layerClient.createMessageTypeModel(message);
    if (model && model instanceof ResponseModel && message.sender === layerClient.user) return false;
    return true;
  }

  onClearConversation() {
    const { actions } = this.props;
    actions.selectConversation(null);
  }


  /**
   * Render the Right Panel which contains the Header, and the Conversation Panel
   */
  render() {
    const {
      editingTitle,
      title,
      composerMessage,
      activeConversation,
      activeConversationId,
      activeConversationState,
      conversations,
      messages,
      actions
    } = this.props;

    const replaceableContent = {
      composerButtonPanelRight: () => {
        return (<div>
          <SendButton />
          <FileUploadButton multiple="true" />
          <MenuButton
          getMenuOptions={this.getMenuOptions.bind(this)}
          />
        </div>);
      },
      /*messageSentRightSide: "<div>Hello World</div>",
      messageSentLeftSide: function() {
        return "<div>Goodbye World</div>";
      }*/
    };

    return (
      <div className='right-panel'>
        <ConversationHeader
          title={title}
          activeConversation={activeConversation}
          editingTitle={editingTitle}
          onClearConversation={this.onClearConversation.bind(this)}
          onEditConversationTitle={actions.editConversationTitle}
          onChangeConversationTitle={actions.changeConversationTitle}
          onSaveConversationTitle={actions.saveConversationTitle}
          onCancelEditConversationTitle={actions.cancelEditConversationTitle}/>
        <ConversationView
          ref='conversationPanel'
          composeText={window.tmptext}
          queryFilter= {this.filterMessages}
          replaceableContent={replaceableContent}
          onRenderListItem={LayerUIUtil.dateSeparator}
          conversationId={activeConversationId}/>
      </div>
    );
  }
}
