/* eslint-disable */
describe("The MessageParts class", function() {
    var appId = "Fred's App";

    var conversation,
        client,
        requests,
        oldBlob;

    afterAll(function() {
        if (oldBlob) window.Blob = oldBlob;

    });

    beforeAll(function() {

    });

    beforeEach(function() {
        jasmine.Ajax.install();
        requests = jasmine.Ajax.requests;
        client = new Layer.Core.Client({
            appId: appId,
            reset: true,
            url: "https://doh.com"
        });
        client.userId = "999";
        client.user = new Layer.Core.Identity({
          userId: client.userId,
          id: "layer:///identities/" + client.userId,
          firstName: "first",
          lastName: "last",
          phoneNumber: "phone",
          emailAddress: "email",
          metadata: {},
          publicKey: "public",
          avatarUrl: "avatar",
          displayName: "display",
          syncState: Layer.Constants.SYNC_STATE.SYNCED,
          isFullIdentity: true,
          isMine: true
        });


        client._clientAuthenticated();
        getObjectsResult = [];
        spyOn(client.dbManager, "getObjects").and.callFake(function(tableName, ids, callback) {
            setTimeout(function() {
                callback(getObjectsResult);
            }, 10);
        });
        client._clientReady();
        client.onlineManager.isOnline = true;

        conversation = Layer.Core.Conversation._createFromServer(responses.conversation2);
        conversation.lastMessage.destroy();

        requests.reset();
        client.syncManager.queue = [];
    });
    afterEach(function() {
        client.destroy();
        jasmine.Ajax.uninstall();
    });

    var imgBase64 = "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAECElEQVR4Xu2ZO44TURREa0SAWBASKST8xCdDQMAq+OyAzw4ISfmLDBASISERi2ADEICEWrKlkYWny6+77fuqalJfz0zVOXNfv/ER8mXdwJF1+oRHBDCXIAJEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8waWjX8OwHcAv5f9Me3fPRugvbuxd14C8B7AVwA3q0oQAcYwtr2+hn969faPVSWIAG2AT3rXJvz17CcAN6ptgggwrwDb4JeVIALMJ8AY/JISRIB5BGDhr3/aZwDXKxwHEWC6AJcBvAOwfuBjvuNfABcBfGGGl5yJANPabYV/B8DLaT96nndHgPYeu4c/RI8AbQJIwO9FgDMAfrVxWuRdMvB7EOA+gHsALgD4uQjO3b6pFPzqAjwA8HTF5weA8weWQA5+ZQGOw1//jR5SAkn4VQV4CODJls18CAmuAHjbcM8vc9U76ZSrdgt4BODxyLG8Twla4P8BcLfKPX/sEaeSAAz8fR4H8vArHQHXAHwYs3Xj9SU3gQX8SgKcAvBitTp38WAJCWzgVxJg+F0qSGAFv5oAh5bADn5FAQ4lwVUAb3a86nX1tL/tXK10Czj+O+7zOLCFX3UDrEXYhwTW8KsLsPRx0Ap/+A/fq12uKpVnqx4BSx8Hgb9quAcB5t4EgX/sz6sXAeaSIPA3zqOeBJgqwTMAzxuuelJn/ubzSG8CTJFg12ex4Z4vDb+HW8A2aK1XRFYCC/g9C7DkJrCB37sAS0hgBV9BgDklGODfBvCaPScU5np8CPxf71OfCSzhq2yAqZ8d2MJXE6DlOLCGryjALhLYw1cVgJEg8Dv7MKjlgXvbg2Hgd/ph0BwSBH7nHwZNkeCW4z1/rDCV/wOM5RyOg7MAvo0Nur3uIoAbVzpvBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hz8BzIXtYE3VcPnAAAAAElFTkSuQmCC";
    function generateBlob(large) {
        var img =  (large) ? imgBase64 + imgBase64 : imgBase64;
        if (window.isPhantomJS) {
            var b = new Blob([atob(img)], {type: "image/png"});
            b.length = large ? 12345 : 125;
            return b;
        } else {
            var imageBinary = atob(img),
                buffer = new ArrayBuffer(imageBinary.length),
                view = new Uint8Array(buffer),
                i;

            for (i = 0; i < imageBinary.length; i++) {
                view[i] = imageBinary.charCodeAt(i);
            }
            return new Blob( [view], { type: "image/png" });
        }
    }

    describe("The constructor() method", function() {
        it("Should initialize with an object", function() {
            expect(new Layer.Core.MessagePart({body: "hey"}).body).toEqual("hey");
            expect(new Layer.Core.MessagePart({mimeType: "text/hey"}).mimeType).toEqual("text/hey");
            expect(new Layer.Core.MessagePart({id: "Impart"}).id).toEqual("Impart");
        });

        it("Should initialize with a string", function() {
           expect(new Layer.Core.MessagePart("hey").body).toEqual("hey");
           expect(new Layer.Core.MessagePart("ho").mimeType).toEqual("application/vnd.layer.text+json");
        });

        it("Should initialize with two strings", function() {
           expect(new Layer.Core.MessagePart("hey", "text/mountain").mimeType).toEqual("text/mountain");
        });

        it("Should initialize with a blob", function() {
            var b = generateBlob();
            expect(new Layer.Core.MessagePart(b).body instanceof Blob).toBe(true);
            if (!window.isPhantomJS) {
                expect(new Layer.Core.MessagePart(b).size).toEqual(b.size);
            }
            expect(new Layer.Core.MessagePart(b).mimeType).toEqual("image/png");
        });

        it("Should set url if initialize with blob", function() {
            var b = generateBlob();
            expect(new Layer.Core.MessagePart(b).url.length > 0).toBe(true);
        });

        it("Should NOT set url if initialize with blob and a text mimeType", function() {
            var text = new Array(Layer.Core.DbManager.MaxPartSize + 10).join('a');
            var blob = new Blob([text], {type : 'text/plain'});
            expect(new Layer.Core.MessagePart(blob).url).toEqual('');
        });


        it("Should convert the body to Blob if non-textual mimeType and non-blob body", function() {
            expect(new Layer.Core.MessagePart({
                body: "hey",
                mimeType: "ho/hum"
            }).body).toEqual(jasmine.any(Blob));
        });

        it("Should initialize with Content", function() {
            var c = new Layer.Core.Content({});
            expect(new Layer.Core.MessagePart({_content: c})._content).toBe(c);
        });

        it("Should initialize with blob and url if base64 encoded", function() {
            var part = Layer.Core.MessagePart._createFromServer({
                body: imgBase64,
                mime_type: 'not/blob',
                encoding: 'base64'
            });
            expect(part.body instanceof Blob).toBe(true);
            expect(part.url.length > 0).toBe(true);
        });

    });

    describe("The destroy() method", function() {
        var part, tmp;
        beforeEach(function() {
          tmp = URL.revokeObjectURL;
          spyOn(URL, "revokeObjectURL");
          content = new Layer.Core.Content({});
          part = new Layer.Core.MessagePart({mimeType: "text/dog", _content: content});
        });
        afterEach(function() {
          URL.revokeObjectURL = tmp;
        });

        it("Should call revokeObjectURL if there is a url", function() {
            part.url = "fred";
            part.destroy();
            expect(URL.revokeObjectURL).toHaveBeenCalledWith("fred");
        });

        it("Should call revokeObjectURL if there is a url", function() {
            part.destroy();
            expect(URL.revokeObjectURL).not.toHaveBeenCalled();
        });
    })

    describe("The fetchContent() method", function() {
        var part, message, content;
        beforeEach(function() {
            content = new Layer.Core.Content({});
            part = new Layer.Core.MessagePart({mimeType: "text/dog", _content: content});
            message = conversation.createMessage({parts: [part]}).send();
            part.id = message.id + "/parts/0";
        });

        it("Should call content.loadContent", function() {
            // Setup
            spyOn(content, "loadContent");
            spyOn(part, "_fetchContentCallback")

            // Run
            part.fetchContent();

            // Posttest
            expect(content.loadContent).toHaveBeenCalledWith("text/dog", jasmine.any(Function));
            content.loadContent.calls.first().args[1]("Test!");
            expect(part._fetchContentCallback).toHaveBeenCalledWith("Test!", undefined, undefined);
        });

        it("Should not call content.loadContent if still processing last fetchContent request", function() {
            // Setup
            part.fetchContent();
            spyOn(content, "loadContent");

            // Run
            part.fetchContent();

            // Posttest
            expect(content.loadContent).not.toHaveBeenCalled();
        });

        it("Should fail quietly if no content property", function() {
            part.content = null;
            expect(function() {
                part.fetchContent();
            }).not.toThrow();
        });

        it("Should treat image/jpeg+preview as image/jpeg", function() {
            part.mimeType = "image/jpeg+preview";
            spyOn(content, "loadContent");

            // Run
            part.fetchContent();

            // Posttest
            expect(content.loadContent).toHaveBeenCalledWith("image/jpeg", jasmine.any(Function));
        });
    });

    describe("The _fetchContentCallback() method", function() {
        var part, message, content;
        beforeEach(function() {
            content = new Layer.Core.Content({expiration: new Date()});
            part = new Layer.Core.MessagePart({mimeType: "food/dog", _content: content});
            message = conversation.createMessage({parts: [part]}).send();
            part.id = message.id + "/parts/0";
        });

        it("Should set the URL property", function() {
          expect(part.url).toEqual("");
          part._fetchContentCallback(null, generateBlob());
          expect(part.url.length > 0).toBe(true);
        });

        it("Should clear the isFiring property", function() {
          part.isFiring = true;
          part._fetchContentCallback(null, generateBlob());
          expect(part.isFiring).toEqual(false);
        });

        it("Should call _fetchContentComplete for non-text part", function() {
          spyOn(part, "_fetchContentComplete");
          part.mimeType = "image/png"
          var blob = generateBlob();
          part._fetchContentCallback(null, blob);
          expect(part._fetchContentComplete).toHaveBeenCalledWith(blob, undefined);
        });

        it("Should call _fetchTextFromBlob for text/plain", function() {
          var text = new Array(Layer.Core.DbManager.MaxPartSize + 10).join('a');
          var blob = new Blob([text], {type : 'text/plain'});
          part = new Layer.Core.MessagePart(blob);
          var fetchTextFromFile = Layer.Utils.fetchTextFromFile;
          spyOn(layer.Utils, "fetchTextFromFile").and.callFake(function(file, callback) {callback(text);});
          spyOn(part, "_fetchContentComplete");
          var spy = jasmine.createSpy('callback');
          part._fetchContentCallback(null, blob, spy);

          // Posttest
          expect(Layer.Utils.fetchTextFromFile).toHaveBeenCalledWith(blob, jasmine.any(Function));
          expect(part._fetchContentComplete).toHaveBeenCalledWith(text, spy);

          // Cleanup
          Layer.Utils.fetchTextFromFile = fetchTextFromFile;
        });

        it("Should call read_fetchContentComplete for text/plain", function() {
          spyOn(part, "_fetchContentComplete");

          var blob = generateBlob();
          part._fetchContentCallback(null, blob);
          expect(part._fetchContentComplete).toHaveBeenCalledWith(blob, undefined);
        });

        it("Should trigger content-loaded-error if error", function() {
          spyOn(part, "trigger");
          part._fetchContentCallback("MyError");
          expect(part.trigger).toHaveBeenCalledWith('content-loaded-error', 'MyError');
        });

        it("Should trigger content-loaded-error if error", function() {
          spyOn(part, "trigger");
          part._fetchContentCallback("MyError");
          expect(part.trigger).toHaveBeenCalledWith('content-loaded-error', 'MyError');
        });
    });

    describe("The _fetchContentComplete() method", function() {
        var part, message, content;
        beforeEach(function() {
            content = new Layer.Core.Content({});
            part = new Layer.Core.MessagePart({mimeType: "text/dog", _content: content});
            message = conversation.createMessage({parts: [part]}).send();
            part.id = message.id + "/parts/0";
        });

        it("Should set body", function() {
            part._fetchContentComplete("Hey Ho");
            expect(part.body).toEqual("Hey Ho");
        });

        it("Should trigger a content-loaded event", function() {
            spyOn(part, "trigger");
            part._fetchContentComplete("Hey Ho");
            expect(part.trigger).toHaveBeenCalledWith("content-loaded");
        });

        it("Should trigger messages:change event", function(done) {
            spyOn(message, "_triggerAsync");
            part._fetchContentComplete("Hey Ho");
            setTimeout(function() {

                // Posttest
                expect(message._triggerAsync).toHaveBeenCalledWith("messages:change", {
                    property: "parts.body",
                    oldValue: null,
                    newValue: 'Hey Ho',
                    part: part
                });
                done();
            }, 100);
        });

        it("Should trigger messageparts:change event", function() {
            part.body = '';
            spyOn(part, "_triggerAsync");
            part._fetchContentComplete("Hey Ho");

            // Posttest
            expect(part._triggerAsync).toHaveBeenCalledWith("messageparts:change", {
                property: "body",
                oldValue: '',
                newValue: "Hey Ho",
            });
        });

        it("Should call the callback", function() {
          var spy = jasmine.createSpy('callback');
          part._fetchContentComplete("Hey Ho", spy);
          expect(spy).toHaveBeenCalledWith("Hey Ho");
        });
    });

    describe("The fetchStream() method", function() {
      var part, message;
      beforeEach(function() {
          message = client._createObject(responses.message1);
          part = Layer.Core.MessagePart._createFromServer({
              id: message.id + "/parts/3",
              body: "",
              mime_type: 'dog/food',
              content: {
                  id: "jill",
                  download_url: "fred",
                  expiration: new Date()
              }
          });
          message.addPart(part);
      });

      it("Should throw an error if no content", function() {
        delete part._content;
        expect(function() {
          part.fetchStream();
        }).toThrowError(Layer.Core.LayerError.ErrorDictionary.contentRequired);
        expect(Layer.Core.LayerError.ErrorDictionary.contentRequired.length > 0).toBe(true);
      });

      it("Should call refreshContent if expired", function() {
        spyOn(part._content, "refreshContent");
        spyOn(part, "_fetchStreamComplete");
        part._content.expiration.setHours(part._content.expiration.getHours() - 1);
        part.fetchStream();
        expect(part._content.refreshContent).toHaveBeenCalled();
        expect(part._fetchStreamComplete).not.toHaveBeenCalled();
      });

      it("Should call _fetchStreamComplete if not expired", function() {
        spyOn(part._content, "refreshContent");
        spyOn(part, "_fetchStreamComplete");
        part._content.expiration.setHours(part._content.expiration.getHours() + 1);
        part.fetchStream();
        expect(part._content.refreshContent).not.toHaveBeenCalled();
        expect(part._fetchStreamComplete).toHaveBeenCalled();
      });
    });

    describe("The _fetchStreamComplete() method", function() {
      var part, message;
      beforeEach(function() {
          message = client._createObject(responses.message1);
          client._addMessage(message);
          part = Layer.Core.MessagePart._createFromServer({
              id: "joe",
              body: "jane",
              mime_type: 'dog/food',
              content: {
                  id: "jill",
                  download_url: "fred",
                  expiration: new Date()
              }
          });
          message.addPart(part);
          part.id = message.id + "/parts/2"
          part._streamInUse = true;
      });

      it("Should trigger url-loaded", function() {
        spyOn(part, "trigger");
        part._fetchStreamComplete("hey");
        expect(part.trigger).toHaveBeenCalledWith("url-loaded");
      });

      it("Should trigger messages:change", function(done) {
        setTimeout(function() {

            spyOn(message, "_triggerAsync");

            // Run
            part._fetchStreamComplete("hey");

            setTimeout(function() {
                // Posttest
                expect(message._triggerAsync).toHaveBeenCalledWith("messages:change", {
                    oldValue: '',
                    newValue: "hey",
                    property: "parts.url",
                    part: part
                })
                done();
            }, 100);
        }, 100);
      });

      it("Should trigger messageparts:change event", function() {
        spyOn(part, "_triggerAsync");
        part._fetchStreamComplete("hey");

        // Posttest
        expect(part._triggerAsync).toHaveBeenCalledWith("messageparts:change", {
            property: "url",
            oldValue: '',
            newValue: "hey",
        });
      });


      it("Should call callback", function() {
        var spy = jasmine.createSpy("callback");
        part._fetchStreamComplete("hey", spy);
        expect(spy).toHaveBeenCalledWith("hey");
      });
    });

    describe("The _send() method", function() {
        it("Should call _sendWithContent", function() {
            var content = new Layer.Core.Content({});
            var part = new Layer.Core.MessagePart({
                _content: content
            });
            spyOn(part, "_sendWithContent");


            // Run
            part._send(client);

            // Posttest
            expect(part._sendWithContent).toHaveBeenCalledWith();

        });

        it("Should call _generateContentAndSend", function() {
            var part = new Layer.Core.MessagePart({
                body: new Array(5000).join("hello")
            });
            spyOn(part, "_generateContentAndSend");

            // Run
            part._send();

            // Posttest
            expect(part._generateContentAndSend).toHaveBeenCalledWith();
        });

        it("Should call _sendBlob", function() {
            var part = new Layer.Core.MessagePart({
                body: generateBlob(),
                mimeType: 'not/here'
            });
            spyOn(part, "_sendBlob");

            // Run
            part._send();

            // Posttest
            expect(part._sendBlob).toHaveBeenCalledWith();
        });

        it("Should call _sendBody", function() {
            var part = new Layer.Core.MessagePart({
                body: "hey"
            });
            spyOn(part, "_sendBody");

            // Run
            part._send(client);

            // Posttest
            expect(part._sendBody).toHaveBeenCalledWith();
        });
    });

    describe("The _sendBody() method", function() {
        it("Should trigger with body and mime_type", function() {
            var part = new Layer.Core.MessagePart({
                body: "hey",
                mimeType: "text/ho"
            });
            spyOn(part, "trigger");

            // Run
            part._sendBody();

            // Posttest
            expect(part.trigger).toHaveBeenCalledWith("parts:send", {
                body: "hey",
                mime_type: "text/ho",
                id: part.id
            });
        });


        it("Should throw error on non-string", function() {
           var part = new Layer.Core.MessagePart({
                body: {hey: "ho"},
                mimeType: "text/ho"
            });

            // Run
            expect(function() {
                part._sendBody();
            }).toThrow();
        });
    });

    describe("The _sendWithContent() method", function() {
        it("Should trigger parts:send", function() {
            var content = new Layer.Core.Content({
                id: "fred",
                size: 500
            });
            var part = new Layer.Core.MessagePart({
                _content: content,
                mimeType: "ho"
            });
            spyOn(part, "trigger");

            // Run
            part._sendWithContent();

            // Posttest
            expect(part.trigger).toHaveBeenCalledWith("parts:send", {
                content: {
                    id: "fred",
                    size: 500
                },
                mime_type: "ho",
                id: part.id
            });
        });
    });

    describe("The _sendBlob() method", function() {
        it("Should send small blobs", function(done) {
            var part = new Layer.Core.MessagePart({
                body: new Blob([atob("abc")], {type: "fred"}),
                mimeType: "fred"
            });

            spyOn(part, "trigger").and.callFake(function(eventName, data) {
                expect(eventName).toEqual("parts:send");
                expect(data).toEqual({
                    encoding: "base64",
                    mime_type: "fred",
                    id: part.id,
                    body: jasmine.any(String)
                });
                expect(data.body.length > 0).toBe(true);
                done();
            });

            // Run
            part._sendBlob();
        });

        it("Should generate content for large blobs", function(done) {
            var b = generateBlob(true);
            var part = new Layer.Core.MessagePart({
                body: b,
                mimeType: "fred"
            });
            spyOn(part, "_generateContentAndSend").and.callFake(function() {
                expect(true).toBe(true);
                done();
            });

            // Run
            part._sendBlob();
        });
    });

    describe("The _generateContentAndSend() method", function() {
        it("Should call client.xhr with generated blob size", function() {
            spyOn(client, "xhr");
            var part = new Layer.Core.MessagePart({
                body: new Array(5000).join("hello"),
                mimeType: "text/plain"
            });

            // Run
            part._generateContentAndSend(client);

            // Posttest
            var expectedBody = Layer.Utils.base64ToBlob(btoa(part.body), "text/plain");
            expect(client.xhr).toHaveBeenCalledWith({
                method: "POST",
                url: "/content",
                headers: {
                    'Upload-Content-Type': "text/plain",
                    'Upload-Content-Length': expectedBody.size,
                    'Upload-Origin': location.origin
                },
                sync: {}
            }, jasmine.any(Function));
        });

        it("Should call client.xhr with provided blob size", function() {
            spyOn(client, "xhr");
            var expectedBody = Layer.Utils.base64ToBlob(btoa(new Array(5000).join("hello")), "text/plain");
            var part = new Layer.Core.MessagePart({
                body: expectedBody,
                mimeType: "text/plain"
            });

            // Run
            part._generateContentAndSend(client);

            // Posttest
            expect(client.xhr).toHaveBeenCalledWith({
                method: "POST",
                url: "/content",
                headers: {
                    'Upload-Content-Type': "text/plain",
                    'Upload-Content-Length': expectedBody.size,
                    'Upload-Origin': location.origin
                },
                sync: {}
            }, jasmine.any(Function));
        });

        it("Should call _processContentResponse", function() {
            var part = new Layer.Core.MessagePart({
                body: new Array(5000).join("hello"),
                mimeType: "text/plain"
            });
            spyOn(part, "_processContentResponse");

            // Run
            part._generateContentAndSend(client);
            requests.mostRecent().response({
                status: 200,
                responseText: JSON.stringify({
                    hey: "ho"
                })
            });

            // Posttest
            var expectedBody = Layer.Utils.base64ToBlob(btoa(part.body), "text/plain");
            expect(part._processContentResponse).toHaveBeenCalledWith({hey: "ho"}, expectedBody);
        });
    });

    describe("The _processContentResponse() method", function() {
        it("Should create Content", function() {
            var part = new Layer.Core.MessagePart({
                body: new Array(5000).join("hello"),
                mimeType: "text/plain"
            });
            var blobBody = Layer.Utils.base64ToBlob(btoa(part.body), "text/plain");


            // Run
            part._processContentResponse({
                id: "layer:///content/fred"
            },  blobBody);

            // Posttest
            expect(part._content.id).toEqual("layer:///content/fred");
        });

        it("Should call xhr and post to cloud storage", function() {
            spyOn(client, "xhr");
            var part = new Layer.Core.MessagePart({
                body: new Array(5000).join("hello"),
                mimeType: "text/plain"
            });
            var blobBody = Layer.Utils.base64ToBlob(btoa(part.body), "text/plain");

            // Run
            part._processContentResponse({
                upload_url: "http://argh.com",
                id: "layer:///content/fred"
            }, blobBody);

            // Posttest
            expect(requests.mostRecent().url).toEqual("http://argh.com");
            expect(requests.mostRecent().method).toEqual('PUT');
            expect(requests.mostRecent().params).toEqual(blobBody);
            expect(requests.mostRecent().requestHeaders).toEqual({
                'upload-content-length': part.size,
                'upload-content-type': part.mimeType,
            });
        });

        it("Should call _processContentUploadResponse", function() {
            var part = new Layer.Core.MessagePart({
                body: new Array(5000).join("hello"),
                mimeType: "text/plain"
            });
            var blobBody = Layer.Utils.base64ToBlob(btoa(part.body), "text/plain");
            spyOn(part, "_processContentUploadResponse");

            // Run
            part._processContentResponse({
                upload_url: "http://argh.com",
                id: "layer:///content/fred"
            }, blobBody);
            requests.mostRecent().response({
                status: 200,
                responseText: JSON.stringify({hey: "ho"})
            });

            // Posttest
            expect(part._processContentUploadResponse)
                .toHaveBeenCalledWith(jasmine.objectContaining({
                    success: true,
                    status: 200,
                    data: {hey: "ho"}
                }),
                {
                upload_url: "http://argh.com",
                    id: "layer:///content/fred"
                },
                blobBody, 0);
        });
    });

    describe("The _processContentUploadResponse() method", function() {

        it("Should trigger parts:send", function() {
            var content = new Layer.Core.Content({
                id: "layer:///content/fred",
                size: new Array(5000).join("hello").length
            });
            var part = new Layer.Core.MessagePart({
                body: new Array(5000).join("hello"),
                _content: content,
                mimeType: "text/plain"
            });
            spyOn(part, "trigger");

            // Run
            part._processContentUploadResponse({
                success: true
            }, {id: "doh"}, part.body, 0);


            // Posttest
            expect(part.trigger).toHaveBeenCalledWith("parts:send", {
                content: {
                    id: "layer:///content/fred",
                    size: part.body.length
                },
                mime_type: "text/plain",
                id: part.id
            });
        });

        it("Should setup to retry if isOnline is false", function() {
            client.onlineManager.isOnline = false;
            var content = new Layer.Core.Content({
                id: "layer:///content/fred"
            });
            var part = new Layer.Core.MessagePart({
                body: new Array(5000).join("hello"),
                _content: content,
                mimeType: "text/plain"
            });
            spyOn(part, "_processContentResponse");

            // Run
            part._processContentUploadResponse({
                success: false
            }, {id: "doh"}, part.body, 0);
            client.onlineManager.trigger("connected");

            // Posttest
            expect(part._processContentResponse).toHaveBeenCalledWith({id: "doh"}, jasmine.any(Layer.Core.LayerEvent));
        });

        it("Should call _processContentResponse on error", function() {
            var part = new Layer.Core.MessagePart({
                body: new Array(5000).join("hello"),
                mimeType: "text/plain",
                id: "layer:///content/fred"
            });
            spyOn(part, "trigger");
            spyOn(part, "_processContentResponse");

            // Run
            part._processContentUploadResponse({
                success: false
            }, {id: "doh"}, part.body, 0);

            // Posttest
            expect(part.trigger).not.toHaveBeenCalled();
            expect(part._processContentResponse).toHaveBeenCalledWith({id: "doh"}, part.body, 1);
        });

        it("Should trigger messages:sent-error after max-retries", function() {
            var part = new Layer.Core.MessagePart({
                body: new Array(5000).join("hello"),
                mimeType: "text/plain",
            });
            var message = conversation.createMessage({
                parts: [part]
            });
            client._addMessage(message);
            spyOn(message, "trigger");
            spyOn(part, "_processContentResponse");

            // Run
            part._processContentUploadResponse({
                success: false
            }, {id: "doh"}, part.body, Layer.Core.MessagePart.MaxRichContentRetryCount);

            // Posttest
            expect(message.trigger).toHaveBeenCalledWith('messages:sent-error', {
                error: jasmine.any(Layer.Core.LayerError),
                part: part
            });
            expect(part._processContentResponse).not.toHaveBeenCalled();
        });
    });

    describe("The _populateFromServer() method", function() {
      it("Should ignore this part if it has no Content", function() {
        var m = new Layer.Core.MessagePart({});
        m._populateFromServer(JSON.parse(JSON.stringify(responses.message1.parts[1])));
        expect(m._content).toBe(null);
      });

      it("Should update the expiration", function() {
          var c = new Layer.Core.Content({});
          c.downloadUrl = "hey";
          c.expiration = new Date('2010-10-10');
          var part = new Layer.Core.MessagePart({mimeType: "image/png", _content: c});

          // Run Test: Replace the downloadUrl and expiration we just set with values provided by server
          part._populateFromServer(JSON.parse(JSON.stringify(responses.message1.parts[1])));

          // Posttest
          expect(part._content.downloadUrl).toEqual(responses.message1.parts[1].content.download_url);
          expect(part._content.expiration).toEqual(new Date(responses.message1.parts[1].content.expiration));
        });

        it("Should update the body and trigger change events", function(done) {
            m = new Layer.Core.MessagePart({body: "hey", mimeType: "text/plain"});
            spyOn(m, '_triggerAsync');
            m._populateFromServer({mime_type: "text/plain", body: "hey hey hey"});
            expect(m.body).toEqual("hey hey hey");
            setTimeout(function() {
                expect(m._triggerAsync).toHaveBeenCalledWith('messageparts:change', {
                    property: 'body',
                    oldValue: 'hey',
                    newValue: 'hey hey hey'
                });
                done();
            }, 100);
        });

        it("Should not trigger a change event if a blob is unchanged", function(done) {
            m = new Layer.Core.MessagePart({body: "hey", mimeType: "ho", encoding: "base64"});
            spyOn(m, '_triggerAsync');
            m._populateFromServer({mime_type: "ho", body: "hey", encoding: "base64"});
            setTimeout(function() {
                expect(m._triggerAsync).not.toHaveBeenCalled();
                done();
            }, 100);
        });

        it("Should trigger a change event if a blob is changed", function(done) {
            m = new Layer.Core.MessagePart({body: "hey", mimeType: "ho"});
            spyOn(m, '_triggerAsync');
            m._populateFromServer({mime_type: "ho", body: "hey2"});
            setTimeout(function() {
                expect(m._triggerAsync).toHaveBeenCalled();
                done();
            }, 100);
        });
    });

    describe("The createModel() method", function() {
        it("Should create a new model", function() {

            // Setup
            var part = new Layer.Core.MessagePart({
                mimeType: "application/vnd.layer.text+json",
                body: '{"text": "a"}'
            });
            var message = new Layer.Core.Message.ConversationMessage({parts: [part]});

            // Run
            var TextModel = Layer.Core.Client.getMessageTypeModelClass('TextModel');
            expect(part.createModel()).toEqual(jasmine.any(TextModel));
        });

        it("Should return a cached model", function() {
            // Setup
            var message = new Layer.Core.Message({
                parts: [{
                    mimeType: "application/vnd.layer.text+json",
                    body: '{"text": "a"}'
                }]
            });
            var part = message.findPart();
            var model = part.createModel();

            // Run
            expect(part.createModel()).toBe(model);
        });
    });

    describe("The static _createFromServer() method", function() {
        var part;
        beforeEach(function() {
            part = Layer.Core.MessagePart._createFromServer({
                id: "joe",
                body: "jane",
                mime_type: 'text/plain',
                content: {
                    id: "jill"
                }
            });
        });

        it("Should create a MessagePart instance", function() {
            expect(part instanceof Layer.Core.MessagePart).toBe(true);
        });

        it("Should have a correct id", function() {
            expect(part.id).toEqual("joe");
        });

        it("Should have a correct body", function() {
            expect(part.body).toEqual("jane");
        });

        it("Should have a correct content", function() {
            expect(part._content instanceof Layer.Core.Content).toBe(true);
            expect(part._content.id).toEqual("jill");
        });

        it("Should have a hasContent true", function() {
            expect(part.hasContent).toEqual(true);
        });

        it("Should have a hasContent false", function() {
          part = Layer.Core.MessagePart._createFromServer({
                id: "joe",
                body: "jane",
                mime_type: "text/plain",
                encoding: "john"
            });
            expect(part.hasContent).toEqual(false);
        });
    });

    describe("The get url() method", function() {
      var part;
      beforeEach(function() {
          part = Layer.Core.MessagePart._createFromServer({
              id: "joe",
              body: "jane",
              encoding: "john",
              mime_type: "text/plain",
              content: {
                  id: "jill",
                  download_url: "fred",
                  expiration: new Date()
              }
          });
          part._streamInUse = true;
      });

      it("Should return the downloadUrl if there is content that has not expired", function() {
        part._content.expiration.setHours(part._content.expiration.getHours() + 1);
        expect(part.url).toEqual("fred");
      });

      it("Should return '' if content has expired", function() {
        part._content.expiration.setHours(part._content.expiration.getHours() - 1);
        expect(part.url).toEqual("");
      });

      it("Should return '' if no content", function() {
        delete part._content;
        delete part.hasContent;
        expect(part.url).toEqual("");
      });

      it("Should return the url if its been set", function() {
        part.url = "fred2";
        part._content.expiration = new Date("2010-10-10"); // long ago...
        expect(part.url).toEqual("fred2");
      });
    })
});