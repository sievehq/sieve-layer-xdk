describe("Image Handler", function() {

  var client, message1, message2, el;

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
    var conversation = client.createConversation({
      participants: ['layer:///identities/FrodoTheDodo', 'layer:///identities/SaurumanTheMildlyAged']
    });
    message1 = conversation.createMessage({
      parts: [{mimeType: "image/png", body: generateBlob()}]
    });

    message2 = conversation.createMessage({
      parts: [
        {mimeType: "image/png", body: generateBlob()},
        {mimeType: "image/jpeg+preview", body: generateBlob()},
        {mimeType: "application/json+imageSize", body: JSON.stringify({height: 200, width: 200, orientation: 0})}
      ]
    });

    if (layerUI.components['layer-conversation-view'] && !layerUI.components['layer-conversation-view'].classDef) layerUI.init({layer: layer});

    el = document.createElement('layer-message-image');
    layer.Util.defer.flush();
    jasmine.clock().tick(500);
    el._contentTag = 'layer-message-image';
  });

  afterEach(function() {
    jasmine.clock().uninstall();
    el.onDestroy();
    client.destroy();
    layer.Core.Client.removeListenerForNewClient();
  });

  describe("The handlesMessage() method", function() {
    it("Should select the handler for one part", function() {
      var handler = layerUI.getHandler(message1);
      expect(handler.tagName).toEqual('layer-message-image');
    });

    it("Should select the handler for three part", function() {
      var handler = layerUI.getHandler(message2);
      expect(handler.tagName).toEqual('layer-message-image');
    });
  });

  describe("The message property", function() {
    it("Should setup image, preview and metadata properties if three parts", function() {
      el.message = message2;
      expect(el.properties.image).toBe(message2.parts[0]);
      expect(el.properties.preview).toBe(message2.parts[1]);
      expect(el.properties.meta).toEqual(JSON.parse(message2.parts[2].body));
    });

    it("Should setup image if one part", function() {
      el.message = message1;
      expect(el.properties.image).toBe(message1.parts[0]);
      expect(el.properties.preview).toBe(undefined);
      expect(el.properties.meta).toBe(undefined);

    });

    it("Should call fetchContent on preview if there is a preview and its body is empty", function() {
      spyOn(message2.parts[0], "fetchContent");
      spyOn(message2.parts[1], "fetchContent");
      spyOn(message2.parts[2], "fetchContent");
      message2.parts[0].body = null;
      message2.parts[1].body = null;

      el.message = message2;

      expect(message2.parts[0].fetchContent).not.toHaveBeenCalled();
      expect(message2.parts[1].fetchContent).toHaveBeenCalled();
      expect(message2.parts[2].fetchContent).not.toHaveBeenCalled();
    });


    it("Should call fetchContent on image if there is not a preview and its body is empty", function() {
      spyOn(message1.parts[0], "fetchContent");
      message1.parts[0].body = null;

      el.message = message1;

      expect(message1.parts[0].fetchContent).toHaveBeenCalled();
    });

    it("Should call fetchStream on image if there is a preview and the image has no url", function() {
      spyOn(message2.parts[0], "fetchStream");
      spyOn(message2.parts[1], "fetchStream");
      spyOn(message2.parts[2], "fetchStream");
      message2.parts[0].body = null;
      message2.parts[1].body = null;
      message2.parts[0].__url = null;
      message2.parts[1].__url = null;

      el.message = message2;

      expect(message2.parts[0].fetchStream).toHaveBeenCalled();
      expect(message2.parts[1].fetchStream).not.toHaveBeenCalled();
      expect(message2.parts[2].fetchStream).not.toHaveBeenCalled();
    });

    it("Should not call fetchStream if only one part", function() {
      spyOn(message1.parts[0], "fetchStream");
      message1.parts[0].body = null;
      message1.parts[0].__url = null;

      el.message = message1;

      expect(message1.parts[0].fetchStream).not.toHaveBeenCalled();
    });

    it("Should call onRender when preview content is loaded", function() {
      message2.parts[0].body = null;
      message2.parts[1].body = null;
      spyOn(el, "onRender");

      el.message = message2;
      el.onRender.calls.reset();

      message2.parts[1].trigger("content-loaded");
      expect(el.onRender).toHaveBeenCalled();
    });

    it("Should call onRender when image content is loaded", function() {
      message1.parts[0].body = null;
      spyOn(el, "onRender");

      el.message = message1;
      el.onRender.calls.reset();

      message1.parts[0].trigger("content-loaded");
      expect(el.onRender).toHaveBeenCalled();
    });
  });

  describe("the onCreate() method", function() {
    xit("Click event should be wired up to _handleClick", function() {
      // How to test this?!?
    });
  });

  describe("the onRender() method", function() {
    it("Should call _renderCanvas on preview if it exists", function() {
      spyOn(el, "_renderCanvas");
      el.message = message2;
      el.onRender();
      expect(el._renderCanvas).toHaveBeenCalledWith(el.properties.preview.body);
    });

    it("Should call _renderCanvas on image if preview does not exist", function() {
      spyOn(el, "_renderCanvas");
      el.message = message1;
      el.onRender();
      expect(el._renderCanvas).toHaveBeenCalledWith(el.properties.image.body);
    });

    it("Should render using existing size if size is less than max size", function() {
      el.message = message1;
      el.properties.meta = {width: 100, height: 100, orientation: 0};
      el.onRender();
      expect(el.style.height).toEqual("100px");
    });

    it("Should render using max sizes if size is too large", function() {
      el.message = message1;
      el.properties.meta = {width: 1000, height: 2000, orientation: 0};
      el.onRender();
      expect(el.style.height).toEqual(layerUI.settings.maxSizes.height + "px");
    });
  });

  describe("the _renderCanvas() method", function() {
    it("Should generate a canvas and render the image to it", function(done) {
      jasmine.clock().uninstall();
      el.message = message1;
      el._renderCanvas();
      setTimeout(function() {
        var canvas = el.querySelector('canvas');
        expect(canvas && canvas.tagName).toEqual('CANVAS');
        done();
      }, 250);
    });

    it("Should remove any prior canvas", function(done) {
      jasmine.clock().uninstall();
      el.message = message1;
      var canvas = document.createElement('canvas');
      el.appendChild(canvas);
      el._renderCanvas();
      setTimeout(function() {
        expect(canvas.parentNode).toBe(null);
        done();
      }, 250);
    });
  });
});