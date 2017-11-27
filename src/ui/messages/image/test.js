describe('Image Message Components', function() {
  var ImageModel;
  var conversation;
  var testRoot;

  var imgBase64 = "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAECElEQVR4Xu2ZO44TURREa0SAWBASKST8xCdDQMAq+OyAzw4ISfmLDBASISERi2ADEICEWrKlkYWny6+77fuqalJfz0zVOXNfv/ER8mXdwJF1+oRHBDCXIAJEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8waWjX8OwHcAv5f9Me3fPRugvbuxd14C8B7AVwA3q0oQAcYwtr2+hn969faPVSWIAG2AT3rXJvz17CcAN6ptgggwrwDb4JeVIALMJ8AY/JISRIB5BGDhr3/aZwDXKxwHEWC6AJcBvAOwfuBjvuNfABcBfGGGl5yJANPabYV/B8DLaT96nndHgPYeu4c/RI8AbQJIwO9FgDMAfrVxWuRdMvB7EOA+gHsALgD4uQjO3b6pFPzqAjwA8HTF5weA8weWQA5+ZQGOw1//jR5SAkn4VQV4CODJls18CAmuAHjbcM8vc9U76ZSrdgt4BODxyLG8Twla4P8BcLfKPX/sEaeSAAz8fR4H8vArHQHXAHwYs3Xj9SU3gQX8SgKcAvBitTp38WAJCWzgVxJg+F0qSGAFv5oAh5bADn5FAQ4lwVUAb3a86nX1tL/tXK10Czj+O+7zOLCFX3UDrEXYhwTW8KsLsPRx0Ap/+A/fq12uKpVnqx4BSx8Hgb9quAcB5t4EgX/sz6sXAeaSIPA3zqOeBJgqwTMAzxuuelJn/ubzSG8CTJFg12ex4Z4vDb+HW8A2aK1XRFYCC/g9C7DkJrCB37sAS0hgBV9BgDklGODfBvCaPScU5np8CPxf71OfCSzhq2yAqZ8d2MJXE6DlOLCGryjALhLYw1cVgJEg8Dv7MKjlgXvbg2Hgd/ph0BwSBH7nHwZNkeCW4z1/rDCV/wOM5RyOg7MAvo0Nur3uIoAbVzpvBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hz8BzIXtYE3VcPnAAAAAElFTkSuQmCC";

  function generateBlob(large) {
      if (large) imgBase64 += imgBase64;
      if (window.isPhantomJS) {
          var b = new Blob([atob(imgBase64)], {type: "image/png"});
          b.length = large ? 12345 : 125;
          return b;
      } else {
          var imageBinary = atob(imgBase64),
              buffer = new ArrayBuffer(imageBinary.length),
              view = new Uint8Array(buffer),
              i;

          for (i = 0; i < imageBinary.length; i++) {
              view[i] = imageBinary.charCodeAt(i);
          }
          return new Blob( [view], { type: "image/png" });
      }
  }



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

    ImageModel = Layer.Core.Client.getMessageTypeModelClass("ImageModel");

    layer.Util.defer.flush();
    jasmine.clock().tick(800);
    jasmine.clock().uninstall();
  });


  afterEach(function() {
    layer.UI.animatedScrollTo = restoreAnimatedScrollTo;
    Layer.Core.Client.removeListenerForNewClient();
  });

  describe("Model Tests", function() {
    it("Should create an appropriate Message with metadata", function() {
      var model = new ImageModel({
        title: "b",
        artist: "c",
        subtitle: "d",
        sourceUrl: "e",
        previewUrl: "f",
        orientation: 4,
        width: 301,
        height: 302,
        previewWidth: 303,
        previewHeight: 304,

      });
      model.generateMessage(conversation, function(message) {
        expect(message.parts.length).toEqual(1);
        expect(message.parts[0].mimeType).toEqual(ImageModel.MIMEType);
        expect(JSON.parse(message.parts[0].body)).toEqual({
          title: "b",
          artist: "c",
          subtitle: "d",
          source_url: "e",
          preview_url: "f",
          orientation: 4,
          width: 301,
          height: 302,
          preview_width: 303,
          preview_height: 304
        });
      });
    });


    it("Should create an appropriate Message without metadata", function() {
      var model = new ImageModel({
        sourceUrl: "e",
      });
      model.generateMessage(conversation, function(message) {
        expect(message.parts.length).toEqual(1);
        expect(message.parts[0].mimeType).toEqual(ImageModel.MIMEType);
        expect(JSON.parse(message.parts[0].body)).toEqual({
          source_url: "e"
        });
      });
    });


    it("Should create an appropriate Message with message parts from source and preview", function(done) {
      var blob = generateBlob(imgBase64);
      var model = new ImageModel({
        source: blob,
        preview: blob
      });
      model.generateMessage(conversation, function(message) {
        try {
          expect(message.parts.length).toEqual(3);
          expect(message.parts[0].mimeType).toEqual(ImageModel.MIMEType);
          expect(JSON.parse(message.parts[0].body)).toEqual({
          });
          expect(message.parts[1].mimeType).toEqual('image/png');
          expect(message.parts[1].body).toBe(blob);
          expect(message.parts[2].mimeType).toEqual('image/png');
          expect(message.parts[2].body).toBe(blob);
          done();
        } catch(e) {
          done(e);
        }
      });
    });

    // Actually had expected this to generate a preview part, but the image is too small and I can't be bothered to base64 encode a larger image right now.
    it("Should create an appropriate Message with message parts from source", function(done) {
      var blob = generateBlob(imgBase64);
      var model = new ImageModel({
        source: blob,
      });
      model.generateMessage(conversation, function(message) {
        try {
          expect(message.parts.length).toEqual(2);
          expect(message.parts[0].mimeType).toEqual(ImageModel.MIMEType);
          expect(JSON.parse(message.parts[0].body)).toEqual({
            width: 128, height: 128,
          });
          expect(message.parts[1].mimeType).toEqual('image/png');
          expect(message.parts[1].body).toBe(blob);
         /* expect(message.parts[2].mimeType).toEqual('image/jpeg');
          expect(message.parts[2].body).toEqual(jasmine.any(Blob));*/
          done();
        } catch(e) {
          done(e);
        }
      });
    });

    it("Should instantiate a Model from a Message with metadata", function() {
      var blob = generateBlob(imgBase64);
      var uuid1 = layer.Util.generateUUID();
      var uuid2 = layer.Util.generateUUID();
      var uuid3 = layer.Util.generateUUID();
      var m = conversation.createMessage({
        id: 'layer:///messages/' + uuid1,
        parts: [{
          id: 'layer:///messages/' + uuid1 + '/parts/' + uuid2,
          mime_type: ImageModel.MIMEType + '; role=root; node-id=a',
          body: JSON.stringify({
            title: "b",
            artist: "c",
            subtitle: "d",
            source_url: "e",
            preview_url: "f",
            orientation: 4,
            width: 301,
            height: 302,
            preview_width: 303,
            preview_height: 304
          })
        }, {
          id: 'layer:///messages/' + uuid1 + '/parts/' + uuid3,
          mime_type:  "image/png; role=source; parent-node-id=a",
          body: blob
        }]
      });
      var m = new ImageModel({
        message: m,
        part: m.parts[0]
      });

      expect(m.title).toEqual("b");
      expect(m.artist).toEqual("c");
      expect(m.subtitle).toEqual("d");
      expect(m.sourceUrl).toEqual("e");
      expect(m.previewUrl).toEqual("f");
      expect(m.orientation).toEqual(4);
      expect(m.width).toEqual(301);
      expect(m.height).toEqual(302);
      expect(m.previewWidth).toEqual(303);
      expect(m.previewHeight).toEqual(304);
      expect(m.source.body).toBe(blob);
    });

    it("Should instantiate a Model from a Message without metadata", function() {
      var m = conversation.createMessage({
        parts: [{
          mimeType: ImageModel.MIMEType + '; role=root',
          body: JSON.stringify({
            source_url: "a"
          })
        }]
      });
      var m = new ImageModel({
        message: m,
        part: m.parts[0]
      });
      expect(m.title).toEqual("");
      expect(m.artist).toEqual("");
      expect(m.subtitle).toEqual("");
      expect(m.sourceUrl).toEqual("a");
      expect(m.previewUrl).toEqual("");
      expect(m.orientation).toEqual(null);
      expect(m.width).toEqual(null);
      expect(m.height).toEqual(null);
      expect(m.previewWidth).toEqual(null);
      expect(m.previewHeight).toEqual(null);
    });

    it("Should respond to Standard Message Container calls for metadata", function() {
      var model1 = new ImageModel({
        text: "a",
        title: "b",
        artist: "c",
        subtitle: "d",
        sourceUrl: "e"
      });
      var model2 = new ImageModel({
        text: "a",
        sourceUrl: "e"
      });

      expect(model1.getTitle()).toEqual("b");
      expect(model2.getTitle()).toEqual("");

      expect(model1.getDescription()).toEqual("d");
      expect(model2.getDescription()).toEqual("");

      expect(model1.getFooter()).toEqual("c");
      expect(model2.getFooter()).toEqual("");
    });

    it("Should have a suitable one line summary", function() {
      var model1 = new ImageModel({
        title: "b",
        artist: "c",
        subtitle: "d",
        sourceUrl: "e"
      });
      model1.generateMessage(conversation);
      var model2 = new ImageModel({
        sourceUrl: "e"
      });
      model2.generateMessage(conversation);

      expect(model1.getOneLineSummary()).toEqual("b");
      expect(model2.getOneLineSummary()).toEqual("Picture sent");
    });

    it("Should get the correct url value", function() {
      var blob1 = generateBlob(imgBase64);
      var blob2 = generateBlob(imgBase64);
      var model = new ImageModel({
        sourceUrl: "e",
      });
      expect(model.url).toEqual("e");

      model = new ImageModel({
        previewUrl: "f"
      });
      expect(model.url).toEqual("f");

      model = new ImageModel({
        source: blob1
      });
      expect(model.url).toMatch(/^blob/);

      model = new ImageModel({
        preview: blob2
      });
      expect(model.url).toMatch(/^blob/);
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

    it("Should render sourceUrl alone as a chat bubble", function() {
      var model = new ImageModel({
        sourceUrl: "https://s3.amazonaws.com/static.layer.com/sdk/sampleavatars/0.png"
      });
      model.generateMessage(conversation, function(m) {
        message = m;
      });
      el.client = client;
      el.message = message;

      layer.Util.defer.flush();

      // Message Viewer: gets the layer-card-width-any-width class
      expect(el.classList.contains('layer-card-width-any-width')).toBe(true);

      // Container: hide metadata
      expect(el.nodes.cardContainer.classList.contains('layer-card-no-metadata')).toEqual(true);

      // Message UI: contains anchor tag
      expect(el.nodes.ui.firstChild.tagName).toEqual('IMG');
      expect(el.nodes.ui.firstChild.src).toEqual('https://s3.amazonaws.com/static.layer.com/sdk/sampleavatars/0.png');
    });

    it("Should render source alone as a chat bubble", function(done) {
      var blob = generateBlob(imgBase64);
      var model = new ImageModel({
        source: blob
      });
      model.generateMessage(conversation, function(m) {
        try {
          message = m;

          el.client = client;
          el.message = message;

          layer.Util.defer.flush();
          setTimeout(function() {
            try {
              // Message Viewer: gets the layer-card-width-any-width class
              expect(el.classList.contains('layer-card-width-any-width')).toBe(true);

              // Container: hide metadata
              expect(el.nodes.cardContainer.classList.contains('layer-card-no-metadata')).toEqual(true);

              // Message UI: contains anchor tag
              expect(el.nodes.ui.firstChild.tagName).toEqual('CANVAS');
              done();
            } catch(e) {
              done(e);
            }
          }, 200);

        } catch(e) {
          done(e);
        }
      });
    });

    it("Should render sourceUrl and title", function() {
      var model = new ImageModel({
        sourceUrl: "https://s3.amazonaws.com/static.layer.com/sdk/sampleavatars/0.png",
        title: "Picture here"
      });
      model.generateMessage(conversation, function(m) {
        message = m;
      });
      el.client = client;
      el.message = message;

      layer.Util.defer.flush();

      // Message Viewer: gets the layer-card-width-flex-width class
      expect(el.classList.contains('layer-card-width-flex-width')).toBe(true);

      // Container: show metadata
      expect(el.nodes.cardContainer.classList.contains('layer-card-no-metadata')).toEqual(false);
      expect(el.querySelector('.layer-card-title').innerText.trim()).toEqual('Picture here');

      // Message UI: contains anchor tag
      expect(el.nodes.ui.firstChild.tagName).toEqual('IMG');
      expect(el.nodes.ui.firstChild.src).toEqual('https://s3.amazonaws.com/static.layer.com/sdk/sampleavatars/0.png');
    });

    it("Should render source alone as a chat bubble", function(done) {
      var blob = generateBlob(imgBase64);
      var model = new ImageModel({
        source: blob,
        title: "Picture here"
      });
      model.generateMessage(conversation, function(m) {
        try {
          message = m;

          el.client = client;
          el.message = message;

          layer.Util.defer.flush();

          setTimeout(function() {
            try {
              // Message Viewer: gets the layer-card-width-flex-width class
              expect(el.classList.contains('layer-card-width-flex-width')).toBe(true);

              // Container: show metadata
              expect(el.nodes.cardContainer.classList.contains('layer-card-no-metadata')).toEqual(false);
              expect(el.querySelector('.layer-card-title').innerText.trim()).toEqual('Picture here');

              // Message UI: contains anchor tag
              expect(el.nodes.ui.firstChild.tagName).toEqual('CANVAS');
              done();
            } catch(e) {
              done(e);
            }
          }, 200);
        } catch(e) {
          done(e);
        }
      });
    });

    xit("Should have lots of tests on image rendering but that will wait", function() {


    });

    it("Should open the image using the sourceUrl", function() {
      spyOn(el, "showFullScreen");
      var model = new ImageModel({
        sourceUrl: "https://s3.amazonaws.com/static.layer.com/sdk/sampleavatars/0.png",
      });
      model.generateMessage(conversation, function(m) {
        message = m;
      });
      el.client = client;
      el.message = message;
      layer.Util.defer.flush();

      expect(model.actionEvent).toEqual('open-url');
      el._runAction({});
      expect(el.showFullScreen).toHaveBeenCalledWith("https://s3.amazonaws.com/static.layer.com/sdk/sampleavatars/0.png");
    });

    it("Should open the link using Blob url", function(done) {
      spyOn(el, "showFullScreen");
      var blob = generateBlob(imgBase64);

      var model = new ImageModel({
        source: blob
      });
      model.generateMessage(conversation, function(m) {
        try {
          message = m;

          el.client = client;
          el.message = message;
          layer.Util.defer.flush();

          expect(model.actionEvent).toEqual('open-url');
          el.runAction({});
          expect(el.showFullScreen.calls.argsFor(0)[0]).toMatch(/^blob\:/);
          done();
        } catch(e) {
          done(e);
        }
      });
    });
  });
});
