describe('Receipt Message Components', function() {
  var ReceiptModel, ProductModel, ChoiceModel, LocationModel;
  var conversation;
  var testRoot;

  beforeEach(function() {
    jasmine.clock().install();
    restoreAnimatedScrollTo = layer.UI.animatedScrollTo;
    spyOn(layer.UI, "animatedScrollTo").and.callFake(function(node, position, duration, callback) {
      var timeoutId = setTimeout(function() {
        node.scrollTop = position;
        if (callback) callback();
      }, duration);
      return function() {
        clearTimeout(timeoutId);
      };
    });

    client = new layer.Core.Client({
      appId: 'layer:///apps/staging/Fred'
    });
    client.user = new layer.Core.Identity({
      client: client,
      userId: 'FrodoTheDodo',
      displayName: 'Frodo the Dodo',
      id: 'layer:///identities/FrodoTheDodo',
      isFullIdentity: true,
      sessionOwner: true
    });
    client._clientAuthenticated();
    conversation = client.createConversation({
      participants: ['layer:///identities/FrodoTheDodo', 'layer:///identities/SaurumanTheMildlyAged']
    });

    if (layer.UI.components['layer-conversation-view'] && !layer.UI.components['layer-conversation-view'].classDef) layer.UI.init({});

    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    testRoot.style.display = 'flex';
    testRoot.style.flexDirection = 'column';
    testRoot.style.height = '300px';

    ReceiptModel = layer.Core.Client.getMessageTypeModelClass("ReceiptModel");
    ProductModel = layer.Core.Client.getMessageTypeModelClass("ProductModel");
    ChoiceModel = layer.Core.Client.getMessageTypeModelClass("ChoiceModel");
    LocationModel = layer.Core.Client.getMessageTypeModelClass("LocationModel");

    layer.Util.defer.flush();
    jasmine.clock().tick(800);
    jasmine.clock().uninstall();
  });


  afterEach(function() {
    layer.UI.animatedScrollTo = restoreAnimatedScrollTo;
    layer.Core.Client.removeListenerForNewClient();
  });

  describe("Model Tests", function() {
    it("Should create an appropriate Message", function() {
      var model = new ReceiptModel({
        createdAt: new Date("10/10/2010").toISOString(),
        currency: "EUR",
        discounts: {
          hey: 'ho'
        },
        paymentMethod: "VISA-INVALID",
        order: {
          number: 'FRODO-DODO-ONE'
        },
        summary: {
          subtitle: 'Your Purchase is Complete',
          shippingCost: 350.01,
          totalTax: 0.01,
          totalCost: 350.02
        },
        shippingAddress: new LocationModel({
          title: "Shipping Address",
          city: 'San Francisco',
          postalCode: '94107',
          administrativeArea: 'CA',
          street1: '655 4th st'
        }),
        billingAddress:  new LocationModel({
          title: "Billing Address",
          city: 'San Francisco',
          postalCode: '94107',
          administrativeArea: 'CA',
          street1: '655 4th st'
        }),
        items: [
          new ProductModel({
            name: "a",
            brand: "b",
            imageUrls: ["https://layer.com/about/c"],
            description: "e",
            options: [
              new ChoiceModel({choices: [{text: "c-one", id: "c1"}, {text: "c-two", id: "c2"}]}),
              new ChoiceModel({choices: [{text: "d-one", id: "d1"}, {text: "d-two", id: "d2"}]})
            ],
            currency: "doh",
            price: "f",
            quantity: 3,
            url: "https://layer.com/about",
            action: {
              event: "open-product"
            }
          })
        ]
      });

      model.generateMessage(conversation, function(m) {
        message = m;
      });
      expect(message.parts.length).toEqual(6);
      expect(message.parts[0].mimeType).toEqual(ReceiptModel.MIMEType);
      expect(JSON.parse(message.parts[0].body)).toEqual({
        created_at: new Date("10/10/2010").toISOString(),
        currency: "EUR",
        discounts: {
          hey: 'ho'
        },
        payment_method: "VISA-INVALID",
        order: {
          number: 'FRODO-DODO-ONE'
        },
        summary: {
          subtitle: 'Your Purchase is Complete',
          shipping_cost: 350.01,
          total_tax: 0.01,
          total_cost: 350.02
        },
      });

      expect(message.parts[1].mimeType).toEqual(ProductModel.MIMEType);
      expect(JSON.parse(message.parts[1].body).name).toEqual("a");

      expect(message.parts[2].mimeType).toEqual(ChoiceModel.MIMEType);
      expect(JSON.parse(message.parts[2].body)).toEqual({
        choices: [{text: "c-one", id: "c1"}, {text: "c-two", id: "c2"}]
      });

      expect(message.parts[3].mimeType).toEqual(ChoiceModel.MIMEType);
      expect(JSON.parse(message.parts[3].body)).toEqual({
        choices: [{text: "d-one", id: "d1"}, {text: "d-two", id: "d2"}]
      });

      expect(message.parts[4].mimeType).toEqual(LocationModel.MIMEType);
      expect(JSON.parse(message.parts[4].body).title).toEqual("Shipping Address");

      expect(message.parts[5].mimeType).toEqual(LocationModel.MIMEType);
      expect(JSON.parse(message.parts[5].body).title).toEqual("Billing Address");
    });

    it("Should instantiate a Model from a Message ", function() {
      var uuid1 = layer.Util.generateUUID();
      var uuid2 = layer.Util.generateUUID();
      var uuid3 = layer.Util.generateUUID();
      var uuid4 = layer.Util.generateUUID();
      var uuid5 = layer.Util.generateUUID();
      var uuid6 = layer.Util.generateUUID();
      var uuid7 = layer.Util.generateUUID();
      var m = conversation.createMessage({
        id: 'layer:///messages/' + uuid1,
        parts: [
          {
            id: 'layer:///messages/' + uuid1 + '/parts/' + uuid2,
            mime_type: ReceiptModel.MIMEType + '; role=root; node-id=r',
            body: JSON.stringify({
              created_at: new Date("10/10/2010").toISOString(),
              currency: "EUR",
              discounts: {
                hey: 'ho'
              },
              payment_method: "VISA-INVALID",
              order: {
                number: 'FRODO-DODO-ONE'
              },
              summary: {
                subtitle: 'Your Purchase is Complete',
                shipping_cost: 350.01,
                total_tax: 0.01,
                total_cost: 350.02
              }
            })
          },
          {
            id: 'layer:///messages/' + uuid1 + '/parts/' + uuid3,
            mime_type: ReceiptModel.MIMEType + '; role=shipping-address; parent-node-id=r',
            body: JSON.stringify({
              title: "Shipping Address",
              city: 'San Francisco',
              postalCode: '94107',
              administrative_area: 'CA',
              street1: '655 4th st'
            })
          },
          {
            id: 'layer:///messages/' + uuid1 + '/parts/' + uuid4,
            mime_type: ReceiptModel.MIMEType + '; role=billing-address; parent-node-id=r',
            body: JSON.stringify({
              title: "Billing Address",
              city: 'San Francisco',
              postalCode: '94107',
              administrative_area: 'CA',
              street1: '655 4th st'
            })
          },
          {
          id: 'layer:///messages/' + uuid1 + '/parts/' + uuid5,
          mime_type: ProductModel.MIMEType + '; role=product-items; node-id=a; parent-node-id=r',
          body: JSON.stringify({
            name: "a",
            brand: "b",
            image_urls: ["c", "d"],
            description: "e",
            currency: "doh",
            price: "f",
            quantity: 3,
            url: "https://layer.com/about",
            action: {
              event: "open-product"
            }
          })
        }, {
          id: 'layer:///messages/' + uuid1 + '/parts/' + uuid6,
          mime_type:  LocationModel.MIMEType + "; role=options; parent-node-id=a",
          body: JSON.stringify({
            choices: [{text: "c-one", id: "c1"}, {text: "c-two", id: "c2"}]
          })
        }, {
          id: 'layer:///messages/' + uuid1 + '/parts/' + uuid7,
          mime_type:  LocationModel.MIMEType + "; role=options; parent-node-id=a",
          body: JSON.stringify({
            choices: [{text: "d-one", id: "d1"}, {text: "d-two", id: "d2"}]
          })
        }]
      });
      var m = new ReceiptModel({
        message: m,
        part: m.parts[0]
      });

      expect(m.createdAt).toEqual(new Date("10/10/2010"));
      expect(m.currency).toEqual("EUR");
      expect(m.discounts).toEqual({
        hey: 'ho'
      });
      expect(m.paymentMethod).toEqual("VISA-INVALID");
      expect(m.order).toEqual({
        number: 'FRODO-DODO-ONE'
      });
      expect(m.summary).toEqual({
        subtitle: 'Your Purchase is Complete',
        shippingCost: 350.01,
        totalTax: 0.01,
        totalCost: 350.02
      });
      expect(m.shippingAddress.title).toEqual("Shipping Address");
      expect(m.billingAddress.title).toEqual("Billing Address");
      expect(m.items[0].name).toEqual("a");
      expect(m.items[0].options[0].choices).toEqual([{text: "c-one", id: "c1"}, {text: "c-two", id: "c2"}]);
      expect(m.items[0].options[1].choices).toEqual([{text: "d-one", id: "d1"}, {text: "d-two", id: "d2"}]);
    });

  });

  describe("View Tests", function() {
    var el, message, model;
    beforeEach(function() {
      el = document.createElement('layer-message-viewer');
      testRoot.appendChild(el);

      model = new ReceiptModel({
        createdAt: new Date("10/10/2010").toISOString(),
        currency: "EUR",
        discounts: {
          hey: 'ho'
        },
        paymentMethod: "VISA-INVALID",
        order: {
          number: 'FRODO-DODO-ONE'
        },
        summary: {
          subtitle: 'Your Purchase is Complete',
          shippingCost: 350.01,
          totalTax: 0.01,
          totalCost: 350.02
        },
        shippingAddress: new LocationModel({
          title: "Shipping Address",
          city: 'San Francisco',
          postalCode: '94107',
          administrativeArea: 'CA',
          street1: '655 4th st'
        }),
        billingAddress:  new LocationModel({
          title: "Billing Address",
          city: 'San Francisco',
          postalCode: '94107',
          administrativeArea: 'CA',
          street1: '655 4th st'
        }),
        items: [
          new ProductModel({
            name: "a",
            brand: "b",
            imageUrls: ["https://layer.com/about/c"],
            description: "e",
            options: [
              new ChoiceModel({choices: [{text: "c-one", id: "c1"}, {text: "c-two", id: "c2"}]}),
              new ChoiceModel({choices: [{text: "d-one", id: "d1"}, {text: "d-two", id: "d2"}]})
            ],
            currency: "doh",
            price: "f",
            quantity: 3,
            url: "https://layer.com/about",
            action: {
              event: "open-product"
            }
          })
        ]
      });

      model.generateMessage(conversation, function(m) {
        message = m;
      });

      el.client = client;
      el.message = message;

      layer.Util.defer.flush();
    });
    afterEach(function() {
      document.body.removeChild(testRoot);
      layer.Core.Client.removeListenerForNewClient();
      if (el) el.onDestroy();
    });

    it("Should render some properties directly", function() {

      // Message Viewer: gets the layer-card-width-full-width class
      expect(el.classList.contains('layer-card-width-full-width')).toBe(true);

      // Message UI: contains simple properties
      expect(el.nodes.ui.nodes.products.childNodes[0].item).toBe(model.items[0]);
      expect(el.nodes.ui.nodes.products.childNodes[0].nodes.name.innerHTML).toEqual("a");
      expect(el.nodes.ui.nodes.paidWith.innerHTML).toEqual(model.paymentMethod);
      expect(el.nodes.ui.nodes.total.innerHTML).toEqual("€350.02");
    });
  });
});
