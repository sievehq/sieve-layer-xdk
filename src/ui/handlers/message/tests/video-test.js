describe("Video Handler", function() {

  var client, message1, message2, el;

  var imgBase64 = "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAECElEQVR4Xu2ZO44TURREa0SAWBASKST8xCdDQMAq+OyAzw4ISfmLDBASISERi2ADEICEWrKlkYWny6+77fuqalJfz0zVOXNfv/ER8mXdwJF1+oRHBDCXIAJEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8waWjX8OwHcAv5f9Me3fPRugvbuxd14C8B7AVwA3q0oQAcYwtr2+hn969faPVSWIAG2AT3rXJvz17CcAN6ptgggwrwDb4JeVIALMJ8AY/JISRIB5BGDhr3/aZwDXKxwHEWC6AJcBvAOwfuBjvuNfABcBfGGGl5yJANPabYV/B8DLaT96nndHgPYeu4c/RI8AbQJIwO9FgDMAfrVxWuRdMvB7EOA+gHsALgD4uQjO3b6pFPzqAjwA8HTF5weA8weWQA5+ZQGOw1//jR5SAkn4VQV4CODJls18CAmuAHjbcM8vc9U76ZSrdgt4BODxyLG8Twla4P8BcLfKPX/sEaeSAAz8fR4H8vArHQHXAHwYs3Xj9SU3gQX8SgKcAvBitTp38WAJCWzgVxJg+F0qSGAFv5oAh5bADn5FAQ4lwVUAb3a86nX1tL/tXK10Czj+O+7zOLCFX3UDrEXYhwTW8KsLsPRx0Ap/+A/fq12uKpVnqx4BSx8Hgb9quAcB5t4EgX/sz6sXAeaSIPA3zqOeBJgqwTMAzxuuelJn/ubzSG8CTJFg12ex4Z4vDb+HW8A2aK1XRFYCC/g9C7DkJrCB37sAS0hgBV9BgDklGODfBvCaPScU5np8CPxf71OfCSzhq2yAqZ8d2MJXE6DlOLCGryjALhLYw1cVgJEg8Dv7MKjlgXvbg2Hgd/ph0BwSBH7nHwZNkeCW4z1/rDCV/wOM5RyOg7MAvo0Nur3uIoAbVzpvBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hz8BzIXtYE3VcPnAAAAAElFTkSuQmCC";

  function generateBlob() {
      if (window.isPhantomJS) {
          var b = new Blob([atob(imgBase64)], {type: "video/mp4"});
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
          return new Blob( [view], { type: "video/mp4" });
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
      parts: [{mimeType: "video/mp4", body: generateBlob()}]
    });

    message2 = conversation.createMessage({
      parts: [
        {mimeType: "video/mp4", body: generateBlob()},
        {mimeType: "image/jpeg+preview", body: generateBlob()},
        {mimeType: "application/json+imageSize", body: JSON.stringify({height: 200, width: 200, orientation: 0})}
      ]
    });

    if (layer.UI.components['layer-conversation-view'] && !layer.UI.components['layer-conversation-view'].classDef) layer.UI.init({layer: layer});

    el = document.createElement('layer-message-video');
    layer.Util.defer.flush();
    jasmine.clock().tick(500);
    el._contentTag = 'layer-message-video';
  });

  afterEach(function() {
    jasmine.clock().uninstall();
    el.onDestroy();
    client.destroy();
    layer.Core.Client.removeListenerForNewClient();
  });

  describe("The handlesMessage() method", function() {
    it("Should select the handler for one part", function() {
      var handler = layer.UI.getHandler(message1);
      expect(handler.tagName).toEqual('layer-message-video');
    });

    it("Should select the handler for three part", function() {
      var handler = layer.UI.getHandler(message2);
      expect(handler.tagName).toEqual('layer-message-video');
    });
  });

  describe("The message property", function() {
    it("Should setup video, preview and metadata properties if three parts", function() {
      el.message = message2;
      expect(el.properties.video).toBe(message2.parts[0]);
      expect(el.properties.preview).toBe(message2.parts[1]);
      expect(el.properties.meta).toEqual(JSON.parse(message2.parts[2].body));
    });

    it("Should setup video if one part", function() {
      el.message = message1;
      expect(el.properties.video).toBe(message1.parts[0]);
      expect(el.properties.preview).toBe(undefined);
      expect(el.properties.meta).toBe(undefined);

    });

    it("Should call fetchStream on preview if there is a preview and its url is empty", function() {
      spyOn(message2.parts[0], "fetchStream");
      spyOn(message2.parts[1], "fetchStream");
      spyOn(message2.parts[2], "fetchStream");
      message2.parts[0].__url = null;
      message2.parts[1].__url = null;

      el.message = message2;

      expect(message2.parts[1].fetchStream).toHaveBeenCalled();
    });


    it("Should call fetchStream on video if there is not a a url", function() {
      spyOn(message1.parts[0], "fetchStream");
      message1.parts[0].__url = null;

      el.message = message1;

      expect(message1.parts[0].fetchStream).toHaveBeenCalled();
    });

    it("Should call onRender when preview url is loaded", function() {
      message2.parts[0].body = null;
      message2.parts[1].body = null;
      spyOn(el, "onRender");

      el.message = message2;
      el.onRender.calls.reset();

      message2.parts[1].trigger("url-loaded");
      expect(el.onRender).toHaveBeenCalled();
    });

    it("Should call onRender when image url is loaded", function() {
      message1.parts[0].body = null;
      spyOn(el, "onRender");

      el.message = message1;
      el.onRender.calls.reset();

      message1.parts[0].trigger("url-loaded");
      expect(el.onRender).toHaveBeenCalled();
    });
  });



  describe("the onRender() method", function() {
    it("Should setup width, height and src", function() {
      message2.parts[0].__url = "https://layer.com/heyho";
      el.message = message2;
      el.onRender();
      expect(el.nodes.video.width).toEqual(200);
      expect(el.nodes.video.height).toEqual(200);
      expect(el.nodes.video.src).toEqual(message2.parts[0].url);
      expect(el.nodes.video.poster).toEqual(message2.parts[1].url);
    });

  });
});