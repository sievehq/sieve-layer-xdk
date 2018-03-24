/* eslint-disable */
describe("The Message Type Response Summary class", function() {
  var appId = "Fred's App";
  var conversation,
      client,
      user1, user2,
      requests;

  afterAll(function() {

  });

  beforeEach(function() {
      jasmine.Ajax.install();
      requests = jasmine.Ajax.requests;
      client = new Layer.init({
          appId: appId,
          url: "https://doh.com"
      }).on('challenge', function() {});
      client.userId = "999";
      client.user = new Layer.Core.Identity({userId: 'userA'});


      client._clientAuthenticated();
      client._clientReady();
      client.onlineManager.isOnline = true;

      user1 = client.user;
      user2 = new Layer.Core.Identity({userId: 'userB'});

      conversation = Layer.Core.Conversation._createFromServer(responses.conversation2).conversation;
      requests.reset();
      client.syncManager.queue = [];
  });
  afterEach(function() {

      client.destroy();
      jasmine.Ajax.uninstall();
  });

  describe("The constructor", function() {
    it("Should initialize _trackers", function() {
      expect(new Layer.Core.MessageTypeResponseSummary({})._trackers).toEqual({});
    });
  });

  describe("The getState() method", function() {
    var parentModel, model, userId1, userId2;
    beforeEach(function() {
      parentModel = new Layer.Core.MessageTypeModel({});
      model = parentModel.responses;
      model.registerState('frodo', Layer.Constants.CRDT_TYPES.FIRST_WRITER_WINS);
      model.registerState('sauruman', Layer.Constants.CRDT_TYPES.LAST_WRITER_WINS);
      model.registerState('hey', Layer.Constants.CRDT_TYPES.FIRST_WRITER_WINS);
      model.addState('frodo', 'dodo');
      model.addState('sauruman', 'nincompoop');
      model._addInitialState('frodo', 'modo', user2, 'aaaa');
      model._addInitialState('sauruman', 'nincompoop2', user2, 'aaaa' );
    });
    afterEach(function() {
      model.destroy();
    });
    it("Should return the specified result", function() {
      expect(model.getState('frodo', user1)).toEqual("dodo");
      expect(model.getState('frodo', user2)).toEqual("modo");
    });

    it("Should throw error if key is not registered", function() {
      expect(function() {
        expect(model.getState('bilbo', user1)).toBe(null);
      }).toThrowError(Layer.Core.LayerError.ErrorDictionary.modelStateNotRegistered);
    });

    it("Should return null if identity has no entry", function() {
      expect(model.getState('frodo', new Layer.Core.Identity({userId: 'userC'}))).toBe(null);
    });
  });

  describe("The getStates() method", function() {
    var model, parentModel;
    beforeEach(function() {
      parentModel = new Layer.Core.MessageTypeModel({});
      model = parentModel.responses;
      model.registerState('frodo', Layer.Constants.CRDT_TYPES.FIRST_WRITER_WINS);
      model.registerState('sauruman', Layer.Constants.CRDT_TYPES.LAST_WRITER_WINS);
      model.registerState('bilbo', Layer.Constants.CRDT_TYPES.FIRST_WRITER_WINS);
      model.addState('frodo', 'dodo');
      model.addState('sauruman', 'nincompoop');

      model._addInitialState('frodo', 'modo', user2, 'bbbb');
      model._addInitialState('bilbo', 'bagged', user2, 'ccccc' );
    });
    afterEach(function() {
      model.destroy();
    });

    it("Should return all values of frodo", function() {
      expect(model.getStates('frodo', [user1, user2])).toEqual([
        {identityId: user1.id, value: 'dodo'},
        {identityId: user2.id, value: 'modo'}
      ]);
    });

    it("Should return all values of frodo for userB", function() {
      expect(model.getStates('frodo', [user2])).toEqual([
        {identityId: user2.id, value: 'modo'}
      ]);
    });

    it("Should return one value for bilbo and one for sauruman", function() {
      expect(model.getStates('bilbo', [user1, user2])).toEqual([
        {identityId: user2.id, value: 'bagged'}
      ]);

      expect(model.getStates('sauruman', [user1, user2])).toEqual([
        {identityId: user1.id, value: 'nincompoop'}
      ]);
    });

    it("Should return one value for bilbo and zero for sauruman for user2", function() {
      expect(model.getStates('bilbo', [user2])).toEqual([
        {identityId: user2.id, value: 'bagged'}
      ]);

      expect(model.getStates('sauruman', [user2])).toEqual([
      ]);
    });
  });

  describe("The MultiIdentityStateTrackers", function() {
    it("Should create one per registered state", function() {
      // test 1
      var model = new Layer.Core.MessageTypeModel({});
      expect(model.responses._trackers).toEqual({});

      // test 2
      model.responses.registerState('hey', Layer.Constants.CRDT_TYPES.FIRST_WRITER_WINS);
      expect(model.responses._trackers).toEqual({
        hey: jasmine.any(Layer.Core.CRDT.CRDTMultiIdentityStateTracker)
      });

      // test 3
      model.responses.registerState('ho', Layer.Constants.CRDT_TYPES.SET);
      expect(model.responses._trackers).toEqual({
        hey: jasmine.any(Layer.Core.CRDT.CRDTMultiIdentityStateTracker),
        ho: jasmine.any(Layer.Core.CRDT.CRDTMultiIdentityStateTracker)
      });
    });
  });
});
