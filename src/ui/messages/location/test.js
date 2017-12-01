describe('Location Message Components', function() {
  var LocationModel;
  var conversation;
  var testRoot;
  var styleNode;
  beforeAll(function() {
    styleNode = document.createElement('style');
    styleNode.innerHTML = 'layer-message-viewer > * {width: 300px;}';
    document.body.appendChild(styleNode);
  });

  afterAll(function() {
    document.body.removeChild(styleNode);
  });

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

    client = new Layer.Core.Client({
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

    if (layer.UI.components['layer-conversation-view'] && !layer.UI.components['layer-conversation-view'].classDef) layer.UI.init({});

    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    testRoot.style.display = 'flex';
    testRoot.style.flexDirection = 'column';
    testRoot.style.height = '300px';
    testRoot.style.width = '300px';

    LocationModel = Layer.Core.Client.getMessageTypeModelClass("LocationModel");

    layer.Util.defer.flush();
    jasmine.clock().tick(800);
  });


  afterEach(function() {
    layer.UI.animatedScrollTo = restoreAnimatedScrollTo;
    Layer.Core.Client.removeListenerForNewClient();
  });

  describe("Model Tests", function() {
    it("Should create an appropriate Message with metadata", function() {
      var d = new Date();
      var model = new LocationModel({
        latitude: 37.7734858,
        longitude: -122.3916087,
        heading: 23.45,
        altitude: 35.67,
        title: "Here I am.  Right there on the dot. I'm stuck on the dot.  Please free me.",
        description: "Dot prisoner 455 has attempted to escape.  Send in the puncutation and make a very strong point about dot prisoner escapes",
        accuracy: 0.8,
        createdAt: d,
      });

      model.generateMessage(conversation, function(message) {
        expect(message.parts.length).toEqual(1);
        expect(message.parts[0].mimeType).toEqual(LocationModel.MIMEType);
        expect(JSON.parse(message.parts[0].body)).toEqual({
          latitude: 37.7734858,
          longitude: -122.3916087,
          heading: 23.45,
          altitude: 35.67,
          title: "Here I am.  Right there on the dot. I'm stuck on the dot.  Please free me.",
          description: "Dot prisoner 455 has attempted to escape.  Send in the puncutation and make a very strong point about dot prisoner escapes",
          accuracy: 0.8,
          created_at: d.toISOString(),
        });
      });
    });

    it("Should create an appropriate Message with address", function() {
      var model = new LocationModel({
        street1: "a",
        street2: "b",
        city: "c",
        administrativeArea: "d",
        postalCode: "e",
        country: "f",
        title: "Here I am.  Right there on the dot. I'm stuck on the dot.  Please free me.",
        description: "Dot prisoner 455 has attempted to escape.  Send in the puncutation and make a very strong point about dot prisoner escapes"
      });

      model.generateMessage(conversation, function(message) {
        expect(message.parts.length).toEqual(1);
        expect(message.parts[0].mimeType).toEqual(LocationModel.MIMEType);
        expect(JSON.parse(message.parts[0].body)).toEqual({
          street1: "a",
          street2: "b",
          city: "c",
          administrative_area: "d",
          postal_code: "e",
          country: "f",
          title: "Here I am.  Right there on the dot. I'm stuck on the dot.  Please free me.",
          description: "Dot prisoner 455 has attempted to escape.  Send in the puncutation and make a very strong point about dot prisoner escapes"
        });
      });
    });

    it("Should create an appropriate Message without metadata", function() {
      var model = new LocationModel({
        latitude: 37.7734858,
        longitude: -122.3916087,
      });
      model.generateMessage(conversation, function(message) {
        expect(message.parts.length).toEqual(1);
        expect(message.parts[0].mimeType).toEqual(LocationModel.MIMEType);
        expect(JSON.parse(message.parts[0].body)).toEqual({
          latitude: 37.7734858,
          longitude: -122.3916087,
        });
      });

    });

    it("Should instantiate a Model from a Message with metadata", function() {
      var m = conversation.createMessage({
        parts: [{
          mimeType: LocationModel.MIMEType + '; role=root',
          body: JSON.stringify({
            latitude: 37.7734858,
            longitude: -122.3916087,
            heading: 23.45,
            altitude: 35.67,
            title: "Here I am.  Right there on the dot. I'm stuck on the dot.  Please free me.",
            description: "Dot prisoner 455 has attempted to escape.  Send in the puncutation and make a very strong point about dot prisoner escapes",
            accuracy: 0.8,
          })
        }]
      });
      var m = new LocationModel({
        message: m,
        part: m.parts[0]
      });
      expect(m.latitude).toEqual(37.7734858);
      expect(m.longitude).toEqual(-122.3916087);
      expect(m.altitude).toEqual(35.67);
      expect(m.title).toEqual("Here I am.  Right there on the dot. I'm stuck on the dot.  Please free me.");
      expect(m.description).toEqual("Dot prisoner 455 has attempted to escape.  Send in the puncutation and make a very strong point about dot prisoner escapes");
      expect(m.accuracy).toEqual(0.8);
    });

    it("Should instantiate a Model from a Message without metadata", function() {
      var m = conversation.createMessage({
        parts: [{
          mimeType: LocationModel.MIMEType + '; role=root',
          body: JSON.stringify({
            latitude: 37.7734858,
            longitude: -122.3916087,
          })
        }]
      });
      var m = new LocationModel({
        message: m,
        part: m.parts[0]
      });
      expect(m.latitude).toEqual(37.7734858);
      expect(m.longitude).toEqual(-122.3916087);
      expect(m.altitude).toEqual(null);
      expect(m.title).toEqual("");
      expect(m.description).toEqual("");
      expect(m.accuracy).toEqual(null);
    });

    it("Should respond to Standard Message Container calls for metadata", function() {
      var model1 = new LocationModel({
        latitude: 37.7734858,
        longitude: -122.3916087,
        description: "a",
        title: "b",
      });
      var model2 = new LocationModel({
        street1: "a",
        street2: "b",
        city: "c",
        administrativeArea: "d",
        postalCode: "e",
        country: "f",
      });

      var model3 = new LocationModel({
        title: "z",
        street1: "a",
        street2: "b",
        city: "c",
        administrativeArea: "d",
        postalCode: "e",
        country: "f",
        description: "g",
      });

      expect(model1.getTitle()).toEqual("b");
      expect(model2.getTitle()).toEqual("");
      expect(model3.getTitle()).toEqual("z");

      expect(model1.getDescription()).toEqual("a");
      expect(model2.getDescription()).toEqual("a<br/>b<br/>c d, e");
      expect(model3.getDescription()).toEqual("g");

      expect(model1.getFooter()).toEqual("");
      expect(model2.getFooter()).toEqual("");
      expect(model3.getFooter()).toEqual("");
    });

    it("Should have a suitable one line summary", function() {
      var model1 = new LocationModel({
        latitude: 37.7734858,
        longitude: -122.3916087,
        description: "a",
        title: "b",
      });
      model1.generateMessage(conversation);
      var model2 = new LocationModel({
        latitude: 37.7734858,
        longitude: -122.3916087,
        description: "a",
      });
      model2.generateMessage(conversation);

      expect(model1.getOneLineSummary()).toEqual("b");
      expect(model2.getOneLineSummary()).toEqual("Location sent");
    });
  });

  describe("View Tests", function() {
    var el;
    beforeEach(function() {
      el = document.createElement('layer-message-viewer');
      testRoot.appendChild(el);
    });
    afterEach(function() {
      document.body.removeChild(testRoot);
      Layer.Core.Client.removeListenerForNewClient();
      if (el) el.onDestroy();
    });

    it("Should render its map", function() {
      var model = new LocationModel({
        latitude: 37.7734858,
        longitude: -122.3916087,
      });
      model.generateMessage(conversation, function(m) {
        message = m;
      });
      el.client = client;
      el.message = message;

      layer.Util.defer.flush();

      expect(el.nodes.ui.childNodes.length).toEqual(1);
      expect(el.nodes.ui.firstChild.tagName).toEqual('IMG');
      expect(el.nodes.ui.firstChild.src).toEqual('http://maps.googleapis.com/maps/api/staticmap?size=300x300&language=en-US&key=undefined&zoom=16&markers=37.7734858,-122.3916087');
   });

    it("Should show the top content based on the hideMap property", function() {
      var model = new LocationModel({
        latitude: 37.7734858,
        longitude: -122.3916087,
      });
      model.generateMessage(conversation, function(m) {
        message = m;
      });
      el.client = client;
      el.message = message;

      layer.Util.defer.flush();

      el.nodes.ui.hideMap = false;
      expect(el.nodes.cardContainer.classList.contains('layer-no-core-ui')).toEqual(false);
      expect(el.nodes.cardContainer.classList.contains('layer-arrow-next-container')).toEqual(false);
    });

    it("Should hide the top content based on the hideMap property", function() {
      var model = new LocationModel({
        latitude: 37.7734858,
        longitude: -122.3916087,
      });
      model.generateMessage(conversation, function(m) {
        message = m;
      });
      el.client = client;
      el.message = message;
      layer.Util.defer.flush();

      el.nodes.ui.hideMap = true;
      expect(el.nodes.ui.classList.contains('layer-location-message-view-address-only')).toEqual(true);
      expect(el.nodes.cardContainer.classList.contains('layer-no-core-ui')).toEqual(true);
      expect(el.nodes.cardContainer.classList.contains('layer-arrow-next-container')).toEqual(true);
    });

    it("Should open the map using lat/lon", function() {
      spyOn(el, "showFullScreen");

      var model = new LocationModel({
        latitude: 37.7734858,
        longitude: -122.3916087,
      });
      model.generateMessage(conversation, function(m) {
        message = m;
      });
      el.client = client;
      el.message = message;
      layer.Util.defer.flush();

      expect(model.actionEvent).toEqual('open-map');

      el._runAction({});
      expect(el.showFullScreen).toHaveBeenCalledWith('https://www.google.com/maps/search/?api=1&query=37.7734858,-122.3916087&zoom=16');

    });

    it("Should open the map using address", function() {
      spyOn(el, "showFullScreen");

      var model = new LocationModel({
        street1: "a",
        street2: "b",
        city: "c",
        administrative_area: "d",
        postal_code: "e",
        country: "f",
      });
      model.generateMessage(conversation, function(m) {
        message = m;
      });
      el.client = client;
      el.message = message;
      layer.Util.defer.flush();

      expect(model.actionEvent).toEqual('open-map');

      var url = Layer.UI.messageActionHandlers['open-map'].call(el, {});
      var expectedUrl = 'http://www.google.com/maps/?q=';
      expectedUrl += escape(model.street1 + (model.street2 ? ' ' + model.street2 : '') + ' ' + `${model.city} ${model.administrativeArea}, ${model.postalCode} ${model.country}`);

      el._runAction({});
      expect(el.showFullScreen).toHaveBeenCalledWith(expectedUrl);
    });
  });
});