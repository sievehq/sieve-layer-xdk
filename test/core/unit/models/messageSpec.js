/* eslint-disable */
describe("The Message class", function() {
    var appId = "Fred's App";

    var conversation,
        channel,
        userIdentity1,
        userIdentity2,
        userIdentity3,
        userIdentity4,
        client,
        requests;

    beforeEach(function() {
        jasmine.clock().install();
        jasmine.Ajax.install();
        requests = jasmine.Ajax.requests;
        client = new Layer.Core.Client({
            appId: appId,
            reset: true,
            url: "https://doh.com"
        }).on("challenge", function() {});

        client.user = new Layer.Core.Identity({
          userId: "999",
          id: "layer:///identities/999",
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
        userIdentity1 = new Layer.Core.Identity({
            id: "layer:///identities/1",
            displayName: "1",
            userId: "1"
        });
        userIdentity2 = new Layer.Core.Identity({
            id: "layer:///identities/2",
            displayName: "2",
            userId: "2"
        });
        userIdentity3 = new Layer.Core.Identity({
            id: "layer:///identities/3",
            displayName: "3",
            userId: "3"
        });
        userIdentity4 = new Layer.Core.Identity({
            id: "layer:///identities/4",
            displayName: "4",
            userId: "4"
        });

        client._clientAuthenticated();
        getObjectResult = null;
        spyOn(client.dbManager, "getObject").and.callFake(function(tableName, ids, callback) {
            setTimeout(function() {
                callback(getObjectResult);
            }, 10);
        });
        client._clientReady();
        client.onlineManager.isOnline = true;

        conversation = Layer.Core.Conversation._createFromServer(responses.conversation2);
        channel = Layer.Core.Channel._createFromServer(responses.channel1);

        jasmine.clock().tick(1);
        Layer.Utils.defer.flush();
        requests.reset();
        client.syncManager.queue = [];
    });
    afterEach(function() {
        if (client) client.destroy();
        jasmine.Ajax.uninstall();
        jasmine.clock().uninstall();
    });

    afterAll(function() {

    });

    describe("The constructor() method", function() {
        var message;
        beforeEach(function() {
            message = new Layer.Core.Message.ConversationMessage({
                parts: [{body: "Hello There", mimeType: "text/plain"}],
            });
        });
        afterEach(function() {
            message.destroy();
        });

        it("Should create a default recipientStatus value", function() {
            expect(message.recipientStatus).toEqual({});
        });

        it("Should create a default sentAt value", function() {
            expect(message.sentAt).toEqual(jasmine.any(Date));
        });

        it("Should create a default sender value", function() {
            expect(message.sender).toBe(client.user);
        });


        it("Should create a localCreatedAt value", function() {
            expect(message.localCreatedAt).toEqual(jasmine.any(Date));
        });


        it("Should create a parts value", function() {
            // Run
            var m = conversation.createMessage({});

            // Posttest
            expect(m.parts.size).toEqual(0);
        });

        it("Should be created with a string for a part", function() {
            // Run
            var m = conversation.createMessage({
                parts: "Hello There",
            });

            // Posttest
            expect(m.findPart().body).toEqual("Hello There");
            expect(m.findPart().mimeType).toEqual("text/plain");
        });

        it("Should be created with a Part", function() {
            // Run
            var m = conversation.createMessage({
                parts: new Layer.Core.MessagePart({
                    body: "Hello There",
                    mimeType: "text/greeting"
                }),
            });

            // Posttest
            expect(m.findPart().body).toEqual("Hello There");
            expect(m.findPart().mimeType).toEqual("text/greeting");
        });

        it("Should be created with array of parts", function() {
            // Run
            var m = conversation.createMessage({
                parts: [new Layer.Core.MessagePart({
                    body: "Hello There",
                    mimeType: "text/greeting"
                })],
            });

            // Posttest
            expect(m.findPart().body).toEqual("Hello There");
            expect(m.findPart().mimeType).toEqual("text/greeting");
        });

        it("Should be created with array of mixed", function() {
            // Run
            var m = conversation.createMessage({
                parts: ["Hello There 1", {
                    body: "Hello There 2",
                    mimeType: "text/greeting"
                }],
            });

            // Posttest
            expect(m.parts.size).toEqual(2);
            var part1 = m.findPart();
            var part2 = m.findPart(function(part) {return part !== part1});
            expect(part1.body).toEqual("Hello There 1");
            expect(part1.mimeType).toEqual("application/vnd.layer.text+json");

            expect(part2.body).toEqual("Hello There 2");
            expect(part2.mimeType).toEqual("text/greeting");
        });

        it("Should set isRead = true and isUnread = false for normal call", function() {

            // Posttest
            expect(message.isRead).toBe(true);
            expect(message.isUnread).toBe(false);
        });

        it("Should set isRead to not isUnread", function() {
            var m = client._createObject({
                id: responses.message1.id,
                conversation: responses.conversation2,
                is_unread: true,
                sender: userIdentity2,
                parts: [],
            });
            expect(m.isRead).toBe(false);
            m.destroy();

            var m = client._createObject({
                id: responses.message1.id,
                conversation: responses.conversation2,
                is_unread: false,
                sender: userIdentity2,
                parts: [],
            });
            expect(m.isRead).toBe(true);
        });

        it("Should call _populateFromServer", function() {
            // Setup
            var tmp = Layer.Core.Message.prototype._populateFromServer;
            spyOn(Layer.Core.Message.prototype, "_populateFromServer").and.callThrough();
            var serverDef = {
                sender: {user_id: "fred"},
                is_unread: true,
                parts: [],
                id: "layer:///messages/message893",
                conversation: {
                    id: "layer:///conversation/abcde"
                }
            };

            // Run
            var m = client._createObject(serverDef);

            // Posttest
            expect(Layer.Core.Message.ConversationMessage.prototype._populateFromServer).toHaveBeenCalledWith(serverDef);

            // Restore
            Layer.Core.Message.prototype._populateFromServer = tmp;
        });

        it("Should call __updateRecipientStatus", function() {
            // Setup
            var tmp = Layer.Core.Message.ConversationMessage.prototype.__updateRecipientStatus;
            spyOn(Layer.Core.Message.ConversationMessage.prototype, "__updateRecipientStatus");
            var serverDef = {
                sender: {user_id: "fred"},
                is_unread: true,
                parts: [],
                recipient_status: {
                    "layer:///identities/a": "read"
                },
                id: "layer:///messages/message893",
                conversation: {
                    id: "layer:///conversation/abcde"
                }
            };

            // Run
            var m = client._createObject(serverDef);

            // Posttest
            expect(Layer.Core.Message.ConversationMessage.prototype.__updateRecipientStatus).toHaveBeenCalledWith(serverDef.recipient_status);

            // Restore
            Layer.Core.Message.ConversationMessage.prototype.__updateRecipientStatus = tmp;
        });

        it("Should register the message if from server", function() {
            // Setup
            spyOn(client, "_addMessage");

            // Run
            var m = client._createObject(responses.message2);

            // Posttest
            expect(client._addMessage).toHaveBeenCalledWith(m);
        });

        it("Should register the message if unsent", function() {
            // Setup
            spyOn(client, "_addMessage");

            // Run
            var m = conversation.createMessage({
                parts: "hey"
            });

            // Posttest
            expect(client._addMessage).not.toHaveBeenCalledWith(m);
        });

        it("Should get a conversationId", function() {
            var m = conversation.createMessage({});
            expect(m.conversationId).toEqual(conversation.id);
        });

        it("Should get a channelId", function() {
            var m = channel.createMessage({});
            expect(m.conversationId).toEqual(channel.id);
        });

    });

    describe("The isSaved() isNew() isSaving() isSynced() methods", function() {
      var message;
      beforeEach(function() {
          message = conversation.createMessage({
              parts: [{body: "Hello There", mimeType: "text/plain"}]
          });
      });
      afterEach(function() {
          message.destroy();
      });
      it("Should correctly handle new messages", function() {
        message.syncState = Layer.Constants.SYNC_STATE.NEW;
        expect(message.isNew()).toBe(true);
        expect(message.isSaving()).toBe(false);
        expect(message.isSaved()).toBe(false);
        expect(message.isSynced()).toBe(false);
        expect(message.toObject().isNew).toBe(true);
        expect(message.toObject().isSaving).toBe(false);
        expect(message.toObject().isSaved).toBe(false);
        expect(message.toObject().isSynced).toBe(false);
      });

      it("Should correctly handle sending messages", function() {
        message.syncState = Layer.Constants.SYNC_STATE.SAVING;
        expect(message.isNew()).toBe(false);
        expect(message.isSaving()).toBe(true);
        expect(message.isSaved()).toBe(false);
        expect(message.isSynced()).toBe(false);
        expect(message.toObject().isNew).toBe(false);
        expect(message.toObject().isSaving).toBe(true);
        expect(message.toObject().isSaved).toBe(false);
        expect(message.toObject().isSynced).toBe(false);
      });

      it("Should correctly handle sent messages", function() {
        message.syncState = Layer.Constants.SYNC_STATE.SYNCED;
        expect(message.isNew()).toBe(false);
        expect(message.isSaving()).toBe(false);
        expect(message.isSaved()).toBe(true);
        expect(message.isSynced()).toBe(true);
        expect(message.toObject().isNew).toBe(false);
        expect(message.toObject().isSaving).toBe(false);
        expect(message.toObject().isSaved).toBe(true);
        expect(message.toObject().isSynced).toBe(true);
      });

      it("Should correctly handle out of sync messages", function() {
        message.syncState = Layer.Constants.SYNC_STATE.SYNCING;
        expect(message.isNew()).toBe(false);
        expect(message.isSaving()).toBe(false);
        expect(message.isSaved()).toBe(true);
        expect(message.isSynced()).toBe(false);
        expect(message.toObject().isNew).toBe(false);
        expect(message.toObject().isSaving).toBe(false);
        expect(message.toObject().isSaved).toBe(true);
        expect(message.toObject().isSynced).toBe(false);
      });
    });

    describe("The getConversation() method", function() {
        it("Should return the client", function() {
            var m = new Layer.Core.Message.ConversationMessage({
                conversation: conversation,
            });
            expect(m.getConversation()).toEqual(conversation);
        });

        it("Should load the Conversation", function() {
            var m = new Layer.Core.Message.ConversationMessage({
                conversationId: conversation.id + 'a',
            });
            var c = m.getConversation(true);
            expect(c).toEqual(jasmine.any(Layer.Core.Conversation));
            expect(c.syncState).toEqual(Layer.Constants.SYNC_STATE.LOADING);
            expect(c.isLoading).toBe(true);
        });

        it("Should not load the Conversation", function() {
            var m = new Layer.Core.Message.ConversationMessage({
                conversationId: conversation.id + 'a',
            });
            var c = m.getConversation(false);
            expect(c).toEqual(null);
        });
    });

    describe("The getConversation() method for ChannelMessage", function() {
        it("Should return the client", function() {
            var m = new Layer.Core.Message.ChannelMessage({
                channel: channel,
            });
            expect(m.getConversation()).toEqual(channel);
        });

        it("Should load the channel", function() {
            var m = new Layer.Core.Message.ChannelMessage({
                conversationId: channel.id + 'a',
            });
            var c = m.getConversation(true);
            expect(c).toEqual(jasmine.any(Layer.Core.Channel));
            expect(c.syncState).toEqual(Layer.Constants.SYNC_STATE.LOADING);
            expect(c.isLoading).toBe(true);
        });

        it("Should not load the channel", function() {
            var m = new Layer.Core.Message.ChannelMessage({
                conversationId: conversation.id + 'a',
            });
            var c = m.getConversation(false);
            expect(c).toEqual(null);
        });
    });

    // Tested via constructor so no tests at this time
    describe("The __adjustParts() method", function() {
        var message;
        beforeEach(function() {
            message = new Layer.Core.Message.ChannelMessage({
                parts: [{body: "Hello There", mimeType: "text/plain"}],
            });
        });

        afterEach(function() {
            message.destroy();
        });

        it("Should listen for part changes", function() {
            var part = new Layer.Core.MessagePart({
                body: "ho",
                mimeType: "text/ho"
            });
            spyOn(message, "_onMessagePartChange");
            var parts = new Set();
            parts.add(part);
            message.parts = parts;

            // Run
            part.body = "howdy";
            jasmine.clock().tick(100);
            Layer.Utils.defer.flush();

            // Posttest
            expect(message._onMessagePartChange).toHaveBeenCalled();
        });
    });

    describe("The addPart() method", function() {
        var message;
        beforeEach(function() {
            message = new Layer.Core.Message.ChannelMessage({
                parts: [{body: "Hello There", mimeType: "text/plain"}],
            });
        });

        afterEach(function() {
            message.destroy();
        });

        it("Should add an object part", function() {
            // Pretest
            expect(message.parts.size).toEqual(1);
            var part1 = message.findPart();
            expect(part1).toEqual(jasmine.objectContaining({
                body: "Hello There",
                mimeType: "text/plain",
            }));

            // Run
            message.addPart({
                body: "ho",
                mimeType: "text/ho"
            });
            var part2 = message.findPart(function(part) {return part !== part1});

            // Posttest
            expect(message.parts.size).toEqual(2);
            expect(part2).toEqual(jasmine.objectContaining({
                body: "ho",
                mimeType: "text/ho",
            }));
        });

        it("Should add an instance part", function() {
            // Pretest
            var part1 = message.findPart();
            expect(message.parts.size).toEqual(1);
            expect(part1).toEqual(jasmine.objectContaining({
                body: "Hello There",
                mimeType: "text/plain",
            }));

            // Run
            message.addPart(new Layer.Core.MessagePart({
                body: "ho",
                mimeType: "text/ho"
            }));
            var part2 = message.findPart(function(part) {return part !== part1});

            // Posttest
            expect(message.parts.size).toEqual(2);
            expect(part2).toEqual(jasmine.objectContaining({
                body: "ho",
                mimeType: "text/ho",
            }));
        });

        it("Should listen for part changes", function() {
            var part = new Layer.Core.MessagePart({
                body: "ho",
                mimeType: "text/ho"
            });
            spyOn(message, "_onMessagePartChange");
            message.addPart(part);

            // Run
            part.body = "howdy";
            jasmine.clock().tick(100);
            Layer.Utils.defer.flush();

            // Posttest
            expect(message._onMessagePartChange).toHaveBeenCalled();
        });
    });

    describe("The _onMessagePartChange() method", function() {
        var message;
        beforeEach(function() {
            message = new Layer.Core.Message.ConversationMessage({
                parts: [{body: "Hello There", mimeType: "text/plain"}],
            });
        });
        afterEach(function() {
            message.destroy();
        });

        it("Should trigger message change events when parts change", function() {
            var part = new Layer.Core.MessagePart({
                body: "ho",
                mimeType: "text/ho"
            });
            spyOn(message, "_triggerAsync");
            var parts = new Set();
            parts.add(part);
            message.parts = parts;

            // Run
            part.body = "howdy";
            jasmine.clock().tick(100);
            Layer.Utils.defer.flush();

            // Posttest
            expect(message._triggerAsync).toHaveBeenCalledWith('messages:change', {
                property: 'parts.body',
                oldValue: 'ho',
                newValue: 'howdy',
                part: part
            });
        });
    });

    describe("The _getReceiptStatus() method", function() {
        var message;
        beforeEach(function() {
            message = new Layer.Core.Message.ConversationMessage({
                parts: [{body: "Hello There", mimeType: "text/plain"}],
            });
        });
        afterEach(function() {
            message.destroy();
        });

        it("Should return 4 readCount, 4 deliveredCount ignoring logged in user", function() {
            expect(message._getReceiptStatus({
                "layer:///identities/a": "read",
                "layer:///identities/b": "read",
                "layer:///identities/c": "read",
                "layer:///identities/d": "read",
                "layer:///identities/999": "read"
            }, "layer:///identities/999")).toEqual({
                readCount: 4,
                deliveredCount: 4
            });
        });

        it("Should return 2 readCount, 4 deliveredCount ignoring logged in user", function() {
            expect(message._getReceiptStatus({
                "layer:///identities/a": "delivered",
                "layer:///identities/b": "delivered",
                "layer:///identities/c": "read",
                "layer:///identities/d": "read",
                "layer:///identities/999": "read"
            }, "layer:///identities/999")).toEqual({
                readCount: 2,
                deliveredCount: 4
            });
        });

        it("Should return 3 readCount, 5 deliveredCount if no logged user", function() {
            expect(message._getReceiptStatus({
                "layer:///identities/a": "delivered",
                "layer:///identities/b": "delivered",
                "layer:///identities/c": "read",
                "layer:///identities/d": "read",
                "layer:///identities/999": "read"
            }, "")).toEqual({
                readCount: 3,
                deliveredCount: 5
            });
        });

        it("Should return 0 readCount, 1 deliveredCount ignoring logged in user", function() {
            expect(message._getReceiptStatus({
                "layer:///identities/a": "sent",
                "layer:///identities/b": "delivered",
                "layer:///identities/c": "sent",
                "layer:///identities/d": "sent",
                "layer:///identities/999": "sent"
            }, "layer:///identities/999")).toEqual({
                readCount: 0,
                deliveredCount: 1
            });
        });
    });

    describe("The __getRecipientStatus() method", function() {
      var m;
      beforeEach(function() {
          conversation.participants = [userIdentity1, userIdentity2, userIdentity3, client.user];
          var messageData = JSON.parse(JSON.stringify(responses.message1));

          m = new Layer.Core.Message.ConversationMessage({
              fromServer: messageData,
              conversationId: conversation.id
          });
      });

      afterEach(function() {
          m.destroy();
      });

      it("Should return the participant's value if its not NEW", function() {
        m.recipientStatus = {
            "layer:///identities/a": "sent",
            "layer:///identities/b": "delivered",
            "layer:///identities/d": "read",
            "layer:///identities/999": "read"
          };
        expect(m.recipientStatus["layer:///identities/b"]).toEqual(Layer.Constants.RECEIPT_STATE.DELIVERED);
        expect(Layer.Constants.RECEIPT_STATE.DELIVERED.length > 0).toBe(true);
      });

      it("Should return {} for a new Message with no Conversation", function() {
        m.conversationId = '';
        m.__recipientStatus = null;
        expect(m.recipientStatus).toEqual({});
      });

      it("Should return PENDING for users who have not yet been sent the Message", function() {
        m.recipientStatus = {};
        expect(m.recipientStatus).toEqual({
          "layer:///identities/1": Layer.Constants.RECEIPT_STATE.PENDING,
          "layer:///identities/2": Layer.Constants.RECEIPT_STATE.PENDING,
          "layer:///identities/3": Layer.Constants.RECEIPT_STATE.PENDING,
          "layer:///identities/999": Layer.Constants.RECEIPT_STATE.READ
        });
        expect(Layer.Constants.RECEIPT_STATE.PENDING.length > 0).toBe(true);
      });
    });

    describe("The __updateRecipientStatus() method", function() {
        var m;
        beforeEach(function() {
            conversation.participants = [userIdentity1, userIdentity2, userIdentity3, client.user];
            var messageData = JSON.parse(JSON.stringify(responses.message1));
            messageData.recipient_status = {
              "layer:///identities/a": "sent",
              "layer:///identities/b": "delivered",
              "layer:///identities/d": "read",
              "layer:///identities/999": "read"
            };
            m = new Layer.Core.Message.ConversationMessage({
              conversationId: conversation.id,
              fromServer: messageData
          });
        });

        afterEach(function() {
            m.destroy();
        });

        it("Should allow the recipientStatus property to update", function() {
            // Run
            m.recipientStatus = {
                "layer:///identities/z": "sent"
            };

            // Posttest
            expect(m.recipientStatus).toEqual({
              "layer:///identities/z": "sent",
              "layer:///identities/1": "pending",
              "layer:///identities/2": "pending",
              "layer:///identities/3": "pending",
              "layer:///identities/999": "read"
            });
        });

        it("Should set isRead/isUnread", function() {
            // Setup
            m.isRead = false;

            // Pretest
            expect(m.isRead).toEqual(false);
            expect(m.isUnread).toEqual(true);

            // Run
            m.recipientStatus = {"layer:///identities/999": "read"};

            // Posttest
            expect(m.isRead).toEqual(true);
            expect(m.isUnread).toEqual(false);
        });

        it("Should not call _setReceiptStatus and should instead schedule it to be done once the Conversation is loaded", function() {
            // Pretest
            m.deliveryStatus = '';
            m.readStatus = '';
            conversation.syncState = Layer.Constants.SYNC_STATE.LOADING;

            // Run 1
            m.recipientStatus = {"layer:///identities/999": "read"};

            // Posttest
            expect(m.deliveryStatus).toEqual('');
            expect(m.readStatus).toEqual('');

            // Run 2
            conversation.trigger('conversations:loaded');
            Layer.Utils.defer.flush();

            // Posttest
            expect(m.deliveryStatus).toEqual(Layer.Constants.RECIPIENT_STATE.NONE);
            expect(m.readStatus).toEqual(Layer.Constants.RECIPIENT_STATE.NONE);
        });

        it("Should call _setReceiptStatus", function() {
            // Setup
            spyOn(m, "_setReceiptStatus");

            // Run
            m.recipientStatus = {
                "layer:///identities/999": "read",
                "layer:///identities/a": "sent",
                "layer:///identities/b": "delivered",
                "layer:///identities/c": "read"
            };

            // Posttest
            expect(m._setReceiptStatus).toHaveBeenCalledWith(1, 2, 3);
        });

        it("Should trigger change events if this user was sender and another users status changes", function() {
            // Setup
            spyOn(m, "_triggerAsync");
            m.sender = client.user;
            m.__recipientStatus = {
                "layer:///identities/999": "read",
                "layer:///identities/a": "sent",
                "layer:///identities/b": "delivered",
                "layer:///identities/c": "delivered"
            };
            m.__recipientStatus[client.user.id] = "read";
            var oldValue = m.__recipientStatus;

            // Run
            m.recipientStatus = {
                "layer:///identities/999": "read",
                "layer:///identities/a": "sent",
                "layer:///identities/b": "delivered",
                "layer:///identities/c": "read"
            };

            // Posttest
            expect(m._triggerAsync).toHaveBeenCalledWith("messages:change", {
                oldValue: oldValue,
                newValue: {
                    "layer:///identities/999": "read",
                    "layer:///identities/a": "sent",
                    "layer:///identities/b": "delivered",
                    "layer:///identities/c": "read"
                },
                property: "recipientStatus"
            })
        });

        it("Should not trigger change events if this user was NOT sender and another users status changes", function() {
            // Setup
            spyOn(m, "_triggerAsync");
            m.sender.__userId = 'a';
            m.__recipientStatus = {
                "layer:///identities/999": "read",
                "layer:///identities/a": "sent",
                "layer:///identities/b": "delivered",
                "layer:///identities/c": "delivered"
            };
            m.__recipientStatus[client.user.id] = "read";
            var oldValue = m.__recipientStatus;

            // Run
            m.recipientStatus = {
                "layer:///identities/999": "read",
                "layer:///identities/a": "sent",
                "layer:///identities/b": "delivered",
                "layer:///identities/c": "read"
            };

            // Posttest
            expect(m._triggerAsync).not.toHaveBeenCalled();
        });

        it("Should trigger change events if this user was not the sender and this users status changes to read", function() {
            // Setup
            spyOn(m, "_triggerAsync");
            m.sender.__userId = 'a';
            m.__recipientStatus = {
                "layer:///identities/999": "read",
                "layer:///identities/a": "sent",
                "layer:///identities/b": "delivered",
                "layer:///identities/c": "delivered"
            };
            m.__recipientStatus[client.user.id] = "delivered";
            var oldValue = m.__recipientStatus;

            var newValue = JSON.parse(JSON.stringify(oldValue));
            newValue[client.user.id] = "read";

            // Run
            m.recipientStatus = newValue;

            // Posttest
            expect(m._triggerAsync).toHaveBeenCalledWith("messages:change", {
                oldValue: oldValue,
                newValue: newValue,
                property: "recipientStatus"
            })
        });

        it("Should not trigger change events if this user was sender and this users status changes to delivered", function() {
            // Setup
            spyOn(m, "_triggerAsync");
            m.sender.__userId = 'a';
            m.__recipientStatus = {
                "layer:///identities/999": "read",
                "layer:///identities/a": "sent",
                "layer:///identities/b": "delivered",
                "layer:///identities/c": "delivered"
            };
            m.__recipientStatus[client.user.id] = "sent";
            var oldValue = m.__recipientStatus;

            var newValue = JSON.parse(JSON.stringify(oldValue));
            newValue[client.user.userId] = "delivered";

            // Run
            m.recipientStatus = newValue;

            // Posttest
            expect(m._triggerAsync).not.toHaveBeenCalled();
        });
    });

    describe("The _setReceiptStatus() method", function() {
        var m;
        beforeEach(function() {
            conversation.participants = [userIdentity1, userIdentity2, userIdentity3, client.user];
            m = new Layer.Core.Message.ConversationMessage({
                parts: "hello",
                conversation: conversation,
            });
        });

        afterEach(function() {
            m.destroy();
        });

        it("Should set deliveryStatus to none", function() {
            // Pretest
            m.deliveryStatus = Layer.Constants.RECIPIENT_STATE.SOME;

            // Run
            m._setReceiptStatus(0, 0, 10)

            // Posttest
            expect(m.deliveryStatus).toEqual(Layer.Constants.RECIPIENT_STATE.NONE);
        });

        it("Should set deliveryStatus to some", function() {
            // Pretest
            m.deliveryStatus = Layer.Constants.RECIPIENT_STATE.NONE;

            // Run
            m._setReceiptStatus(0, 3, 10)

            // Posttest
            expect(m.deliveryStatus).toEqual(Layer.Constants.RECIPIENT_STATE.SOME);
        });

        it("Should set deliveryStatus to some if read", function() {
            // Pretest
            m.deliveryStatus = Layer.Constants.RECIPIENT_STATE.NONE;

            // Run
            m._setReceiptStatus(3, 3, 10)

            // Posttest
            expect(m.deliveryStatus).toEqual(Layer.Constants.RECIPIENT_STATE.SOME);
        });

        it("Should set deliveryStatus to all", function() {
            // Pretest
            m.deliveryStatus = Layer.Constants.RECIPIENT_STATE.NONE;

            // Run
            m._setReceiptStatus(0, 10, 10)

            // Posttest
            expect(m.deliveryStatus).toEqual(Layer.Constants.RECIPIENT_STATE.ALL);
        });



        it("Should set readStatus to none", function() {
            // Pretest
            m.readStatus = Layer.Constants.RECIPIENT_STATE.SOME;

            // Run
            m._setReceiptStatus(0, 3, 10)

            // Posttest
            expect(m.readStatus).toEqual(Layer.Constants.RECIPIENT_STATE.NONE);
        });

        it("Should set readStatus to some", function() {
            // Pretest
            m.readStatus = Layer.Constants.RECIPIENT_STATE.NONE;

            // Run
            m._setReceiptStatus(3, 5, 10)

            // Posttest
            expect(m.readStatus).toEqual(Layer.Constants.RECIPIENT_STATE.SOME);
        });

        it("Should set readStatus to none if delivered", function() {
            // Pretest
            m.readStatus = Layer.Constants.RECIPIENT_STATE.SOME;

            // Run
            m._setReceiptStatus(0, 10, 10)

            // Posttest
            expect(m.readStatus).toEqual(Layer.Constants.RECIPIENT_STATE.NONE);
        });

        it("Should set readStatus to all", function() {
            // Pretest
            m.readStatus = Layer.Constants.RECIPIENT_STATE.NONE;

            // Run
            m._setReceiptStatus(10, 10, 10)

            // Posttest
            expect(m.readStatus).toEqual(Layer.Constants.RECIPIENT_STATE.ALL);
        });
    });

    describe("The _triggerMessageRead() method", function() {
        var m;
        beforeEach(function() {
            m = conversation.createMessage("hello");
            m.isRead = false;
            jasmine.clock().tick(1);
            Layer.Utils.defer.flush();
        });

        afterEach(function() {
            m.destroy();
        });

        it("Should trigger a single change event with two changes", function() {
          var result;
          m.on('messages:change', function(evt) {
            result = evt;
          });
          m.__isRead = true;

          // Run
          m._triggerMessageRead();
          jasmine.clock().tick(10);
          Layer.Utils.defer.flush();

          // Posttest
          expect(result).toEqual(jasmine.objectContaining({
            eventName: "messages:change",
            changes: [{
              property: 'isRead',
              oldValue: false,
              newValue: true
            }, {
             property: 'isUnread',
              oldValue: true,
              newValue: false
            }]
          }));
        });
    });

    describe("The __updateIsRead() method", function() {
        var m;
        beforeEach(function() {
            m = conversation.createMessage("hello");
            m.isRead = false;
            jasmine.clock().tick(1);
            Layer.Utils.defer.flush();
        });

        afterEach(function() {
            m.destroy();
        });

        it("Should send a read receipt if changed to true", function() {
            // Setup
            spyOn(m, "_sendReceipt");

            // Run
            m.isRead = true;

            // Posttest
            expect(m._sendReceipt).toHaveBeenCalledWith("read");
        });

        it("Should trigger messages:change if changed to true", function() {
            // Setup
            spyOn(m, "_triggerAsync");

            // Run
            m.isRead = true;

            // Posttest
            expect(m._triggerAsync).toHaveBeenCalledWith("messages:change", {
              property: 'isRead',
              oldValue: false,
              newValue: true
            });
            expect(m._triggerAsync).toHaveBeenCalledWith("messages:change", {
              property: 'isUnread',
              oldValue: true,
              newValue: false
            });
        });

        it("Should do nothing if already true", function() {
            // Setup
            m.isRead = true;
            spyOn(m, "sendReceipt");

            // Run
            m.isRead = true;

            // Posttest
            expect(m.sendReceipt).not.toHaveBeenCalled();
        });

        it("Should do nothing if changed to false", function() {
            // Setup
            m.isRead = true;
            spyOn(m, "sendReceipt");
            spyOn(m, "_triggerAsync");

            // Run
            m.isRead = false;

            // Posttest
            expect(m.sendReceipt).not.toHaveBeenCalled();
            expect(m._triggerAsync).not.toHaveBeenCalled();
        });

        it("Should update isUnread", function() {
            // Pretest
            expect(m.isUnread).toEqual(true);

            // Run
            m.isRead = true;

            // Posttest
            expect(m.isUnread).toEqual(false);
        });

        it("Should update conversation unreadCount", function() {
          conversation.unreadCount = 5;
          m.isRead = true;
          expect(conversation.unreadCount).toEqual(4);
          m.isRead = true;
          expect(conversation.unreadCount).toEqual(4);
        });

        it("Should not send read receipts if conversation is in markAllAsRead", function() {
            // Setup
            spyOn(m, "_sendReceipt");
            m.getConversation()._inMarkAllAsRead = true;

            // Run
            m.isRead = true;

            // Posttest
            expect(m._sendReceipt).not.toHaveBeenCalledWith("read");
        });
    });

    describe("The sendReceipt() method", function() {
        var m;
        beforeEach(function() {
            m = conversation.createMessage("hello");
        });

        afterEach(function() {
            m.destroy();
        });

        it("Should call _xhr", function() {
            // Setup
            spyOn(m, "_xhr");

            // Run
            m.sendReceipt("delivery");

            // Posttest
            expect(m._xhr).toHaveBeenCalledWith({
                  url: '/receipts',
                  method: 'POST',
                  data: {
                    type: "delivery"
                  },
                  sync: {
                    // This should not be treated as a POST/CREATE request on the Message
                    operation: 'RECEIPT',
                  },
                },
                jasmine.any(Function)
            );
        });

        it("Should not call _xhr if not a participant", function() {
            conversation.participants = [];
            spyOn(m, "_xhr");
            m.sendReceipt("delivery");
            expect(m._xhr).not.toHaveBeenCalled();
        });

        it("Should call _setSyncing", function() {
            // Setup
            spyOn(m, "_setSyncing");

            // Run
            m.sendReceipt("delivery");

            // Posttest
            expect(m._setSyncing).toHaveBeenCalled();
        });

        it("Should call _setSynced", function() {
            // Setup
            spyOn(m, "_setSynced");

            // Run
            m.sendReceipt("delivery");
            requests.mostRecent().response({
                status: 204
            });

            // Posttest
            expect(m._setSynced).toHaveBeenCalled();
        });

        it("Should set isRead and isUnread", function() {
            m.isRead = false;
            expect(m.isRead).toBe(false);
            expect(m.isUnread).toBe(true);

            // Run
            m.sendReceipt("read");

            // Posttest
            expect(m.isRead).toBe(true);
            expect(m.isUnread).toBe(false);
        });

        it("Should trigger messages:change event on sending read receipt", function() {
            m.isRead = false;
            spyOn(m, "_triggerAsync");

            // Run
            m.sendReceipt("read");

            // Posttest
            expect(m._triggerAsync).toHaveBeenCalledWith("messages:change", {
              property: 'isRead',
              oldValue: false,
              newValue: true
            });
            expect(m._triggerAsync).toHaveBeenCalledWith("messages:change", {
              property: 'isUnread',
              oldValue: true,
              newValue: false
            });
        });

        it("Should do nothing if isRead is true", function() {
            m.isRead = true;
            spyOn(m, "_xhr");
            spyOn(m, "_triggerAsync");

            // Run
            m.sendReceipt("read");

            // Posttest
            expect(m._xhr).not.toHaveBeenCalled();
            expect(m._triggerAsync).not.toHaveBeenCalled();
        });

        it("Should do nothing if channelId has a value", function() {
            m.isRead = true;
            m.conversationId = channel.id;
            delete m.conversationId;
            spyOn(m, "_xhr");
            spyOn(m, "_triggerAsync");

            // Run
            m.sendReceipt("read");

            // Posttest
            expect(m._xhr).not.toHaveBeenCalled();
            expect(m._triggerAsync).not.toHaveBeenCalled();
        });

        it("Should not set isRead and isUnread if delivery receipt", function() {
            m.isRead = false;
            expect(m.isRead).toBe(false);
            expect(m.isUnread).toBe(true);

            // Run
            m.sendReceipt("delivery");

            // Posttest
            expect(m.isRead).toBe(false);
            expect(m.isUnread).toBe(true);
        });
    });

    describe("The presend() method", function() {
        var m;
        beforeEach(function() {
            m = conversation.createMessage("hello");
        });

        afterEach(function() {
            m.destroy();
        });

        it("Should fail if conversationId is missing", function() {
            delete m.conversationId;

            // Run
            expect(function() {
                m.presend();
            }).toThrowError(Layer.Core.LayerError.ErrorDictionary.conversationMissing);
        });


        it("Should fail if its sending or sent", function() {
            m._setSyncing();
            expect(function() {
                m.presend();
            }).toThrowError(Layer.Core.LayerError.ErrorDictionary.alreadySent);

            m._setSynced();
            expect(function() {
                m.presend();
            }).toThrowError(Layer.Core.LayerError.ErrorDictionary.alreadySent);
        });


        it("Should not call _setSyncing", function() {
            spyOn(m, "_setSyncing");
            m.presend();
            expect(m._setSyncing).not.toHaveBeenCalledWith();
        });

        it("Should register the message after readAllBlobs completes", function() {
            // Setup
            var isRegistered = false;
            spyOn(m, "_readAllBlobs").and.callThrough();
            spyOn(client, "_addMessage");

            // Run
            m.presend();

            // Posttest
            expect(client._addMessage).toHaveBeenCalledWith(m);
            expect(m._readAllBlobs).toHaveBeenCalledWith(jasmine.any(Function));
        });

        it("Should call conversation._setupMessage", function() {
            spyOn(conversation, "_setupMessage");
            m.presend();
            expect(conversation._setupMessage).toHaveBeenCalledWith(m);
        });
    });


    describe("The send() method", function() {
        var m;
        beforeEach(function() {
            m = conversation.createMessage("hello");
        });

        afterEach(function() {
            m.destroy();
        });

        it("Should fail if conversationId is missing", function() {
            delete m.conversationId;

            // Run
            expect(function() {
                m.send();
            }).toThrowError(Layer.Core.LayerError.ErrorDictionary.conversationMissing);
        });

        it("Should load Conversation if missing", function() {
            client._removeConversation(client.getConversation(m.conversationId));
            expect(client.getConversation(m.conversationId)).toBe(null);

            // Run
             m.send();
            var conversation = client.getConversation(m.conversationId);
            expect(conversation).toEqual(jasmine.any(Layer.Core.Conversation));
            expect(conversation.isLoading).toBe(true);
        });

        it("Should delay if Conversation is loading but call _setupMessage", function() {
            var conversation = m.getConversation();
            conversation.syncState = Layer.Constants.SYNC_STATE.LOADING;
            spyOn(conversation, "once");
            spyOn(conversation, "_setupMessage");

            // Run
            m.send("argh");
            expect(conversation.once).toHaveBeenCalledWith('conversations:loaded', jasmine.any(Function));
            expect(conversation._setupMessage).toHaveBeenCalledWith(m);

            // Second test
            spyOn(m, "send");
            conversation.once.calls.allArgs()[0][1]();

            expect(m.send).toHaveBeenCalledWith("argh");
        });

        it("Should fail if its sending or sent", function() {
            m._setSyncing();
            expect(function() {
                m.send();
            }).toThrowError(Layer.Core.LayerError.ErrorDictionary.alreadySent);

            m._setSynced();
            expect(function() {
                m.send();
            }).toThrowError(Layer.Core.LayerError.ErrorDictionary.alreadySent);
        });

        it("Should fail if there are no parts", function() {
            m.parts = new Set();
            expect(function() {
                m.send();
            }).toThrowError(Layer.Core.LayerError.ErrorDictionary.partsMissing);
        });

        it("Should call _setSyncing", function() {
            spyOn(m, "_setSyncing");
            m.send();
            expect(m._setSyncing).toHaveBeenCalledWith();
        });

        it("Should register the message after calling conversation.send", function() {
            // Setup
            var isRegistered = false;
            spyOn(conversation, "send").and.callFake(function() {
                expect(isRegistered).toBe(false);
            });
            spyOn(client, "_addMessage").and.callFake(function() {
                isRegistered = true;
            });

            // Run
            m.send();

            // Posttest
            expect(client._addMessage).toHaveBeenCalledWith(m);
            expect(conversation.send).toHaveBeenCalledWith(m);
        });

        it("Should call _preparePartsForSending with no notification property", function() {
            spyOn(m, "_preparePartsForSending");
            m.send();
            expect(m._preparePartsForSending).toHaveBeenCalledWith({
                parts: new Array(1),
                id: m.id
            });
        });

        it("Should call _preparePartsForSending with a notification property", function() {
            spyOn(m, "_preparePartsForSending");
            m.send({
                sound: "doh.aiff",
                text: "Doh!",
                title: "um?"
            });
            expect(m._preparePartsForSending).toHaveBeenCalledWith({
                parts: new Array(1),
                id: m.id,
                notification: {
                    sound: "doh.aiff",
                    text: "Doh!",
                    title: "um?"
                }
            });
        });

        it("Should set sender", function() {
            // Setup
            spyOn(client, "sendSocketRequest");

            // Run
            m.send();

            // Posttest
            expect(m.sender).toBe(client.user);
        });

        it("Should trigger messages:sending", function() {
            // Setup
            spyOn(m, "trigger").and.callThrough();
            spyOn(client, "sendSocketRequest");

            // Run
            m.send();
            jasmine.clock().tick(1);
            Layer.Utils.defer.flush();

            // Posttest
            expect(m.trigger).toHaveBeenCalledWith("messages:sending", {
                notification: undefined,
                cancelable: true,
            });
        });

        it("Should allow canceling sending using messages:sending", function() {
            // Setup
            m.on('messages:sending', function(evt) {evt.cancel();});
            spyOn(client, "sendSocketRequest");
            spyOn(m, "_preparePartsForSending");

            // Run
            m.send();
            jasmine.clock().tick(1);
            Layer.Utils.defer.flush();

            // Posttest
            expect(m._preparePartsForSending).not.toHaveBeenCalled();
        });

        it("Should allow uncanceled sending of the message", function() {
            // Setup
            spyOn(client, "sendSocketRequest");
            spyOn(m, "_preparePartsForSending");

            // Run
            m.send();
            jasmine.clock().tick(1);
            Layer.Utils.defer.flush();

            // Posttest
            expect(m._preparePartsForSending).toHaveBeenCalled();
        });

        it("Should call _readAllBlobs and only add the Message after reading is done", function(done) {
            spyOn(m, "_readAllBlobs").and.callFake(function(callback) {
                expect(client.getMessage(m.id)).toBe(null);
                callback();
                expect(client.getMessage(m.id)).toBe(m);
                done();
            });
            m.send();
        });
    });

    describe("The _readAllBlobs() method", function() {
        var m;
        beforeEach(function() {
            m = conversation.createMessage("hello");
            m.addPart({body: "there", mimeType: "text/plain"});
        });

        it("Should call the callback if All parts are text", function() {
            var isDone;
            m._readAllBlobs(function() {
                isDone = true;
            });
            expect(isDone).toBe(true);
        });

        it("Should call the _fetchTextFromFile on each Textual Blob", function(done) {
            var blob0 = new Blob([new Array(Layer.Core.DbManager.MaxPartSize + 10).join('a')], {type : 'text/plain'});
            var blob1 = new Blob([new Array(Layer.Core.DbManager.MaxPartSize + 10).join('b')], {type : 'text/markdown'});
            var blob2 = new Blob([new Array(Layer.Core.DbManager.MaxPartSize + 10).join('c')], {type : 'image/png'});


            m = conversation.createMessage({
                parts: [
                    {
                        body: blob0,
                        mimeType: 'text/plain'
                    },
                    {
                        body: blob1,
                        mimeType: 'text/markdown'
                    },
                    {
                        body: blob2,
                        mimeType: 'image/png'
                    },
                    {
                        body: "hey",
                        mimeType: "text/plain"
                    }
                ]
            });

            var fetchTextFromFile  = Layer.Utils.fetchTextFromFile;
            spyOn(layer.Utils, "fetchTextFromFile").and.callThrough();


            m._readAllBlobs(function() {
                Layer.Utils.fetchTextFromFile.calls.allArgs().forEach(function(callData) {
                    expect(callData[1]).toEqual(jasmine.any(Function));
                });
                expect(Layer.Utils.fetchTextFromFile.calls.allArgs()[0][0].type).toEqual('text/plain');
                expect(Layer.Utils.fetchTextFromFile.calls.allArgs()[1][0].type).toEqual('text/markdown');
                expect(Layer.Utils.fetchTextFromFile.calls.allArgs().length).toEqual(2);
                Layer.Utils.fetchTextFromFile = fetchTextFromFile;
                done();
            });
        });
    });

    describe("The _preparePartsForSending() method", function() {
        var m;
        beforeEach(function() {
            m = conversation.createMessage("hello");
            m.addPart({body: "there", mimeType: "text/plain"});
        });

        afterEach(function() {
            m.destroy();
        });

        it("Should call parts.send on all parts", function() {
            // Setup
            var parts = m.filterParts();
            spyOn(parts[0], "_send");
            spyOn(parts[1], "_send");

            // Run
            m._preparePartsForSending({
              parts: [null, null],
              id: "fred"
            });

            // Posttest
            expect(parts[0]._send).toHaveBeenCalledWith();
            expect(parts[1]._send).toHaveBeenCalledWith();
        });

        it("Should copy in part data on receiving a parts:send event and call send", function() {
            // Setup
            spyOn(m, "_send");
            var parts = m.filterParts();
            spyOn(parts[0], "_send");
            spyOn(parts[1], "_send");

            // Run
            m._preparePartsForSending({
              parts: [null, null],
              id: m.id
            });
            parts[0].trigger("parts:send", {
                mime_type: "actor/mime",
                body: "I am a Mime",
                id: "parta",
            });
            parts[1].trigger("parts:send", {
                mime_type: "actor/mimic",
                body: "I am a Mimic",
                id: "partb",
            });

            // Posttest
            expect(m._send).toHaveBeenCalledWith({
                id: m.id,
                parts: [{
                    mime_type: "actor/mime",
                    body: "I am a Mime",
                    id: "parta",
                }, {
                    mime_type: "actor/mimic",
                    body: "I am a Mimic",
                    id: "partb",
                }]
            });
        });
    });

    describe("The _send() method", function() {
        var m;
        beforeEach(function() {
            m = conversation.createMessage("hello");
            m.addPart({body: "there", mimeType: "text/plain"});
        });

        afterEach(function() {
            m.destroy();
        });


        it("Should call sendSocketRequest", function() {
            // Setup
            spyOn(client, "sendSocketRequest");

            // Run
            m._send({
                parts: [{
                    mime_type: "actor/mime",
                    body: "I am a Mime"
                }],
                notification: {
                  text: "Hey"
                }
            });

            // Posttest
            expect(client.sendSocketRequest)
              .toHaveBeenCalledWith({
                  method: 'POST',
                  body: {
                    method: 'Message.create',
                    object_id: conversation.id,
                    data: {
                      parts: [{
                        mime_type: "actor/mime",
                        body: "I am a Mime"
                      }],
                      notification: {
                        text: "Hey"
                      }
                    }
                  },
                  sync: {
                    target: m.id,
                    depends: jasmine.arrayContaining([m.conversationId, m.id])
                  }
                }, jasmine.any(Function));
        });

        it("SHould call _sendResult on completion", function() {
            // Setup
            var result = {};
            spyOn(client, "sendSocketRequest").and.callFake(function(options, callback) {
                callback(true, result);
            });
            spyOn(m, "_sendResult");

            // Run
            m._send({
                parts: [{
                    mime_type: "actor/mime",
                    body: "I am a Mime"
                }],
                notification: {
                  text: "Hey"
                }
            });

            // Posttest
            expect(m._sendResult).toHaveBeenCalledWith(true, result);
        });
    });

    describe("The _getSendData() method", function() {
      var m;
      beforeEach(function() {
          m = conversation.createMessage("hello");
          m.addPart({body: "there", mimeType: "text/plain"});
      });

      afterEach(function() {
          m.destroy();
      });
      it("Should update the Conversation ID of a create request", function() {
        m.conversationId = "new id";
        expect(m._getSendData({
          method: 'Message.create',
          object_id: conversation.id,
          data: {
            parts: [{
              mime_type: "actor/mime",
              body: "I am a Mime"
            }],
            notification: {
              text: "Hey"
            }
          }
        })).toEqual({
          method: 'Message.create',
          object_id: 'new id',
          data: {
            parts: [{
              mime_type: "actor/mime",
              body: "I am a Mime"
            }],
            notification: {
              text: "Hey"
            }
          }
        });
      });
    });

    describe("The _getSendData() method", function() {
      var m;
      beforeEach(function() {
          m = conversation.createMessage("hello");
          m.addPart({body: "there", mimeType: "text/plain"});
      });

      afterEach(function() {
          m.destroy();
      });
      it("Should update the Conversation ID of a create request", function() {
        m.conversationId = "new id";
        expect(m._getSendData({
          method: 'Message.create',
          object_id: conversation.id,
          data: {
            parts: [{
              mime_type: "actor/mime",
              body: "I am a Mime"
            }],
            notification: {
              text: "Hey"
            }
          }
        })).toEqual({
          method: 'Message.create',
          object_id: 'new id',
          data: {
            parts: [{
              mime_type: "actor/mime",
              body: "I am a Mime"
            }],
            notification: {
              text: "Hey"
            }
          }
        });
      });
    });

    describe("The _sendResult() method", function() {
        var m;
        beforeEach(function() {
            m = conversation.createMessage("hello");
        });

        afterEach(function() {
            if (!m.isDestroyed) m.destroy();
        });

        it("Should call _setSynced", function() {
            // Setup
            spyOn(m, "_setSynced");

            // Run
            m._sendResult({success: false});

            // Posttest
            expect(m._setSynced).toHaveBeenCalled();
        });

        it("Should trigger messages:sent-error and then destroy", function() {
            // Setup
            spyOn(m, "trigger");
            spyOn(m, "destroy");

            // Run
            m._sendResult({
                success: false,
                data: "Doh!"
            });

            // Posttest
            expect(m.trigger).toHaveBeenCalledWith("messages:sent-error", { error: "Doh!" });
            expect(m.destroy).toHaveBeenCalled();
        });

        it("Should call _populateFromServer", function() {
            // Setup
            spyOn(m, "_populateFromServer");

            // Run
            m._sendResult({
                success: true,
                data: "hey"
            });

            // Posttest
            expect(m._populateFromServer).toHaveBeenCalledWith("hey");
        });

        it("Should trigger messages:sent", function() {
            // Setup
            spyOn(m, "_triggerAsync");
            spyOn(m, "_populateFromServer");

            // Run
            m._sendResult({
                success: true,
                data: "hey"
            });

            // Posttest
            expect(m._triggerAsync).toHaveBeenCalledWith("messages:sent");
        });

        it("Should do nothing if isDestroyed", function() {
            // Setup
            spyOn(m, "_triggerAsync");
            spyOn(m, "_populateFromServer");
            m.isDestroyed = true;

            // Run
            m._sendResult({
                success: true,
                data: "hey"
            });

            // Posttest
            expect(m._triggerAsync).not.toHaveBeenCalled();
            expect(m._populateFromServer).not.toHaveBeenCalled();
        });
    });

    describe("The on() method", function() {
        var m;
        beforeEach(function() {
            m = conversation.createMessage("hello");
        });

        afterEach(function() {
            m.destroy();
        });

        it("Should call any callbacks if subscribing to conversations:loaded", function() {
            // Setup
            m.syncState = Layer.Constants.SYNC_STATE.SYNCED;
            var spy = jasmine.createSpy("spy");

            // Run
            m.on("messages:loaded", spy);
            jasmine.clock().tick(10);

            // Posttest
            expect(spy).toHaveBeenCalled();
        });

        it("Should call any callbacks if subscribing to ms:loaded via object", function() {
            // Setup
            m.syncState = Layer.Constants.SYNC_STATE.SYNCED;
            var spy = jasmine.createSpy("spy");

            // Run
            m.on({
                "messages:loaded": spy
            });
            jasmine.clock().tick(10);
            Layer.Utils.defer.flush();

            // Posttest
            expect(spy).toHaveBeenCalled();
        });
    });

    describe("The delete() methods", function() {
        var m;
        beforeEach(function() {
            m = conversation.createMessage("hello");
            m.syncState = Layer.Constants.SYNC_STATE.SYNCED;
            jasmine.clock().tick(1);
            Layer.Utils.defer.flush();
        });

        afterEach(function() {
            if (!m.isDestroyed) m.destroy();
        });

        it("Should fail if already deleting", function() {
            // Setup
            m.delete(Layer.Constants.DELETION_MODE.ALL);

            // Run
            expect(function() {
                m.delete();
            }).toThrowError(Layer.Core.LayerError.ErrorDictionary.isDestroyed);
        });

        it("Should fail if invalid deletion mode", function() {
            // Run
            expect(function() {
                m.delete(false);
            }).toThrowError(Layer.Core.LayerError.ErrorDictionary.deletionModeUnsupported);
        });


        it("Should call _xhr for ALL", function() {
            // Setup
            spyOn(m, "_xhr");

            // Run
            m.delete(Layer.Constants.DELETION_MODE.ALL);

            // Posttest
            expect(m._xhr).toHaveBeenCalledWith({
                url: '?mode=all_participants',
                method: 'DELETE'
            }, jasmine.any(Function));
        });

        it("Should treat true as ALL for backwards compatibility", function() {
            // Setup
            spyOn(m, "_xhr");

            // Run
            m.delete(true);

            // Posttest
            expect(m._xhr).toHaveBeenCalledWith({
                url: '?mode=all_participants',
                method: 'DELETE'
            }, jasmine.any(Function));
        });

        it("Should call _xhr for my_devices if MY_DEVICES", function() {
            // Setup
            spyOn(m, "_xhr");

            // Run
            m.delete(Layer.Constants.DELETION_MODE.MY_DEVICES);

            // Posttest
            expect(m._xhr).toHaveBeenCalledWith({
                url: '?mode=my_devices',
                method: 'DELETE'
            }, jasmine.any(Function));
        });

        it("Should trigger messages:delete", function() {
            // Setup
            spyOn(m, "trigger");

            // Run
            m.delete(Layer.Constants.DELETION_MODE.ALL);

            // Posttest
            expect(m.trigger).toHaveBeenCalledWith("messages:delete");
        });

        it("Should destroy the message", function() {

            // Run
            m.delete(Layer.Constants.DELETION_MODE.ALL);

            // Posttest
            expect(m.isDestroyed).toBe(true);
        });

        it("Should load a new copy if deletion fails from something other than not_found", function() {
          var tmp = Layer.Core.Message.load;
          spyOn(Layer.Core.Message, "load");
          spyOn(m, "_xhr").and.callFake(function(args, callback) {
            callback({success: false});
          });


          // Run
          m.delete(Layer.Constants.DELETION_MODE.ALL);

          // Posttest
          expect(m.isDestroyed).toBe(true);
          expect(Layer.Core.Message.load).toHaveBeenCalledWith(m.id);

          // Cleanup
          Layer.Core.Message.load = tmp;
        })

        it("Should NOT load a new copy if deletion fails from not_found", function() {
          var tmp = Layer.Core.Message.load;
          spyOn(Layer.Core.Message, "load");
          spyOn(m, "_xhr").and.callFake(function(args, callback) {
            callback({success: false, data: {id: 'not_found'}});
          });


          // Run
          m.delete(Layer.Constants.DELETION_MODE.ALL);

          // Posttest
          expect(m.isDestroyed).toBe(true);
          expect(Layer.Core.Message.load).not.toHaveBeenCalled();

          // Cleanup
          Layer.Core.Message.load = tmp;
        });

        it("Should ignore mode for channels", function() {
            // Setup
            var m = channel.createMessage({});
            spyOn(m, "_xhr");

            // Run
            m.delete();

            // Posttest
            expect(m._xhr).toHaveBeenCalledWith({
                url: '',
                method: 'DELETE'
            }, jasmine.any(Function));
        });
    });

    describe("The destroy() method", function() {
        var m;
        beforeEach(function() {
            m = conversation.createMessage("hello");
            m.addPart({
                body: "Hey",
                mimeType: "text/plain"
            });
            m.send();
            jasmine.clock().tick(1);
            Layer.Utils.defer.flush();
        });

        afterEach(function() {
            if (!m.isDestroyed) m.destroy();
        });

        it("Should destroy all parts", function() {
            // Setup
            var parts = m.filterParts();
            var p1 = parts[0];
            var p2 = parts[1];

            // Pretest
            expect(p1.isDestroyed).toBe(false);

            // Run
            m.destroy();

            // Posttest
            expect(p1.isDestroyed).toBe(true);
            expect(p2.isDestroyed).toBe(true);
            expect(m.parts).toBe(null);
        });

        it("Should remove itself from the client", function() {
            // Setup
            spyOn(client, "_removeMessage");

            // Pretest
            expect(client.getMessage(m.id)).toBe(m);

            // Run
            m.destroy();

            // Posttest
            expect(client._removeMessage).toHaveBeenCalledWith(m);

            // Cleanup
            delete client._models.messages[m.id];
        });

        it("Should trigger destroy", function() {
            // Setup
            var spy = jasmine.createSpy('spy');
            m.on("destroy", spy);

            // Run
            m.destroy();

            // Posttest
            expect(spy).toHaveBeenCalled();
        });

    });

    describe("The _populateFromServer() method", function() {
        var m;

        afterEach(function() {
            if(m && !m.isDestroyed) m.destroy();
        });

        it("Should set the id", function() {
            m = new Layer.Core.Message.ConversationMessage({
            });
            m._populateFromServer(responses.message1);
            expect(m.id).toEqual(responses.message1.id);
        });

        it("Should set the url", function() {
            m = new Layer.Core.Message.ConversationMessage({
            });
            m._populateFromServer(responses.message1);
            expect(m.url).toEqual(responses.message1.url);
        });

        it("Should set the position", function() {
            m = new Layer.Core.Message.ConversationMessage({
            });
            m._populateFromServer(responses.message1);
            expect(m.position).toEqual(responses.message1.position);
            expect(m.position).toEqual(jasmine.any(Number));
        });

        it("Should call __adjustParts", function() {
            // Setup
            m = new Layer.Core.Message.ConversationMessage({
            });
            spyOn(m, "__adjustParts");


            // Run
            m._populateFromServer(responses.message1);

            // Posttest
            var args = m.__adjustParts.calls.allArgs()[0];
            expect(args[0]).toEqual(jasmine.any(Set));
            var parts = [];
            args[0].forEach(function(part) {parts.push(part);});

            expect(parts).toEqual(m.filterParts());
            expect(parts.length).toEqual(2);
        });

        it("Should call MessagePart._createFromServer", function() {
            // Setup
            var tmp = Layer.Core.MessagePart._createFromServer;
            m = new Layer.Core.Message.ConversationMessage({
            });
            spyOn(Layer.Core.MessagePart, "_createFromServer").and.callThrough();

            // Run
            m._populateFromServer(responses.message1);

            // Posttest
            expect(Layer.Core.MessagePart._createFromServer).toHaveBeenCalledWith(
                responses.message1.parts[0]
            );

            // Restore
            Layer.Core.MessagePart._createFromServer = tmp;
        });

        it("Should call MessagePart._populateFromServer", function() {
            // Setup
            m = new Layer.Core.Message.ConversationMessage({
              fromServer: responses.message1
            });
            var parts = m.filterParts();
            spyOn(parts[0], "_populateFromServer");
            spyOn(parts[1], "_populateFromServer");

            // Run
            m._populateFromServer(responses.message1);
            var newParts = m.filterParts();

            // Posttest
            expect(newParts[0]).toBe(parts[0]);
            expect(newParts[1]).toBe(parts[1]);
            expect(m.parts.size).toEqual(2);
            expect(parts[0]._populateFromServer).toHaveBeenCalledWith(responses.message1.parts[0]);
            expect(parts[1]._populateFromServer).toHaveBeenCalledWith(responses.message1.parts[1]);
        });

        it("Should call __updateRecipientStatus()", function() {
            // Setup
            m = new Layer.Core.Message.ConversationMessage({
            });
            spyOn(m, "__updateRecipientStatus");
            var data = JSON.parse(JSON.stringify(responses.message1));

            // Run
            m._populateFromServer(data);

            // Posttest
            expect(m.__updateRecipientStatus).toHaveBeenCalledWith(responses.message1.recipient_status, {});
            expect(m.recipientStatus).toEqual(data.recipient_status);
        });

        it("Should set sender to existing Identity", function() {
            m = new Layer.Core.Message.ConversationMessage({
            });
            var data = JSON.parse(JSON.stringify(responses.message1));
            expect(client.getIdentity(data.sender.user_id)).toEqual(jasmine.any(Layer.Core.Identity));

            m._populateFromServer(data);

            expect(m.sender).toBe(client.getIdentity(data.sender.user_id));
        });

        it("Should set sender to a new Identity", function() {
            m = new Layer.Core.Message.ConversationMessage({
            });
            var data = JSON.parse(JSON.stringify(responses.message1));
            delete client._models.identities[data.sender.id];
            data.sender.id += "1";
            data.sender.user_id += "1";
            expect(client.getIdentity(data.sender.user_id)).toEqual(null);

            m._populateFromServer(data);

            // Posttest
            expect(m.sender).toEqual(jasmine.any(Layer.Core.Identity));
            expect(m.sender.userId).toEqual(data.sender.user_id);
            expect(m.sender.id).toEqual(data.sender.id);
        });

        it("Should set sender.display_name to an anonymous Identity", function() {
            client._models.identities = {};
            m = new Layer.Core.Message.ConversationMessage({
            });
            var data = JSON.parse(JSON.stringify(responses.message1));
            data.sender = {display_name: "Fred"};

            m._populateFromServer(data);

            expect(m.sender.displayName).toEqual("Fred");
            expect(m.sender.userId).toEqual("");
            expect(m.sender.id).toEqual("");
            expect(m._events).toEqual({});
            expect(m.sender).toEqual(jasmine.any(Layer.Core.Identity));
            expect(client._models.identities).toEqual({});
        });

        it("Should call _setSynced", function() {
            // Setup
            m = new Layer.Core.Message.ConversationMessage({
            });
            spyOn(m, "_setSynced");

            // Run
            m._populateFromServer(responses.message1);

            // Posttest
            expect(m._setSynced).toHaveBeenCalled();
        });

        it("Should trigger a position change", function() {
            // Setup
            m = new Layer.Core.Message.ConversationMessage({
            });
            spyOn(m, "_triggerAsync");
            var position = m.position = 5;

            // Run
            m._populateFromServer({
                id: "dohId",
                position: 35,
                sender: {
                    user_id: "999"
                },
                parts: [{mime_type: "text/plain", body: "Doh!"}]
            });

            // Posttest
            expect(m._triggerAsync).toHaveBeenCalledWith("messages:change", {
                oldValue: position,
                newValue: 35,
                property: 'position'
            });
        });
    });

    // tested by _populateFromServer
    xdescribe("The getPartById() method", function() {});

    describe("The getPartsMatchingAttribute() method", function() {
        it("Should find the parts with the specified attribute value", function() {
            // Setup
            m = new Layer.Core.Message.ConversationMessage({
                parts: [
                    {mimeType: "text/plain;a=b", body: "a"},
                    {mimeType: "text/plain;a=c", body: "b"},
                    {mimeType: "text/plain;a=d", body: "c"},
                    {mimeType: "text/plain;a=c", body: "d"},
                    {mimeType: "text/plain;a=e", body: "e"},
                ]
            });

            // Run
            expect(m.getPartsMatchingAttribute({a: "c"}) ).toEqual([
                jasmine.objectContaining({body: "b"}),
                jasmine.objectContaining({body: "d"})
            ]);
        });
    });

    describe("The getRootPart() method", function() {
        it("Should find the root part", function() {
            // Setup
            m = new Layer.Core.Message.ConversationMessage({
                parts: [
                    {mimeType: "text/plain;a=b", body: "a"},
                    {mimeType: "text/plain;a=c", body: "b"},
                    {mimeType: "text/plain;a=d", body: "c"},
                    {mimeType: "text/plain;role=root", body: "d"},
                    {mimeType: "text/plain;a=e", body: "e"},
                ]
            });

            // Run
            expect(m.getRootPart().body).toEqual("d");
        });
    });

    describe("The createModel() method", function() {
        it("Should call rootPart.createModel()", function() {
            // Setup
            m = new Layer.Core.Message.ConversationMessage({
                parts: [
                    {mimeType: "application/vnd.layer.text+json;a=b", body: '{"text": "a"}'},
                    {mimeType: "application/vnd.layer.text+json;a=c", body: '{"text": "a"}'},
                    {mimeType: "application/vnd.layer.text+json;a=d", body: '{"text": "a"}'},
                    {mimeType: "application/vnd.layer.text+json;role=root", body: '{"text": "a"}'},
                    {mimeType: "application/vnd.layer.text+json;a=e", body: '{"text": "a"}'},
                ]
            });
            spyOn(m.getRootPart(), "createModel").and.callThrough();

            // Run
            expect(m.createModel()).toEqual(jasmine.any(Layer.Core.MessageTypeModel));
            expect(m.getRootPart().createModel).toHaveBeenCalledWith();
        });
    });

    describe("The getModelName() method", function() {
        it("Should return model names", function() {
            // Setup
            m = new Layer.Core.Message.ConversationMessage({
                parts: [
                    {mimeType: "application/vnd.layer.image+json;a=b", body: '{"image": "a"}'},
                    {mimeType: "application/vnd.layer.image+json;a=c", body: '{"text": "a"}'},
                    {mimeType: "application/vnd.layer.image+json;a=d", body: '{"text": "a"}'},
                    {mimeType: "application/vnd.layer.text+json;role=root", body: '{"text": "a"}'},
                    {mimeType: "application/vnd.layer.image+json;a=e", body: '{"text": "a"}'},
                ]
            });

            // Test
            expect (m.getModelName()).toEqual("TextModel");
        });
    });

    describe("The _handlePatchEvent() method", function() {
        it("Should call __updateRecipientStatus", function() {
            // Setup
            var m = new Layer.Core.Message.ConversationMessage({
            });
            spyOn(m, "__updateRecipientStatus");

            // Run
            m.recipientStatus["layer:///identities/a"] = "delivered";
            m._handlePatchEvent({
                "layer:///identities/a": "delivered"
            }, {
                "layer:///identities/a": "sent"
            }, ["recipient_status.layer:///identities/a"]);

            // Posttest
            expect(m.__updateRecipientStatus).toHaveBeenCalledWith({"layer:///identities/a": "delivered"}, {"layer:///identities/a": "sent"});
        });
    });

    describe("The _xhr() method", function() {
        var m;
        beforeEach(function() {
            m = conversation.createMessage("hello");
        });

        afterEach(function() {
            if (!m.isDestroyed) m.destroy();
        });

        it("Should throw an error if destroyed", function() {
            // Setup
            m.destroy();

            // Run
            expect(function() {
                m._xhr({});
            }).toThrowError(Layer.Core.LayerError.ErrorDictionary.isDestroyed);
        });

        it("Should use resource url", function() {
            // Run
            m._xhr({method: "GET"});

            // Posttest
            expect(requests.mostRecent().url).toEqual(m.url);
        });


        it("Should add path to url if not a sync request", function() {
            spyOn(client, "xhr");
            m.url = "https://doh.com/ray";
            options = {url: "/hey"};
            m._xhr(options);
            expect(options.url).toEqual("https://doh.com/ray/hey");
        });

        it("Should not add path to url if its a sync request", function() {
            spyOn(client, "xhr");
            m.url = "https://doh.com/ray";
            options = {url: "/hey", sync: {}};
            m._xhr(options);
            expect(options.url).toEqual("/hey");
        });

        it("Should not require prefixed slash", function() {
            spyOn(client, "xhr");
            m.url = "https://doh.com/ray";
            options = {url: "hey"};
            m._xhr(options);
            expect(options.url).toEqual("https://doh.com/ray/hey");
        });

        it("Should add query to url", function() {
            spyOn(client, "xhr");
            m.url = "https://doh.com/ray";
            options = {url: "?hey"};
            m._xhr(options);
            expect(options.url).toEqual("https://doh.com/ray?hey");
        });

        it("Should call _setupSyncObject", function() {
            spyOn(m, "_setupSyncObject");
            m._xhr({url: "hey"});
            expect(m._setupSyncObject).toHaveBeenCalledWith(undefined);
        });

        it("Should call client.xhr", function() {
            spyOn(client, "xhr");
            m._xhr({url: "hey"});
            expect(client.xhr).toHaveBeenCalledWith(jasmine.objectContaining({
                url: '/hey',
                sync: jasmine.any(Object)
            }), jasmine.any(Function));
        });

    });

    describe("The _setupSyncObject() method", function() {
        var m;
        beforeEach(function() {
            m = conversation.createMessage("hello");
        });

        afterEach(function() {
            if (!m.isDestroyed) m.destroy();
        });

        it("Should do nothing if false", function() {
            expect(m._setupSyncObject(false)).toBe(false);
        });

        it("Should generate basic structure if undefined", function() {
            expect(m._setupSyncObject(undefined)).toEqual({
                target: m.id,
                depends: [m.conversationId]
            });
        });

        it("Should add a depends", function() {
            expect(m._setupSyncObject({depends: ["doh"]})).toEqual({
                target: m.id,
                depends: ["doh", m.conversationId]
            });
        });

        it("Should not overwrite a target", function() {
            expect(m._setupSyncObject({target: "what the"})).toEqual({
                target: "what the",
                depends: [m.conversationId]
            });
        });
    });

    describe("The toObject() method", function() {
        var m;
        beforeEach(function() {
            m = conversation.createMessage("hello");
        });

        afterEach(function() {
            if (!m.isDestroyed) m.destroy();
        });

        it("Should return cached value", function() {
            m._toObject = "fred";
            expect(m.toObject()).toEqual("fred");
        });

        it("Should return a clone of participants", function() {
            expect(m.toObject().recipientStatus).toEqual(m.recipientStatus);
            expect(m.toObject().recipientStatus).not.toBe(m.recipientStatus);
        });
    });

    describe("The _createFromServer() method", function() {

        it("Should call _populateFromServer if found", function() {
            // Setup
            var id = conversation.createMessage("Hello").send().id;

            var m = Layer.Core.Message.ConversationMessage._createFromServer({
                id: id,
                url: "hey ho",
                parts: [],
                sender: {},
                conversation: {id: "layer:///conversations/fred"}
            });

            // Posttest
            expect(m.url).toEqual("hey ho");

            m.destroy();
        });

        it("Should register the message", function() {
            // Run
            var m = Layer.Core.Message.ConversationMessage._createFromServer({
                url: "hey ho",
                id: "layer:///messages/m103",
                parts: [],
                sender: {},
                conversation: {id: "layer:///conversations/fred"}
            });

            // Posttest
            expect(client.getMessage(m.id)).toBe(m);
        });

        it("Should send delivery receipt if not marked as delivered", function() {
            // Setup
            var data = JSON.parse(JSON.stringify(responses.message1));
            data.recipient_status["layer:///identities/999"] = "sent";
            var tmp = Layer.Core.Message.ConversationMessage.prototype._sendReceipt;
            spyOn(Layer.Core.Message.ConversationMessage.prototype, "_sendReceipt");

            // Run,
            var m = Layer.Core.Message.ConversationMessage._createFromServer(data);
            jasmine.clock().tick(1);
            Layer.Utils.defer.flush();

            // Posttest
            expect(Layer.Core.Message.ConversationMessage.prototype._sendReceipt).toHaveBeenCalledWith('delivery');

            // Restore
            Layer.Core.Message.ConversationMessage.prototype._sendReceipt = tmp;
        });

        it("Should NOT send delivery receipt if marked as delivered", function() {
            // Setup
            var data = JSON.parse(JSON.stringify(responses.message1));
            data.recipient_status["layer:///identities/999"] = "delivered";
            var tmp = Layer.Core.Message.ConversationMessage.prototype._sendReceipt;
            spyOn(Layer.Core.Message.ConversationMessage.prototype, "_sendReceipt");

            // Run,
            var m = Layer.Core.Message.ConversationMessage._createFromServer(data);

            // Posttest
            expect(Layer.Core.Message.ConversationMessage.prototype._sendReceipt).not.toHaveBeenCalledWith('delivery');

            // Restore
            Layer.Core.Message.ConversationMessage.prototype._sendReceipt = tmp;
        });

        it("Should trigger a messages:notify event if fromWebsocket is true", function() {
            var data = JSON.parse(JSON.stringify(responses.message1));
            data.notification = {text: "Hey", title: "ho"};
            data.fromWebsocket = true;
            client.getMessage(data.id).destroy();
            spyOn(client, "_triggerAsync");

            // Run,
            var m = Layer.Core.Message.ConversationMessage._createFromServer(data);

            // Posttest
            expect(client._triggerAsync).toHaveBeenCalledWith('messages:notify', { message: m, notification:  {text: "Hey", title: "ho"}});
        });

        it("Should not trigger a messages:notify event if message is from sender", function() {
            var data = JSON.parse(JSON.stringify(responses.message1));
            data.fromWebsocket = true;
            data.sender.user_id = client.user.userId;
            client.getMessage(data.id).destroy();
            spyOn(client, "_triggerAsync");

            // Run,
            var m = Layer.Core.Message.ConversationMessage._createFromServer(data);

            // Posttest
            expect(client._triggerAsync).not.toHaveBeenCalledWith('messages:notify', { message: m });
        });

        it("Should not trigger a messages:notify event if message is read", function() {
            var data = JSON.parse(JSON.stringify(responses.message1));
            data.fromWebsocket = true;
            data.is_unread = false;
            client.getMessage(data.id).destroy();
            spyOn(client, "_triggerAsync");

            // Run,
            var m = Layer.Core.Message.ConversationMessage._createFromServer(data);

            // Posttest
            expect(client._triggerAsync).not.toHaveBeenCalledWith('messages:notify', { message: m });
        });

        it("Should not trigger a messages:notify event if fromWebsocket is undefined", function() {
            var data = JSON.parse(JSON.stringify(responses.message1));
            client.getMessage(data.id).destroy();
            spyOn(client, "_triggerAsync");

            // Run,
            var m = Layer.Core.Message.ConversationMessage._createFromServer(data);

            // Posttest
            expect(client._triggerAsync).not.toHaveBeenCalledWith('messages:notify', { message: m });
        });

        it("Should setup a parent that is a Conversation", function() {
            var data = JSON.parse(JSON.stringify(responses.message1));
            data.conversation = {id: conversation.id};
            var m = Layer.Core.Message.ConversationMessage._createFromServer(data);
            expect(m.getConversation()).toBe(conversation);
        });

        it("Should setup a conversation that is a Channel", function() {
            var data = JSON.parse(JSON.stringify(responses.message1));
            delete data.conversation;
            data.channel = {id: channel.id};
            var m = Layer.Core.Message.ChannelMessage._createFromServer(data);
            expect(m.getConversation()).toBe(channel);
        });
    });

    describe("The _loaded() method", function() {
      var message;
      beforeEach(function() {
          message = conversation.createMessage("hello");
      });

      afterEach(function() {
          if (!message.isDestroyed) message.destroy();
      });

      it("Should setup the Conversation ID", function() {
        message.conversationId = '';
        message._loaded(responses.message1);
        expect(message.conversationId).toEqual(responses.message1.conversation.id);
      });

      it("Should setup the Channel ID", function() {
    var message = new Layer.Core.Message.ChannelMessage({});
        var message1 = JSON.parse(JSON.stringify(responses.message1));
        message1.channel = {id: channel.id};
        delete message1.conversation;
        message._loaded(message1);
        expect(message.conversationId).toBe(channel.id);
      });

      it("Should register the Message", function() {
        spyOn(client, "_addMessage");
        message._loaded(responses.message1);
        expect(client._addMessage).toHaveBeenCalledWith(message);
      });
    });

    describe("The _setSynced() method", function() {

        it("Sets syncState to SYNCED if SAVING and syncCounter=1", function() {
            // Setup
            var c = new Layer.Core.Message.ConversationMessage({
                syncState: Layer.Constants.SYNC_STATE.SAVING,
                _syncCounter: 1,
            });

            // Run
            c._setSynced();

            // Posttest
            expect(c.syncState).toEqual(Layer.Constants.SYNC_STATE.SYNCED);
            expect(c._syncCounter).toEqual(0);
        });

        it("Sets syncState to SYNCING if SAVING and syncCounter=2", function() {
            // Setup
            var c = new Layer.Core.Message.ConversationMessage({
                syncState: Layer.Constants.SYNC_STATE.SAVING,
                _syncCounter: 2,
            });

            // Run
            c._setSynced();

            // Posttest
            expect(c.syncState).toEqual(Layer.Constants.SYNC_STATE.SYNCING);
            expect(c._syncCounter).toEqual(1);
        });

        it("Sets syncState to SYNCED if SYNCING and syncCounter=1", function() {
            // Setup
            var c = new Layer.Core.Message.ConversationMessage({
                syncState: Layer.Constants.SYNC_STATE.SYNCING,
                _syncCounter: 1,
            });

            // Run
            c._setSynced();

            // Posttest
            expect(c.syncState).toEqual(Layer.Constants.SYNC_STATE.SYNCED);
            expect(c._syncCounter).toEqual(0);
        });
    });

    describe("They _setSyncing() method", function() {
        it("Initial sync state is NEW / 0", function() {
            // Run
            var m = new Layer.Core.Message.ConversationMessage({
            });

            // Posttest
            expect(m.syncState).toEqual(Layer.Constants.SYNC_STATE.NEW);
            expect(m._syncCounter).toEqual(0);
        });

        it("Sets syncState to SAVING if syncState is NEW and syncCounter=0", function() {
            // Setup
            var m = new Layer.Core.Message.ConversationMessage({
            });

            // Run
            m._setSyncing();

            // Posttest
            expect(m.syncState).toEqual(Layer.Constants.SYNC_STATE.SAVING);
            expect(m._syncCounter).toEqual(1);
        });

        it("Sets syncState to SAVING if syncState is NEW and syncCounter=N", function() {
            // Setup
            var m = new Layer.Core.Message.ConversationMessage({
                _syncCounter: 500
            });

            // Run
            m._setSyncing();

            // Posttest
            expect(m.syncState).toEqual(Layer.Constants.SYNC_STATE.SAVING);
            expect(m._syncCounter).toEqual(501);
        });

        it("Sets syncState to SAVING if syncState is SAVING and inc syncCounter", function() {
            // Setup
            var m = new Layer.Core.Message.ConversationMessage({
                _syncCounter: 500,
                syncState: Layer.Constants.SYNC_STATE.SAVING,
            });

            // Run
            m._setSyncing();

            // Posttest
            expect(m.syncState).toEqual(Layer.Constants.SYNC_STATE.SAVING);
            expect(m._syncCounter).toEqual(501);
        });

        it("Sets syncState to SYNCING if syncState is SYNCED and inc syncCounter", function() {
            // Setup
            var m = new Layer.Core.Message.ConversationMessage({
                syncState: Layer.Constants.SYNC_STATE.SYNCED
            });

            // Run
            m._setSyncing();

            // Posttest
            expect(m.syncState).toEqual(Layer.Constants.SYNC_STATE.SYNCING);
            expect(m._syncCounter).toEqual(1);
        });

        it("Sets syncState to SYNCING if syncState is SYNCING and inc syncCounter", function() {
            // Setup
            var m = new Layer.Core.Message.ConversationMessage({
                syncState: Layer.Constants.SYNC_STATE.SYNCING,
                _syncCounter: 500
            });

            // Run
            m._setSyncing();

            // Posttest
            expect(m.syncState).toEqual(Layer.Constants.SYNC_STATE.SYNCING);
            expect(m._syncCounter).toEqual(501);
        });
    });
});
