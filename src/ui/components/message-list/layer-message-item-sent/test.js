describe('layer-message-item', function() {
  var el, testRoot, client, conversation, message, user1, currentTagName, currentTagCounter = 0;

  beforeAll(function(done) {
    setTimeout(done, 1000);
  });

  afterEach(function() {
    jasmine.clock().uninstall();
    Layer.Core.Client.removeListenerForNewClient();
  });

  beforeEach(function() {
    jasmine.clock().install();

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

    user1 = new Layer.Core.Identity({
      client: client,
      userId: 'SaurumanTheMildlyAged',
      displayName: 'Sauruman the Mildly Aged',
      id: 'layer:///identities/SaurumanTheMildlyAged',
      isFullIdentity: true
    });

    client._clientAuthenticated();

    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    el = document.createElement('layer-message-item-sent');

    currentTagCounter++;
    currentTagName = 'test-message-handler-' + currentTagCounter;
    Layer.UI.registerComponent(currentTagName, {
      properties: {
        message: {}
      }
    });


    el._contentTag = currentTagName;
    testRoot.appendChild(el);
    conversation = client.createConversation({
      participants: ['layer:///identities/FrodoTheDodo', 'layer:///identities/SaurumanTheMildlyAged']
    });

    message = conversation.createMessage("M 0000").send();
    Layer.Utils.defer.flush();
    jasmine.clock().tick(1);
  });

  afterEach(function() {
    if (client) client.destroy();
    document.body.removeChild(testRoot);
  });

  describe("The item property", function() {
    it("Should wire up rerender and call it", function() {
      spyOn(el, "onRender");
      spyOn(el, "onRerender");

      el.item = message;
      Layer.Utils.defer.flush();
      expect(el.onRender).toHaveBeenCalledWith();
      el.onRender.calls.reset();

      el.item = null;
      expect(el.onRender).toHaveBeenCalledWith();
      expect(el.onRerender).not.toHaveBeenCalled();

      el.item = message;
      message.trigger("messages:change", {});
      expect(el.onRerender).toHaveBeenCalledWith(jasmine.any(Layer.Core.LayerEvent));
    });

    it("Should unwire any prior Message", function() {
      spyOn(el, "onRerender");

      var m2 = conversation.createMessage("m2").send();
      el.item = m2;
      Layer.Utils.defer.flush();
      el.item = message;

      m2.trigger("messages:change", {});
      expect(el.onRerender).not.toHaveBeenCalledWith(jasmine.any(Layer.Core.LayerEvent));
    });
  });

 describe("The _contentTag property", function() {
  it("Should remove the css class from the prior content tag", function() {
    el._contentTag = 'my-test-tag';
    expect(el.classList.contains('my-test-tag')).toBe(true);
    el._contentTag = 'hey-ho';
    expect(el.classList.contains('my-test-tag')).toBe(false);
  });

  it("Should add the css class for the new tag, if there is a new tag", function() {
    el._contentTag = 'my-test-tag';
    expect(el.classList.contains('my-test-tag')).toBe(true);
    el._contentTag = '';
    expect(el.classList.contains('my-test-tag')).toBe(false);
  });
 });

  describe("The dateRenderer property", function() {
    it("Should be passed to the sentAt widget", function() {
      el.destroy();
      el = document.createElement('layer-message-item-sent');
      el._contentTag = currentTagName;
      var date = document.createElement("layer-date");
      date.setAttribute('layer-id', 'date');
      el.replaceableContent = {
        messageRowRightSide: date,
      };
      var f = function() {};
      el.dateRenderer = f;
      el.item = message;
      testRoot.appendChild(el);
      Layer.Utils.defer.flush();

      expect(el.nodes.date.dateRenderer).toBe(f);
    });
  });

  describe("The getMenuOptions property", function() {
    it("Should set the list getMenuOptions property", function() {
      el.destroy();
      el = document.createElement('layer-message-item-sent');
      el._contentTag = currentTagName;
      var button = document.createElement("layer-menu-button");
      button.setAttribute('layer-id', 'menuButton');
      el.replaceableContent = {
        messageRowRightSide: button,
      };

      var f = function() {};
      el.getMenuOptions = f;
      Layer.Utils.defer.flush();
      expect(el.nodes.menuButton.getMenuOptions).toBe(f);
    });
  });

  describe("The dateFormat property", function() {
    it("Should set the date widgets format properties", function() {
      el.destroy();
      el = document.createElement('layer-message-item-sent');
      el._contentTag = currentTagName;
      var date = document.createElement("layer-date");
      date.setAttribute('layer-id', 'date');
      el.replaceableContent = {
        messageRowRightSide: date,
      };


      el.dateFormat = {
        today: {hour: "number"},
        default: {minute: "short"},
        week: {year: "short"},
        older: {weekday: "short"}
      };
      Layer.Utils.defer.flush();
      expect(el.nodes.date.todayFormat).toEqual({hour: "number"});
      expect(el.nodes.date.defaultFormat).toEqual({minute: "short"});
      expect(el.nodes.date.weekFormat).toEqual({year: "short"});
      expect(el.nodes.date.olderFormat).toEqual({weekday: "short"});
    });
  });

  describe("The messageStatusRenderer property", function() {
    it("Should be passed to the sentAt widget", function() {
      el.destroy();
      el = document.createElement('layer-message-item-sent');
      el._contentTag = currentTagName;
      var status = document.createElement("layer-message-status");
      status.setAttribute('layer-id', 'status');
      el.replaceableContent = {
        messageRowRightSide: status,
      };

      var f = function() {};
      el.messageStatusRenderer = f;
      el.item = message;
      Layer.Utils.defer.flush();
      el.onRender();
      expect(el.nodes.status.messageStatusRenderer).toBe(f);
    });
  });

  describe("The onRender() method", function() {
    it("Should setup the layer-sender-name", function() {
      el.destroy();
      el = document.createElement('layer-message-item-sent');
      el._contentTag = currentTagName;
      el.replaceableContent = {
        messageRowHeader: function messageRowHeader(widget) {
          const div = document.createElement('div');
          div.setAttribute('layer-id', 'sender');
          div.classList.add('layer-sender-name');
          return div;
        }
      };

      el.item = message;
      Layer.Utils.defer.flush();

      // Test with an avatar
      expect(el.querySelector('.layer-sender-name').innerHTML).toEqual(message.sender.displayName);

      // Test without a layer-sender-name; basically verifying it does not throw an error if this is missing
      delete el.nodes.sender;
      el.item = null;
      el.item = message;
      Layer.Utils.defer.flush();
    });

    it("Should setup the layer-avatar", function() {
      el.destroy();
      el = document.createElement('layer-message-item-sent');
      el._contentTag = currentTagName;
      el.replaceableContent = {
        messageRowHeader: function messageRowHeader(widget) {
          const avatar = document.createElement('layer-avatar');
          avatar.size = 'small';
          avatar.showPresence = false;
          avatar.setAttribute('layer-id', 'avatar');
          return avatar;
        }
      };


      el.item = message;
      Layer.Utils.defer.flush();

      // Test with an avatar that lacks a presence
      expect(el.querySelector('layer-avatar').users).toEqual([message.sender]);
      expect(el.nodes.avatar.querySelector('layer-presence')).toBe(null);

      // Test without an avatar; basically verifying it does not throw an error if this is missing
      delete el.nodes.avatar;
      el.item = null;
      el.item = message;
      Layer.Utils.defer.flush();
    });

    it("Should setup the layer-date", function() {
      el.destroy();
      el = document.createElement('layer-message-item-sent');
      el._contentTag = currentTagName;
      var date = document.createElement("layer-date");
      date.setAttribute('layer-id', 'date');
      el.replaceableContent = {
        messageRowRightSide: date,
      };
      el.item = message;
      Layer.Utils.defer.flush();
      expect(el.querySelector('layer-date').date).toEqual(message.sentAt);

      // Test without a date; basically verifying it does not throw an error if this is missing
      delete el.nodes.date;
      el.item = null;
      el.item = message;
      Layer.Utils.defer.flush();
    });

    it("Should setup the layer-message-status", function() {
      el.destroy();
      el = document.createElement('layer-message-item-sent');
      el._contentTag = currentTagName;
      var status = document.createElement("layer-message-status");
      status.setAttribute('layer-id', 'status');
      el.replaceableContent = {
        messageRowRightSide: status,
      };

      el.item = message;
      Layer.Utils.defer.flush();
      expect(el.querySelector('layer-message-status').item).toEqual(message);

      // Test without a status; basically verifying it does not throw an error if this is missing
      delete el.nodes.status;
      el.item = null;
      el.item = message;
      Layer.Utils.defer.flush();
    });



    it("Should call _applyContentTag", function() {
      spyOn(el, "_applyContentTag");
      el.item = message;
      Layer.Utils.defer.flush();
      expect(el._applyContentTag).toHaveBeenCalledWith();
    });

    it("Should call rerender", function() {
      spyOn(el, "onRerender");
      el.item = message;
      Layer.Utils.defer.flush();
      expect(el.onRerender).toHaveBeenCalledWith();
    });
  });

  describe("The rerender() method", function() {
    it("Should setup read css", function() {
      el.item = message;
      Layer.Utils.defer.flush();
      message.readStatus = Layer.Constants.RECIPIENT_STATE.ALL;
      el.onRerender();
      expect(el.classList.contains('layer-message-status-read-by-all')).toBe(true);
      expect(el.classList.contains('layer-message-status-read-by-some')).toBe(false);
      expect(el.classList.contains('layer-message-status-read-by-none')).toBe(false);

      message.readStatus = Layer.Constants.RECIPIENT_STATE.SOME;
      el.onRerender();
      expect(el.classList.contains('layer-message-status-read-by-all')).toBe(false);
      expect(el.classList.contains('layer-message-status-read-by-some')).toBe(true);
      expect(el.classList.contains('layer-message-status-read-by-none')).toBe(false);

      message.readStatus = Layer.Constants.RECIPIENT_STATE.NONE;
      el.onRerender();
      expect(el.classList.contains('layer-message-status-read-by-all')).toBe(false);
      expect(el.classList.contains('layer-message-status-read-by-some')).toBe(false);
      expect(el.classList.contains('layer-message-status-read-by-none')).toBe(true);
    });

    it("Should setup delivery css", function() {
      el.item = message;
      Layer.Utils.defer.flush();
      message.deliveryStatus = Layer.Constants.RECIPIENT_STATE.ALL;
      el.onRerender();
      expect(el.classList.contains('layer-message-status-delivered-to-all')).toBe(true);
      expect(el.classList.contains('layer-message-status-delivered-to-some')).toBe(false);
      expect(el.classList.contains('layer-message-status-delivered-to-none')).toBe(false);

      message.deliveryStatus = Layer.Constants.RECIPIENT_STATE.SOME;
      el.onRerender();
      expect(el.classList.contains('layer-message-status-delivered-to-all')).toBe(false);
      expect(el.classList.contains('layer-message-status-delivered-to-some')).toBe(true);
      expect(el.classList.contains('layer-message-status-delivered-to-none')).toBe(false);

      message.deliveryStatus = Layer.Constants.RECIPIENT_STATE.NONE;
      el.onRerender();
      expect(el.classList.contains('layer-message-status-delivered-to-all')).toBe(false);
      expect(el.classList.contains('layer-message-status-delivered-to-some')).toBe(false);
      expect(el.classList.contains('layer-message-status-delivered-to-none')).toBe(true);
    });

    it("Should setup pending css", function() {
      el.item = message;
      Layer.Utils.defer.flush();
      message.syncState = Layer.Constants.SYNC_STATE.SAVING;
      el.onRerender();
      expect(el.classList.contains('layer-message-status-pending')).toBe(true);

      message.syncState = Layer.Constants.SYNC_STATE.SYNCED;
      el.onRerender();
      expect(el.classList.contains('layer-message-status-pending')).toBe(false);
    });

    it("Should setup unread css", function() {
      el.item = message;
      Layer.Utils.defer.flush();
      message.isRead = false;
      el.onRerender();
      expect(el.classList.contains('layer-unread-message')).toBe(true);

      message.isRead = true;
      el.onRerender();
      expect(el.classList.contains('layer-unread-message')).toBe(false);
    });
  });

  describe("The _applyContentTag() method", function() {
    it("Should create the element specified in _contentTag", function() {
      el.item = message;
      Layer.Utils.defer.flush();
      el._contentTag = "img";
      el.nodes.content = document.createElement('div');
      el.appendChild(el.nodes.content);
      expect(el.querySelector('img')).toBe(null);
      el._applyContentTag();
      expect(el.querySelector('img')).not.toBe(null);
    });

    it("Should setup message properties", function() {
      el.item = message;
      Layer.Utils.defer.flush();
      el._contentTag = currentTagName;
      el.nodes.content = document.createElement('div');
      el.appendChild(el.nodes.content);
      el.properties.item = message;

      el._applyContentTag();
      var handler = el.querySelector(currentTagName);

      expect(handler.message).toEqual(message);
    });

    // Dont know how to test this
    it("Should propagate the message handlers height to the content node", function() {
      Layer.UI.handlers.message.register({
        tagName: 'test-handler-height',
        handlesMessage: function(message, container) {return message.parts[0].mimeType=='text/height-test';}
      });
      Layer.UI.registerComponent('test-handler-height', {
        methods: {
          onRender: function() {
            this.style.height = "234px";
          }
        }
      });

      el.item = conversation.createMessage({parts: [{mimeType: "text/height-test", body: "bbb"}]});
      Layer.Utils.defer.flush();
      el._contentTag = 'test-handler-height';
      el._applyContentTag();
      Layer.Utils.defer.flush();

      expect(el.nodes.content.style.height).toEqual("234px");
    });
  });
});