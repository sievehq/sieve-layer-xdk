describe('Product Message Components', function() {
  var ProductModel, ChoiceModel;
  var conversation;
  var testRoot;
  var client;

  beforeEach(function() {
    jasmine.clock().install();
    restoreAnimatedScrollTo = Layer.UI.UIUtils.animatedScrollTo;
    spyOn(Layer.UI.UIUtils, "animatedScrollTo").and.callFake(function(node, position, duration, callback) {
      var timeoutId = setTimeout(function() {
        node.scrollTop = position;
        if (callback) callback();
      }, duration);
      return function() {
        clearTimeout(timeoutId);
      };
    });

    client = new Layer.init({
      appId: 'layer:///apps/staging/Fred'
    });
    client.user = new Layer.Core.Identity({
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

    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    testRoot.style.display = 'flex';
    testRoot.style.flexDirection = 'column';
    testRoot.style.height = '300px';

    ProductModel = Layer.Core.Client.getMessageTypeModelClass("ProductModel");
    ChoiceModel = Layer.Core.Client.getMessageTypeModelClass("ChoiceModel");

    Layer.Utils.defer.flush();
    jasmine.clock().tick(800);
    jasmine.clock().uninstall();
  });


  afterEach(function() {
    Layer.UI.UIUtils.animatedScrollTo = restoreAnimatedScrollTo;
    Layer.Core.Client.removeListenerForNewClient();
  });

  describe("Model Tests", function() {
    it("Should create an appropriate Message", function() {
      var model = new ProductModel({
        name: "a",
        brand: "b",
        imageUrls: ["c", "d"],
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
      });
      model.generateMessage(conversation, function(m) {
        message = m;
      });
      expect(message.parts.length).toEqual(3);
      expect(message.parts[0].mimeType).toEqual(ProductModel.MIMEType);
      expect(JSON.parse(message.parts[0].body)).toEqual({
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
      });

      expect(message.parts[1].mimeType).toEqual(ChoiceModel.MIMEType);
      expect(JSON.parse(message.parts[1].body)).toEqual({
        choices: [{text: "c-one", id: "c1"}, {text: "c-two", id: "c2"}]
      });

      expect(message.parts[2].mimeType).toEqual(ChoiceModel.MIMEType);
      expect(JSON.parse(message.parts[2].body)).toEqual({
        choices: [{text: "d-one", id: "d1"}, {text: "d-two", id: "d2"}]
      });
    });

    it("Should instantiate a Model from a Message ", function() {
      var uuid1 = Layer.Utils.generateUUID();
      var uuid2 = Layer.Utils.generateUUID();
      var uuid3 = Layer.Utils.generateUUID();
      var uuid4 = Layer.Utils.generateUUID();
      var m = conversation.createMessage({
        id: 'layer:///messages/' + uuid1,
        parts: [{
          id: 'layer:///messages/' + uuid1 + '/parts/' + uuid2,
          mime_type: ProductModel.MIMEType + '; role=root; node-id=a',
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
          id: 'layer:///messages/' + uuid1 + '/parts/' + uuid3,
          mime_type:  ChoiceModel.MIMEType + "; role=options; parent-node-id=a",
          body: JSON.stringify({
            choices: [{text: "c-one", id: "c1"}, {text: "c-two", id: "c2"}]
          })
        }, {
          id: 'layer:///messages/' + uuid1 + '/parts/' + uuid4,
          mime_type:  ChoiceModel.MIMEType + "; role=options; parent-node-id=a",
          body: JSON.stringify({
            choices: [{text: "d-one", id: "d1"}, {text: "d-two", id: "d2"}]
          })
        }]
      });
      var m = new ProductModel({
        message: m,
        part: m.parts[0]
      });

      expect(m.name).toEqual("a");
      expect(m.brand).toEqual("b");
      expect(m.imageUrls).toEqual(["c", "d"]);
      expect(m.description).toEqual("e");
      expect(m.currency).toEqual("doh");
      expect(m.price).toEqual("f");
      expect(m.quantity).toEqual(3);
      expect(m.url).toEqual("https://layer.com/about");
      expect(m.actionEvent).toEqual("open-product");

      expect(m.options[0].choices).toEqual([
        jasmine.objectContaining({text: "c-one", id: "c1"}),
        jasmine.objectContaining({text: "c-two", id: "c2"})]);
      expect(m.options[1].choices).toEqual([
        jasmine.objectContaining({text: "d-one", id: "d1"}),
        jasmine.objectContaining({text: "d-two", id: "d2"})]);
    });

  });

  describe("View Tests", function() {
    var el, message;
    beforeEach(function() {
      el = document.createElement('layer-message-viewer');
      testRoot.appendChild(el);
    });
    afterEach(function() {
      document.body.removeChild(testRoot);
      Layer.Core.Client.removeListenerForNewClient();
      if (el) el.onDestroy();
    });

    it("Should render some properties directly", function() {
      var model = new ProductModel({
        name: "a",
        brand: "b",
        imageUrls: ["https://layer.com/about/c", "https://layer.com/about/d"],
        description: "e",
        options: [
          new ChoiceModel({type: "Label", choices: [{text: "c-one", id: "c1"}, {text: "c-two", id: "c2"}]}),
          new ChoiceModel({type: "Label", choices: [{text: "d-one", id: "d1"}, {text: "d-two", id: "d2"}]})
        ],
        currency: "EUR",
        price: 33,
        quantity: 3,
        url: "https://layer.com/about",
        action: {
          event: "open-product"
        }
      });

      model.generateMessage(conversation, function(m) {
        message = m;
      });
      el.client = client;
      el.message = message;

      Layer.Utils.defer.flush();

      // Message Viewer: gets the layer-card-width-full-width class
      expect(el.classList.contains('layer-card-width-full-width')).toBe(true);

      // Message UI: contains simple properties
      expect(el.nodes.ui.nodes.name.innerText.trim()).toEqual("a");
      expect(el.nodes.ui.nodes.brand.innerText.trim()).toEqual("b");
      expect(el.nodes.ui.nodes.price.innerText.trim()).toEqual("€33.00");
      expect(el.nodes.ui.nodes.description.innerText.trim()).toEqual("e");
      expect(el.nodes.ui.nodes.image.src).toEqual("https://layer.com/about/c");

      expect(el.nodes.ui.classList.contains("layer-no-image")).toBe(false);
    });

    it("Should render options", function() {
      var model = new ProductModel({
        name: "a",
        brand: "b",
        imageUrls: ["c", "d"],
        description: "e",
        options: [
          new ChoiceModel({type: "Label", choices: [{text: "c-one", id: "c1"}, {text: "c-two", id: "c2"}]}),
          new ChoiceModel({type: "Label", choices: [{text: "d-one", id: "d1"}, {text: "d-two", id: "d2"}]})
        ],
        currency: "doh",
        price: "f",
        quantity: 3,
        url: "https://layer.com/about",
        action: {
          event: "open-product"
        }
      });

      model.generateMessage(conversation, function(m) {
        message = m;
      });
      el.client = client;
      el.message = message;

      Layer.Utils.defer.flush();
      expect(el.nodes.ui.nodes.choices.childNodes.length).toEqual(2);
      expect(el.nodes.ui.nodes.choices.childNodes[0].model).toBe(model.options[0]);
      expect(el.nodes.ui.nodes.choices.childNodes[1].model).toBe(model.options[1]);
      expect(el.nodes.ui.nodes.choices.childNodes[0].tagName).toEqual("LAYER-MESSAGE-VIEWER");
      expect(el.nodes.ui.nodes.choices.childNodes[1].tagName).toEqual("LAYER-MESSAGE-VIEWER");
      expect(el.nodes.ui.nodes.choices.childNodes[0].nodes.ui.tagName).toEqual("LAYER-CHOICE-LABEL-MESSAGE-VIEW");
    });
  });
});
