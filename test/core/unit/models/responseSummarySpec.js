/* eslint-disable */
describe("The Message Type Response Summary class", function() {
  var appId = "Fred's App";
  var conversation,
      client,
      requests;

  afterAll(function() {

  });

  beforeEach(function() {
      jasmine.Ajax.install();
      requests = jasmine.Ajax.requests;
      client = new Layer.init({
          appId: appId,
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
      client._clientReady();
      client.onlineManager.isOnline = true;

      conversation = Layer.Core.Conversation._createFromServer(responses.conversation2).conversation;
      requests.reset();
      client.syncManager.queue = [];
  });
  afterEach(function() {
      client.destroy();
      jasmine.Ajax.uninstall();
  });

  describe("The constructor", function() {
    it("Should initialize participantData", function() {
      expect(new Layer.Core.MessageTypeResponseSummary({})._participantData).toEqual({});
    });
  });

  describe("The getResponse() method", function() {
    var model, userId1, userId2;
    beforeEach(function() {
      model = new Layer.Core.MessageTypeResponseSummary({})
      userId1 = 'userA';
      userId2 = 'userB';
      model._participantData = {};
      model._participantData[userId1] = {
        frodo: "dodo",
        sauruman: "nincompoop"
      };
      model._participantData[userId2] = {
        frodo: "modo",
        bilbo: "bagged"
      };
    });
    afterEach(function() {
      model.destroy();
    });
    it("Should return the specified result", function() {
      expect(model.getResponse('frodo', userId1)).toEqual("dodo");
      expect(model.getResponse('frodo', userId2)).toEqual("modo");
    });

    it("Should return null if key has no entry", function() {
      expect(model.getResponse('bilbo', userId1)).toBe(null);
      expect(model.getResponse('bilbo2', userId1)).toBe(null);
    });

    it("Should return null if identity has no entry", function() {
      expect(model.getResponse('frodo', 'userC')).toBe(null);
    });
  });

  describe("The getResponses() method", function() {
    var model, userId1, userId2;
    beforeEach(function() {
      model = new Layer.Core.MessageTypeResponseSummary({})
      userId1 = 'userA';
      userId2 = 'userB';
      model._participantData = {};
      model._participantData[userId1] = {
        frodo: "dodo",
        sauruman: "nincompoop",
        empty: ""
      };
      model._participantData[userId2] = {
        frodo: "modo",
        bilbo: "bagged",
        empty: "is how I feel"
      };
    });
    afterEach(function() {
      model.destroy();
    });

    it("Should return all values of frodo", function() {
      expect(model.getResponses('frodo')).toEqual([
        {identityId: userId1, value: 'dodo'},
        {identityId: userId2, value: 'modo'}
      ]);
    });

    it("Should return all values of frodo for userB", function() {
      expect(model.getResponses('frodo', [userId2])).toEqual([
        {identityId: userId2, value: 'modo'}
      ]);
    });

    it("Should return one value for bilbo and one for sauruman", function() {
      expect(model.getResponses('bilbo')).toEqual([
        {identityId: userId2, value: 'bagged'}
      ]);

      expect(model.getResponses('sauruman')).toEqual([
        {identityId: userId1, value: 'nincompoop'}
      ]);
    });

    it("Should return one value for bilbo and zero for sauruman for user2", function() {
      expect(model.getResponses('bilbo', [userId2])).toEqual([
        {identityId: userId2, value: 'bagged'}
      ]);

      expect(model.getResponses('sauruman', [userId2])).toEqual([
      ]);
    });

    it("Should return all empty values", function() {
      expect(model.getResponses('empty')).toEqual([
        {identityId: userId1, value: ""},
        {identityId: userId2, value: "is how I feel"}
      ]);
    });
  });
});