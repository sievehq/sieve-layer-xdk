describe('layer-conversation-view', function() {
  var el, testRoot, client, conversation, user1, query;

  beforeAll(function(done) {
    if (layer.UI.components['layer-conversation-view'] && !layer.UI.components['layer-conversation-view'].classDef) layer.UI.init({});
    setTimeout(done, 1000);
  });

  afterEach(function() {
    jasmine.clock().uninstall();
  });

  beforeEach(function() {
    jasmine.clock().install();

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

    user1 = new Layer.Core.Identity({
      client: client,
      userId: 'SaurumanTheMildlyAged',
      displayName: 'Sauruman the Mildly Aged',
      id: 'layer:///identities/SaurumanTheMildlyAged',
      isFullIdentity: true
    });

    client._clientAuthenticated();

    if (layer.UI.components['layer-conversation-view'] && !layer.UI.components['layer-conversation-view'].classDef) layer.UI.init({});
    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    el = document.createElement('layer-conversation-view');
    testRoot.appendChild(el);
    conversation = client.createConversation({
      participants: ['layer:///identities/FrodoTheDodo', 'layer:///identities/SaurumanTheMildlyAged']
    });

    query = client.createQuery({
      model: layer.Core.Query.Message
    });
    query.isFiring = false;
    for (i = 0; i < 100; i++) {
      query.data.push(conversation.createMessage("M " + i).send());
    }

    el.query = query;
    jasmine.clock().tick(1);
  });

  afterEach(function() {
    document.body.removeChild(testRoot);
    Layer.Core.Client.removeListenerForNewClient();
    if (el) el.onDestroy();
  });

  describe('Event Handling', function() {
    it("Should call onSendMessage when child triggers layer-send-message", function() {
      var spy = jasmine.createSpy('callback');
      el.onSendMessage = spy;
      el.firstChild.trigger('layer-send-message', {message: conversation.createMessage("hey")});
      expect(spy).toHaveBeenCalledWith(jasmine.any(CustomEvent));
    });

    it("Should call onTypingIndicatorChange when child triggers layer-typing-indicator-change", function() {
      var spy = jasmine.createSpy('callback');
      el.onTypingIndicatorChange = spy;
      el.firstChild.trigger('layer-typing-indicator-change', {});
      expect(spy).toHaveBeenCalledWith(jasmine.any(CustomEvent));
    });

    it("Should call onComposerChangeValue when child triggers layer-compose-bar-change-value", function() {
      var spy = jasmine.createSpy('callback');
      el.onComposerChangeValue = spy;
      el.firstChild.trigger('layer-compose-bar-change-value', {});
      expect(spy).toHaveBeenCalledWith(jasmine.any(CustomEvent));
    });
  });

  describe("The query properties", function() {
    beforeEach(function() {
      testRoot.innerHTML = '<layer-conversation-view use-generated-query="false"></layer-conversation-view>';
      CustomElements.takeRecords();
      layer.Util.defer.flush();
      el = testRoot.firstChild;
    });

    it("Should reject a value that isnt in query id format", function() {
      el.queryId = "fred";
      expect(el.queryId).toEqual("");
      expect(el.query).toBe(null);
    });

    it("Should accept a value that is in query id format", function() {
      el.queryId = query.id;
      expect(el.queryId).toEqual(query.id);
      expect(el.query).toBe(null);
    });

    it("Should set the query from queryId if there is a client", function() {
      el.client = client;
      el.queryId = query.id;
      expect(el.queryId).toEqual(query.id);
      expect(el.query).toBe(query);
    });

    it("Should set the list query when query is set", function() {
      expect(el.nodes.list.query).toBe(null);
      el.query = query;
      expect(el.nodes.list.query).toBe(query);
    });

    it("Should destroy the existing query if hasGeneratedQuery is true", function() {
      el.client = client;
      var query2 = client.createQuery({model: layer.Conversation});
      el.query = query2;
      el.properties.hasGeneratedQuery = true;
      el.query = query;
      expect(query2.isDestroyed).toBe(true);
      expect(el.properties.hasGeneratedQuery).toBe(false);
    });

    it("Should not destroy the existing query if hasGeneratedQuery is false", function() {
      el.client = client;
      var query2 = client.createQuery({model: layer.Conversation});
      el.query = query2;
      el.properties.hasGeneratedQuery = false;
      el.query = query;
      expect(query2.isDestroyed).toBe(false);
      expect(el.properties.hasGeneratedQuery).toBe(false);
    });

    it("Should call _setupGeneratedQuery once the client is set", function() {
        testRoot.innerHTML = '<layer-conversation-view></layer-conversation-view>';
        CustomElements.takeRecords();
        layer.Util.defer.flush();

        var el = testRoot.firstChild;
        spyOn(el, "_setupGeneratedQuery");
        el.client = client;
        expect(el._setupGeneratedQuery).toHaveBeenCalledWith();
      });

      it("Should not call _setupGeneratedQuery once the client is set if useGeneratedQuery is false", function() {
        testRoot.innerHTML = '<layer-conversation-view use-generated-query="false"></layer-conversation-view>';
        CustomElements.takeRecords();
        layer.Util.defer.flush();

        var el = testRoot.firstChild;
        spyOn(el, "_setupGeneratedQuery");
        el.client = client;
        expect(el.useGeneratedQuery).toBe(false);
        expect(el._setupGeneratedQuery).not.toHaveBeenCalledWith();
      });
  });

  describe("The hasGeneratedQuery property", function() {
    it("Should call _setupConversation if set to true", function() {
      el.conversationId = conversation.id;
      el.client = client;
      spyOn(el, "_setupConversation");
      el.hasGeneratedQuery = true;
      expect(el._setupConversation).toHaveBeenCalled();
    });

    it("Should not call _setupConversation if set to false", function() {
      el.conversationId = conversation.id;
      el.client = client;
      spyOn(el, "_setupConversation");
      el.hasGeneratedQuery = false;
      expect(el._setupConversation).not.toHaveBeenCalled();
    });

    it("Should not call _setupConversation if set to true but no conversationId", function() {
      el.conversationId = '';
      el.client = client;
      spyOn(el, "_setupConversation");
      el.hasGeneratedQuery = true;
      expect(el._setupConversation).not.toHaveBeenCalled();
    });

    it("Should not call _setupConversation if no client", function() {
      el.conversationId = conversation.id;
      el.client = null;
      spyOn(el, "_setupConversation");
      el.hasGeneratedQuery = true;
      expect(el._setupConversation).not.toHaveBeenCalled();
    });
  });

  describe("The conversationId property", function() {
    beforeEach(function() {
      testRoot.innerHTML = '<layer-conversation-view></layer-conversation-view>';
      CustomElements.takeRecords();
      layer.Util.defer.flush();
      el = testRoot.firstChild;
    });

    it("Should ignore if not a properly formatted id", function() {
      el.conversationId = 'Frodo';
      expect(el.conversationId).toEqual('');
    });

    it("Should call _setupConversation if there is a client", function() {
      spyOn(el, "_setupConversation");
      el.client = client;
      el.conversationId = conversation.id;
      expect(el._setupConversation).toHaveBeenCalledWith();
    });

    it("Should call not call _setupConversation if there is not a client", function() {
      spyOn(el, "_setupConversation");
      el.conversationId = conversation.id;
      expect(el._setupConversation).not.toHaveBeenCalled();
    });

    it("Should wait until client.isReady", function() {
      client.isReady = false;
      el.client = client;
      spyOn(el, "_setupConversation");

      // Run
      el.conversationId = conversation.id;
      expect(el._setupConversation).not.toHaveBeenCalled();

      // Second run
      client._clientReady();
      expect(el._setupConversation).toHaveBeenCalled();
    });

    it("Should load the conversation if not cached", function() {
      el.client = client;
      expect(el.conversation).toBe(null);

      // Run
      el.conversationId = conversation.id.replace(/.$/, 'z');

      // Posttest
      expect(el.conversation).toEqual(jasmine.any(layer.Conversation));
      expect(el.conversation.isLoading).toBe(true);
    });

    it("Should clear the conversation if set to empty string", function() {
      el.client = client;
      el.conversation = conversation;
      expect(el.nodes.typingIndicators.conversation).toBe(conversation);

      el.conversationId = "";
      expect(el.conversation).toBe(null);
      expect(el.nodes.typingIndicators.conversation).toBe(null);
    });
  });

  describe("The conversation property", function() {
    beforeEach(function() {
      testRoot.innerHTML = '<layer-conversation-view></layer-conversation-view>';
      CustomElements.takeRecords();
      layer.Util.defer.flush();
      el = testRoot.firstChild;
    });

    it("Should ignore invalid values", function() {
      el.conversation = {hey: "ho"};
      expect(el.conversation).toBe(null);
    });

    it("Should call _setupConversation if there is a value or not", function() {
      spyOn(el, "_setupConversation");
      el.client = client;
      el.conversation = conversation;
      expect(el._setupConversation).toHaveBeenCalled();
      el._setupConversation.calls.reset();

      el.conversation = null;
      expect(el._setupConversation).toHaveBeenCalled();
    });
  });

  describe("The autoFocusConversation property", function() {
    it("Should default to desktop-only", function() {
      testRoot.innerHTML = '<layer-conversation-view></layer-conversation-view>';
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      el = testRoot.firstChild;
      expect(el.autoFocusConversation).toEqual('desktop-only');
    });

    it("Should be initializable to never", function() {
      testRoot.innerHTML = '<layer-conversation-view auto-focus-conversation="never"></layer-conversation-view>';
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      el = testRoot.firstChild;
      expect(el.autoFocusConversation).toBe('never');
    });

    it("Should be initializable to always", function() {
      testRoot.innerHTML = '<layer-conversation-view auto-focus-conversation="always"></layer-conversation-view>';
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      el = testRoot.firstChild;
      expect(el.autoFocusConversation).toBe('always');
    });
  });

  describe("The client property", function() {
    it("Should setup the conversation if there is a conversationId", function() {
      testRoot.innerHTML = '<layer-conversation-view conversation-id="' + conversation.id + '"></layer-conversation-view>';
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      el = testRoot.firstChild;
      spyOn(el, "_setupConversation");
      el.client = client;
      expect(el._setupConversation).toHaveBeenCalledWith();

      // Inverse Test
      testRoot.innerHTML = '<layer-conversation-view></layer-conversation-view>';
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      el = testRoot.firstChild;
      spyOn(el, "_setupConversation");
      el.client = client;
      expect(el._setupConversation).not.toHaveBeenCalled();
    });

    it("Should setup the query if there is a queryId", function() {
      testRoot.innerHTML = '<layer-conversation-view use-generated-query="false" query-id="' + query.id + '"></layer-conversation-view>';
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      el = testRoot.firstChild;
      expect(el.query).toBe(null);
      el.client = client;
      expect(el.query).toBe(query);

      // Inverse test
      testRoot.innerHTML = '<layer-conversation-view use-generated-query="false"></layer-conversation-view>';
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      el = testRoot.firstChild;
      expect(el.query).toBe(null);
      el.client = client;
      expect(el.query).toBe(null);
    });
  });

  describe("The onRenderListItem property", function() {
    it("Should set the list onRenderListItem property", function() {
      var f = function() {};
      el.onRenderListItem = f;
      layer.Util.defer.flush();
      expect(el.nodes.list.onRenderListItem).toBe(f);
    });
  });

  describe("The getMenuOptions property", function() {
    it("Should set the list getMenuOptions property", function() {
      var f = function() {};
      el.getMenuOptions = f;
      layer.Util.defer.flush();
      expect(el.nodes.list.getMenuOptions).toBe(f);
    });
  });

  describe("The emptyMessageListNode property", function() {
    it("Should set the list emptyNode property", function() {
      var div = document.createElement('div');
      el.emptyMessageListNode = div;
      layer.Util.defer.flush();
      expect(el.nodes.list.emptyNode).toBe(div);
    });
  });

  describe("The endOfMessagesNode property", function() {
    it("Should set the list endOfResultsNode property", function() {
      var div = document.createElement('div');
      el.endOfMessagesNode = div;
      layer.Util.defer.flush();
      expect(el.nodes.list.endOfResultsNode).toBe(div);
    });
  });

  describe("The composeButtons property", function() {
    it("Should set the list composeButtons property", function() {
      var buttons = [document.createElement("button"), document.createElement("button")];
      var moreButtons = [document.createElement("button")];
      el.composeButtons = buttons;
      el.composeButtonsLeft = moreButtons;
      layer.Util.defer.flush();
      expect(el.nodes.composer.buttons).toBe(buttons);
      expect(el.nodes.composer.buttonsLeft).toBe(moreButtons);
    });
  });


  describe("The composeText property", function() {
    it("Should set the list composeText property", function() {
      el.composeText = "Frodo Must Cry";
      layer.Util.defer.flush();
      expect(el.nodes.composer.value).toEqual("Frodo Must Cry");
    });
  });

  describe("The composePlaceholder property", function() {
    it("Should set the list composePlaceholder property", function() {
      el.composePlaceholder = "Frodo Must Cry";
      layer.Util.defer.flush();
      expect(el.nodes.composer.placeholder).toEqual("Frodo Must Cry");
    });
  });

  describe("The dateRenderer property", function() {
    it("Should pass the property to the list", function() {
      var f = function() {}
      el.dateRenderer = f;
      layer.Util.defer.flush();
      expect(el.nodes.list.dateRenderer).toBe(f);
    });
  });

  describe("The messageStatusRenderer property", function() {
    it("Should pass the property to the list", function() {
      var f = function() {}
      el.messageStatusRenderer = f;
      layer.Util.defer.flush();
      expect(el.nodes.list.messageStatusRenderer).toBe(f);
    });
  });

  describe("The disable property", function() {
    it("Should pass the property to the list", function() {
      el.disable = true;
      expect(el.nodes.list.disable).toBe(true);
      el.disable = false;
      expect(el.nodes.list.disable).toBe(false);
    });
  });

  describe("The created() method", function() {
    it("Should setup basic properties", function() {
      expect(el.nodes.list.tagName).toEqual('layer-message-list');
      expect(el.nodes.composer.tagName).toEqual('layer-compose-bar');
      expect(el.nodes.typingIndicators.tagName).toEqual('LAYER-TYPING-INDICATOR');
    });

    it("Should set a tabIndex of -1 if its unset", function() {
      expect(el.tabIndex).toEqual(-1);

      // Inverse
      testRoot.innerHTML = '<layer-conversation-view tabindex="5"></layer-conversation-view>';
      CustomElements.takeRecords();
      el = testRoot.firstChild;
      expect(el.tabIndex).toEqual(5);
    });
  });

  describe("The onKeyDown() method", function() {
    it("Should call focusText onKeyDown is called", function() {
        spyOn(el, "focusText");
        el.onKeyDown();
        expect(el.focusText).toHaveBeenCalledWith();
    });
  });

  describe("The focusText() method", function() {
    it("Should call the composers focus method", function() {
      spyOn(el.nodes.composer, "focus");
      el.focusText();
      expect(el.nodes.composer.focus).toHaveBeenCalledWith();
    });
  });

  describe("The send() method", function() {
    it("Should call the composers focus method", function() {
      spyOn(el.nodes.composer, "send");
      el.send();
      expect(el.nodes.composer.send).toHaveBeenCalledWith();
    });

    it("Should send optional parts", function() {
      spyOn(el.nodes.composer, "send");
      el.send([{mimeType: "hey", body: "ho"}]);
      expect(el.nodes.composer.send).toHaveBeenCalledWith([{mimeType: "hey", body: "ho"}]);
    });
  });

  describe("The _setupConversation() method", function() {
    beforeEach(function() {
      CustomElements.takeRecords();
      layer.Util.defer.flush();
      el.client = client;
    });
    it("Should setup the composers Conversation", function() {
      expect(el.nodes.composer.conversation).toBe(null);
      el.conversationId = conversation.id;
      expect(el.nodes.composer.conversation).toBe(conversation);
    });

    it("Should setup the typing-indicators Conversation", function() {
      expect(el.nodes.typingIndicators.conversation).toBe(null);
      el.conversationId = conversation.id;
      expect(el.nodes.typingIndicators.conversation).toBe(conversation);

    });

    it("Should call focusText if showAutoFocusConversation returns true", function() {
      el.autoFocusConversation = "always";
      spyOn(el, "focusText");
      el.conversationId = conversation.id;
      expect(el.focusText).toHaveBeenCalledWith();

      // Inverse
      el.focusText.calls.reset();
      el.autoFocusConversation = "never";
      el.conversationId = conversation.id;
      expect(el.focusText).not.toHaveBeenCalled();
    });

    it("Should delay if client is not ready", function() {
      spyOn(el.query, "update");
      client.isReady = false;
      el.hasGeneratedQuery = true;
      el.conversation = conversation;

      expect(el.query.update).not.toHaveBeenCalled();
      client._clientReady();
      expect(el.query.update).toHaveBeenCalled();
    });

    it("Should clear the conversation", function() {
      spyOn(el, "_setupConversation").and.callThrough();
      el.conversation = conversation;
      expect(el.nodes.composer.conversation).toBe(conversation);

      el.conversation = null;

      expect(el._setupConversation).toHaveBeenCalled();
      expect(el.nodes.composer.conversation).toBe(null);
    });

    it("Should retry when client isReady", function() {
      spyOn(el, "_setupConversation").and.callThrough();
      client.isReady = false;
      el.conversationId = conversation.id.replace(/.$/, 'z');
      el.hasGeneratedQuery = true;

      expect(el._setupConversation).toHaveBeenCalled();
      el._setupConversation.calls.reset();

      client._clientReady();
      expect(el._setupConversation).toHaveBeenCalled();
    });

    it("Should not update the predicate if its not a generated query", function() {
      spyOn(query, "update");
      el.hasGeneratedQuery = false;
      el.conversation = conversation;
      expect(query.update).not.toHaveBeenCalled();
    });

    it("Should update conversation query predicate", function() {
      spyOn(query, "update");
      el.hasGeneratedQuery = true;
      el.conversation = conversation;
      expect(query.update).toHaveBeenCalledWith({
        predicate: 'conversation.id = "' + conversation.id + '"'
      });
    });

    it("Should update channel query predicate", function() {
      spyOn(query, "update");
      el.hasGeneratedQuery = true;
      var channel = client.createChannel({
        name: "test"
      });
      el.conversation = channel;
      expect(query.update).toHaveBeenCalledWith({
        predicate: 'channel.id = "' + channel.id +'"'
      });
    });
  });

  describe("The shouldAutoFocusConversation() method", function() {
    beforeEach(function() {
      el.autoFocusConversation = 'desktop-only';
    });

    it("Should return true if always", function() {
      el.autoFocusConversation = 'always';
      expect(el.shouldAutoFocusConversation('')).toBe(true);
    });

    it("Should return false if never", function() {
      el.autoFocusConversation = 'never';
      expect(el.shouldAutoFocusConversation('')).toBe(false);
    });

    it("Should return false for an iphone", function() {
      expect(el.shouldAutoFocusConversation({userAgent: 'Mozilla/5.0 (iPad; CPU OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) CriOS/30.0.1599.12 Mobile/11A465 Safari/8536.25 (3B92C18B-D9DE-4CB7-A02A-22FD2AF17C8F)'})).toBe(false);
    });

    it("Should return false for an ipad", function() {
      expect(el.shouldAutoFocusConversation({userAgent: 'Mozilla/5.0 (iPad; U; CPU OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B334b Safari/531.21.10'})).toBe(false);
    });

    it("Should return false for IOS Chrome", function() {
      expect(el.shouldAutoFocusConversation({userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75 Mobile/14E5239e Safari/602.1'})).toBe(false);
    });

    it("Should return false for Chrome on Android", function() {
      expect(el.shouldAutoFocusConversation({userAgent: 'Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19'})).toBe(false);
    });

    it("Should return false for Firefox on Android Tablet", function() {
      expect(el.shouldAutoFocusConversation({userAgent: 'Mozilla/5.0 (Android 4.4; Tablet; rv:41.0) Gecko/41.0 Firefox/41.0'})).toBe(false);
    });

    it("Should return false for mobile Edge", function() {
      expect(el.shouldAutoFocusConversation({maxTouchPoints: 3})).toBe(false);
    });

    it("Should return true for safari", function() {
      expect(el.shouldAutoFocusConversation({userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.1 Safari/603.1.30"})).toBe(true);
    });

    it("Should return true for Chrome", function() {
      expect(el.shouldAutoFocusConversation({userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36"})).toBe(true);
    });

    it("Should return true for Firefox", function() {
      expect(el.shouldAutoFocusConversation({userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:52.0) Gecko/20100101 Firefox/52.0"})).toBe(true);
    });

    it("Should return true for Edge", function() {
      expect(el.shouldAutoFocusConversation({maxTouchPoints: 0})).toBe(true);
    });
  });
});