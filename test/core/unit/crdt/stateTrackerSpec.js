/* eslint-disable */
describe("The CRDT Tracker class", function() {
  var appId = "Fred's App";
  var conversation,
      client,
      user1, user2,
      setTracker,
      fwwTracker,
      lwwTracker,
      lwwnTracker,
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
      client.userId = "frodo";
      client.user = new Layer.Core.Identity({userId: 'frodo'});


      client._clientAuthenticated();
      client._clientReady();
      client.onlineManager.isOnline = true;

      user1 = client.user;
      user2 = new Layer.Core.Identity({userId: 'userB'});

      conversation = Layer.Core.Conversation._createFromServer(responses.conversation2).conversation;
      requests.reset();
      client.syncManager.queue = [];

      setTracker = new Layer.Core.CRDT.CRDTStateTracker({
        name: "fred",
        type: Layer.Constants.CRDT_TYPES.SET,
        userId: client.user.userId
      });
      fwwTracker = new Layer.Core.CRDT.CRDTStateTracker({
        name: "fred",
        type: Layer.Constants.CRDT_TYPES.FIRST_WRITER_WINS,
        userId: client.user.userId
      });
      lwwTracker = new Layer.Core.CRDT.CRDTStateTracker({
        name: "fred",
        type: Layer.Constants.CRDT_TYPES.LAST_WRITER_WINS,
        userId: client.user.userId
      });
      lwwnTracker = new Layer.Core.CRDT.CRDTStateTracker({
        name: "fred",
        type: Layer.Constants.CRDT_TYPES.LAST_WRITER_WINS_NULLABLE,
        userId: client.user.userId
      });
  });
  afterEach(function() {
      client.destroy();
      jasmine.Ajax.uninstall();
  });

  describe("Public API", function() {
    it("Should add a value", function() {
      setTracker.add("frodo");
      fwwTracker.add("frodo");
      lwwTracker.add("frodo");
      lwwnTracker.add("frodo");

      expect(setTracker.getValue()).toEqual(["frodo"]);
      expect(fwwTracker.getValue()).toEqual("frodo");
      expect(lwwTracker.getValue()).toEqual("frodo");
      expect(lwwnTracker.getValue()).toEqual("frodo");
    });

    it("Should add a second value", function() {
      setTracker.add("frodo");
      fwwTracker.add("frodo");
      lwwTracker.add("frodo");
      lwwnTracker.add("frodo");

      setTracker.add("dodo");
      fwwTracker.add("dodo");
      lwwTracker.add("dodo");
      lwwnTracker.add("dodo");

      expect(setTracker.getValue()).toEqual(["frodo", "dodo"]);
      expect(fwwTracker.getValue()).toEqual("frodo");
      expect(lwwTracker.getValue()).toEqual("dodo");
      expect(lwwnTracker.getValue()).toEqual("dodo");
    });

    it("Should remove a value", function() {
      setTracker.add("frodo");
      fwwTracker.add("frodo");
      lwwTracker.add("frodo");
      lwwnTracker.add("frodo");

      setTracker.add("dodo");
      fwwTracker.add("dodo");
      lwwTracker.add("dodo");
      lwwnTracker.add("dodo");

      setTracker.remove("frodo");
      fwwTracker.remove("frodo");
      lwwTracker.remove("dodo"); // remove the value that is present
      lwwnTracker.remove("dodo"); // remove the value that is present

      expect(setTracker.getValue()).toEqual(["dodo"]);
      expect(fwwTracker.getValue()).toEqual("frodo");
      expect(lwwTracker.getValue()).toEqual("dodo");
      expect(lwwnTracker.getValue()).toEqual(null);
    });

    it("Should remove a missing value", function() {
      setTracker.add("frodo");
      fwwTracker.add("frodo");
      lwwTracker.add("frodo");
      lwwnTracker.add("frodo");

      setTracker.add("dodo");
      fwwTracker.add("dodo");
      lwwTracker.add("dodo");
      lwwnTracker.add("dodo");

      setTracker.remove("sauruman");
      fwwTracker.remove("sauruman");
      lwwTracker.remove("sauruman"); // remove the value that is present
      lwwnTracker.remove("sauruman"); // remove the value that is present

      expect(setTracker.getValue()).toEqual(["frodo", "dodo"]);
      expect(fwwTracker.getValue()).toEqual("frodo");
      expect(lwwTracker.getValue()).toEqual("dodo");
      expect(lwwnTracker.getValue()).toEqual("dodo");
    });

    it("Should not add a redundant value", function() {
      setTracker.add("frodo");
      fwwTracker.add("frodo");
      lwwTracker.add("frodo");
      lwwnTracker.add("frodo");

      setTracker.add("frodo");
      fwwTracker.add("frodo");
      lwwTracker.add("frodo");
      lwwnTracker.add("frodo");

      expect(setTracker.getValue()).toEqual(["frodo"]);
      expect(fwwTracker.getValue()).toEqual("frodo");
      expect(lwwTracker.getValue()).toEqual("frodo");
      expect(lwwnTracker.getValue()).toEqual("frodo");
    });

    it("Should generate add operations", function() {
      expect(setTracker.add("frodo")).toEqual([jasmine.objectContaining({
        operation: 'add',
        type: Layer.Constants.CRDT_TYPES.SET,
        name: 'fred',
        value: 'frodo',
        userId: client.user.userId,
        oldValue: [],
        id: jasmine.any(String),
      })]);

      expect(fwwTracker.add("frodo")).toEqual([jasmine.objectContaining({
        operation: 'add',
        type: Layer.Constants.CRDT_TYPES.FIRST_WRITER_WINS,
        name: 'fred',
        value: 'frodo',
        userId: client.user.userId,
        oldValue: null,
        id: jasmine.any(String),
      })]);

      expect(lwwTracker.add("frodo")).toEqual([jasmine.objectContaining({
        operation: 'add',
        type: Layer.Constants.CRDT_TYPES.LAST_WRITER_WINS,
        name: 'fred',
        value: 'frodo',
        userId: client.user.userId,
        oldValue: null,
        id: jasmine.any(String),
      })]);

      expect(lwwnTracker.add("frodo")).toEqual([jasmine.objectContaining({
        operation: 'add',
        type: Layer.Constants.CRDT_TYPES.LAST_WRITER_WINS_NULLABLE,
        name: 'fred',
        value: 'frodo',
        userId: client.user.userId,
        oldValue: null,
        id: jasmine.any(String),
      })]);
    });

    it("Should not generate add operations for no-ops", function() {
      setTracker.add("frodo");
      fwwTracker.add("frodo");
      lwwTracker.add("frodo");
      lwwnTracker.add("frodo");

      expect(setTracker.add("frodo")).toEqual([]);
      expect(fwwTracker.add("frodo")).toEqual([]);
      expect(lwwTracker.add("frodo")).toEqual([]);
      expect(lwwnTracker.add("frodo")).toEqual([]);
    });

    it("Should generate remove operations", function() {
      setTracker.add("frodo");
      fwwTracker.add("frodo");
      lwwTracker.add("frodo");
      lwwnTracker.add("frodo");

      expect(setTracker.remove("frodo")).toEqual([jasmine.objectContaining({
        operation: 'remove',
        type: Layer.Constants.CRDT_TYPES.SET,
        name: 'fred',
        value: 'frodo',
        userId: client.user.userId,
        oldValue: null,
        id: jasmine.any(String),
      })]);

      expect(fwwTracker.remove("frodo")).toEqual([]);

      expect(lwwTracker.remove("frodo")).toEqual([]);

      expect(lwwnTracker.remove("frodo")).toEqual([jasmine.objectContaining({
        operation: 'remove',
        type: Layer.Constants.CRDT_TYPES.LAST_WRITER_WINS_NULLABLE,
        name: 'fred',
        oldValue: null,
        userId: client.user.userId,
        value: 'frodo',
        id: jasmine.any(String),
      })]);
    });

    it("Should generate add and remove operations if initialState", function() {
      setTracker.add("frodo", "abc");
      fwwTracker.add("frodo", "abc");
      lwwTracker.add("frodo", "abc");
      lwwnTracker.add("frodo", "abc");

      expect(setTracker.add("dodo")).toEqual([jasmine.objectContaining({
        operation: 'add',
        type: Layer.Constants.CRDT_TYPES.SET,
        name: 'fred',
        value: 'dodo',
        userId: client.user.userId,
        oldValue: ['frodo'],
        id: jasmine.any(String),
      })]);

      expect(fwwTracker.add("dodo")).toEqual([]);

      expect(lwwTracker.add("dodo")).toEqual([jasmine.objectContaining({
        operation: 'remove',
        type: Layer.Constants.CRDT_TYPES.LAST_WRITER_WINS,
        name: 'fred',
        oldValue: null,
        userId: client.user.userId,
        value: 'frodo',
        id: 'abc',
      }), jasmine.objectContaining({
        operation: 'add',
        type: Layer.Constants.CRDT_TYPES.LAST_WRITER_WINS,
        name: 'fred',
        value: 'dodo',
        userId: client.user.userId,
        oldValue: 'frodo',
        id: jasmine.any(String),
      })]);

      expect(lwwnTracker.add("dodo")).toEqual([jasmine.objectContaining({
        operation: 'remove',
        type: Layer.Constants.CRDT_TYPES.LAST_WRITER_WINS_NULLABLE,
        name: 'fred',
        oldValue: null,
        userId: client.user.userId,
        value: 'frodo',
        id: 'abc',
      }), jasmine.objectContaining({
        operation: 'add',
        type: Layer.Constants.CRDT_TYPES.LAST_WRITER_WINS_NULLABLE,
        name: 'fred',
        value: 'dodo',
        userId: client.user.userId,
        oldValue: 'frodo',
        id: jasmine.any(String),
      })]);
    });
  });

  describe("Sychronize API", function() {
    it("Should initialize data", function() {
      setTracker = new Layer.Core.CRDT.CRDTStateTracker({
        name: "fred",
        type: Layer.Constants.CRDT_TYPES.SET,
        userId: client.user.userId
      });
      fwwTracker = new Layer.Core.CRDT.CRDTStateTracker({
        name: "fred",
        type: Layer.Constants.CRDT_TYPES.FIRST_WRITER_WINS,
        userId: client.user.userId
      });
      lwwTracker = new Layer.Core.CRDT.CRDTStateTracker({
        name: "fred",
        type: Layer.Constants.CRDT_TYPES.LAST_WRITER_WINS,
        userId: client.user.userId
      });
      lwwnTracker = new Layer.Core.CRDT.CRDTStateTracker({
        name: "fred",
        type: Layer.Constants.CRDT_TYPES.LAST_WRITER_WINS_NULLABLE,
        userId: client.user.userId
      });

      var body = {
        frodo: {
          fred: {
            adds: [{
              value: "frodo",
              ids: ["abc"]
            }],
            removes: ["bcd"]
          }
        }
      };

      setTracker.synchronize(body);
      fwwTracker.synchronize(body);
      lwwTracker.synchronize(body);
      lwwnTracker.synchronize(body);

      expect(setTracker.adds).toEqual([jasmine.objectContaining({
        value: "frodo",
        ids: ["abc"]
      })]);
      expect(setTracker.removes).toEqual(new Set(["bcd"]));
      expect(setTracker.getValue()).toEqual(["frodo"]);

      expect(fwwTracker.adds).toEqual([jasmine.objectContaining({
        value: "frodo",
        ids: ["abc"]})]);
      expect(fwwTracker.removes).toEqual(new Set(["bcd"]));
      expect(fwwTracker.getValue()).toEqual("frodo");

      expect(lwwTracker.adds).toEqual([jasmine.objectContaining({
        value: "frodo", ids: ["abc"]
      })]);
      expect(lwwTracker.removes).toEqual(new Set(["bcd"]));
      expect(lwwTracker.getValue()).toEqual("frodo");

      expect(lwwnTracker.adds).toEqual([jasmine.objectContaining({
        value: "frodo", ids: ["abc"]
      })]);
      expect(lwwnTracker.removes).toEqual(new Set(["bcd"]));
      expect(lwwnTracker.getValue()).toEqual("frodo");
    });

    it("Should update data", function() {
      setTracker = new Layer.Core.CRDT.CRDTStateTracker({
        name: "fred",
        type: Layer.Constants.CRDT_TYPES.SET,
        userId: client.user.userId
      });
      fwwTracker = new Layer.Core.CRDT.CRDTStateTracker({
        name: "fred",
        type: Layer.Constants.CRDT_TYPES.FIRST_WRITER_WINS,
        userId: client.user.userId
      });
      lwwTracker = new Layer.Core.CRDT.CRDTStateTracker({
        name: "fred",
        type: Layer.Constants.CRDT_TYPES.LAST_WRITER_WINS,
        userId: client.user.userId
      });
      lwwnTracker = new Layer.Core.CRDT.CRDTStateTracker({
        name: "fred",
        type: Layer.Constants.CRDT_TYPES.LAST_WRITER_WINS_NULLABLE,
        userId: client.user.userId
      });

      setTracker.add("dodo");
      fwwTracker.add("dodo");
      lwwTracker.add("dodo");
      lwwnTracker.add("dodo");

      var body = {
        frodo: {
          fred: {
            adds: [{
              value: "frodo",
              ids: ["abc"]
            }],
            removes: ["bcd"]
          }
        }
      };

      setTracker.synchronize(body);
      fwwTracker.synchronize(body);
      lwwTracker.synchronize(body);
      lwwnTracker.synchronize(body);

      expect(setTracker.adds).toEqual([
        jasmine.objectContaining({value: "frodo", ids: ["abc"]}),
        jasmine.objectContaining({value: "dodo", ids: [jasmine.any(String)]})
      ]);
      expect(setTracker.removes).toEqual(new Set(["bcd"]));
      expect(setTracker.getValue()).toEqual(["frodo", "dodo"]);

      expect(fwwTracker.adds).toEqual([
        jasmine.objectContaining({value: "frodo", ids: ["abc"]})
      ]);
      expect(fwwTracker.removes).toEqual(new Set(["bcd", jasmine.any(String)]));
      expect(fwwTracker.getValue()).toEqual("frodo");

      expect(lwwTracker.adds).toEqual([
        jasmine.objectContaining({value: "dodo", ids: [jasmine.any(String)]})
      ]);
      expect(lwwTracker.removes).toEqual(new Set(["bcd", "abc"]));
      expect(lwwTracker.getValue()).toEqual("dodo");

      expect(lwwnTracker.adds).toEqual([
        jasmine.objectContaining({value: "dodo", ids: [jasmine.any(String)]})
      ]);
      expect(lwwnTracker.removes).toEqual(new Set(["bcd", "abc"]));
      expect(lwwnTracker.getValue()).toEqual("dodo");
    });

    it("Should block values", function() {
      setTracker = new Layer.Core.CRDT.CRDTStateTracker({
        name: "fred",
        type: Layer.Constants.CRDT_TYPES.SET,
        userId: client.user.userId
      });
      fwwTracker = new Layer.Core.CRDT.CRDTStateTracker({
        name: "fred",
        type: Layer.Constants.CRDT_TYPES.FIRST_WRITER_WINS,
        userId: client.user.userId
      });
      lwwTracker = new Layer.Core.CRDT.CRDTStateTracker({
        name: "fred",
        type: Layer.Constants.CRDT_TYPES.LAST_WRITER_WINS,
        userId: client.user.userId
      });
      lwwnTracker = new Layer.Core.CRDT.CRDTStateTracker({
        name: "fred",
        type: Layer.Constants.CRDT_TYPES.LAST_WRITER_WINS_NULLABLE,
        userId: client.user.userId
      });

      setTracker.add("dodo", "bcd");
      fwwTracker.add("dodo", "bcd");
      lwwTracker.add("dodo", "bcd");
      lwwnTracker.add("dodo", "bcd");

      var body = {
        frodo: {
          fred: {
            adds: [],
            removes: ["bcd"]
          }
        }
      };

      setTracker.synchronize(body);
      fwwTracker.synchronize(body);
      lwwTracker.synchronize(body);
      lwwnTracker.synchronize(body);

      expect(setTracker.getValue()).toEqual([]);
      expect(fwwTracker.getValue()).toEqual(null);
      expect(lwwTracker.getValue()).toEqual(null);
      expect(lwwnTracker.getValue()).toEqual(null);
    });
  });
});
