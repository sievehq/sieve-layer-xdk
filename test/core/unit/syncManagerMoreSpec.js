/* eslint-disable */
describe("The SyncManager More Class", function() {
  var socket, client, syncManager;
  var appId = "Fred's App";

  beforeEach(function() {
      jasmine.clock().install();
      jasmine.Ajax.install();
      requests = jasmine.Ajax.requests;
      client = new Layer.Core.Client({
          appId: appId,
          url: "https://huh.com"
      });
      client.sessionToken = "sessionToken";
      client.user = new Layer.Core.Identity({
          userId: "Frodo",
          id: "layer:///identities/" + "Frodo",
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

      conversation = client._createObject(responses.conversation1).conversation;
      requests.reset();
      client.syncManager.queue = [];
      jasmine.clock().tick(1);
      Layer.Utils.defer.flush();
      syncManager = new Layer.Core.SyncManager({
          onlineManager: client.onlineManager,
          socketManager: client.socketManager,
          requestManager: client.socketRequestManager
      });
      client.onlineManager.isOnline = true;
      client.socketManager._socket = {
          send: function() {},
          addEventListener: function() {},
          removeEventListener: function() {},
          close: function() {},
          readyState: WebSocket.OPEN
      };

  });

  afterEach(function() {
      if (!client.isDestroyed) client.destroy();
      if (!syncManager.isDestroyed) syncManager.destroy();
      jasmine.Ajax.uninstall();
      jasmine.clock().uninstall();
  });
  describe("The constructor() method", function() {
    it("Should return a SyncManager instance", function() {
        var syncManager = new Layer.Core.SyncManager({
            onlineManager: client.onlineManager,
            socketManager: client.socketManager,
            requestManager: client.socketRequestManager
        });
        expect(syncManager).toEqual(jasmine.any(Layer.Core.SyncManager));
        syncManager.destroy();
    });

    it("Should listen for client.ready", function() {
        var tmp = Layer.Core.SyncManager.prototype._processNextRequest;
        spyOn(Layer.Core.SyncManager.prototype , "_processNextRequest");
        spyOn(Layer.Core.SyncManager.prototype , "_loadPersistedQueue");

        var syncManager = new Layer.Core.SyncManager({
            onlineManager: client.onlineManager,
            socketManager: client.socketManager,
            requestManager: client.socketRequestManager
        });


        // Run
        client.trigger("ready");

        // Posttest
        expect(syncManager._processNextRequest).toHaveBeenCalled();
        expect(syncManager._loadPersistedQueue).toHaveBeenCalledWith();

        // Restore
        Layer.Core.SyncManager.prototype._processNextRequest = tmp;
        syncManager.destroy();
    });

    it("Should listen for onlineManager.connected", function() {
        var tmp = Layer.Core.SyncManager.prototype._onlineStateChange;
        spyOn(Layer.Core.SyncManager.prototype, "_onlineStateChange");
        var syncManager = new Layer.Core.SyncManager({
            onlineManager: client.onlineManager,
            socketManager: client.socketManager,
        });

        // Run
        client.onlineManager.trigger("disconnected");

        // Posttest
        expect(syncManager._onlineStateChange).toHaveBeenCalledWith(jasmine.any(Layer.Core.LayerEvent));

        // Restore
        Layer.Core.SyncManager.prototype._onlineStateChange = tmp;
        syncManager.destroy();
    });

    it("Should listen for socketManager.connected", function() {
        var tmp = Layer.Core.SyncManager.prototype._onlineStateChange;
        spyOn(Layer.Core.SyncManager.prototype, "_onlineStateChange");
        var syncManager = new Layer.Core.SyncManager({
            onlineManager: client.onlineManager,
            socketManager: client.socketManager,
        });

        // Run
        client.socketManager.trigger("connected");

        // Posttest
        expect(syncManager._onlineStateChange).toHaveBeenCalledWith(jasmine.any(Layer.Core.LayerEvent));

        // Restore
        Layer.Core.SyncManager.prototype._onlineStateChange = tmp;
        syncManager.destroy();
    });

    it("Should listen for socketManager.disconnected", function() {
        var tmp = Layer.Core.SyncManager.prototype._onlineStateChange;
        spyOn(Layer.Core.SyncManager.prototype, "_onlineStateChange");
        var syncManager = new Layer.Core.SyncManager({
            onlineManager: client.onlineManager,
            socketManager: client.socketManager,
        });

        // Run
        client.socketManager.trigger("disconnected");

        // Posttest
        expect(syncManager._onlineStateChange).toHaveBeenCalledWith(jasmine.any(Layer.Core.LayerEvent));

        // Restore
        Layer.Core.SyncManager.prototype._onlineStateChange = tmp;
        syncManager.destroy();
    });
  });

  describe("The _onlineStateChange() method", function () {
    it("Should schedule a call for _processNextRequest if connected", function() {
        spyOn(syncManager, "_processNextRequest");

        // Run
        client.socketManager.trigger("connected");

        // Midtest
        expect(syncManager._processNextRequest).not.toHaveBeenCalled();

        jasmine.clock().tick(100);
        Layer.Utils.defer.flush();

        // Posttest
        expect(syncManager._processNextRequest).toHaveBeenCalled();
    });

    it("Should increment returnToOnlineCount if connected", function() {
        spyOn(syncManager, "_processNextRequest");
        syncManager.queue = [new Layer.Core.XHRSyncEvent({})];
        expect(syncManager.queue[0].returnToOnlineCount).toEqual(0);

        // Run
        client.socketManager.trigger("connected");

        // Posttest
        expect(syncManager.queue[0].returnToOnlineCount).toEqual(1);

        client.socketManager.trigger("connected");

        expect(syncManager.queue[0].returnToOnlineCount).toEqual(2);
    });

    it("Should reset syncQueue firing property if disconnected", function() {
        spyOn(syncManager, "_processNextRequest");
        syncManager.queue = [new Layer.Core.XHRSyncEvent({isFiring: true})];
        expect(syncManager.queue[0].isFiring).toBe(true);

        // Run
        client.socketManager.trigger("disconnected");

        // Posttest
        expect(syncManager.queue[0].isFiring).toBe(false);
    });

    it("Should reset receiptQueue firing property if disconnected", function() {
        spyOn(syncManager, "_processNextRequest");
        syncManager.receiptQueue = [new Layer.Core.XHRSyncEvent({isFiring: true}), new Layer.Core.XHRSyncEvent({isFiring: true}), new Layer.Core.XHRSyncEvent({isFiring: true})];
        expect(syncManager.receiptQueue[1].isFiring).toBe(true);

        // Run
        client.socketManager.trigger("disconnected");

        // Posttest
        expect(syncManager.receiptQueue[0].isFiring).toBe(false);
        expect(syncManager.receiptQueue[1].isFiring).toBe(false);
        expect(syncManager.receiptQueue[2].isFiring).toBe(false);
    });
  });

  describe("The request() method", function() {
    var evt;
    beforeEach(function() {
        client._clientReady();
        evt = new Layer.Core.XHRSyncEvent({
            operation: "PATCH",
            target: "fred"
        });
    });

    it("Should add a PATCH request", function() {
        syncManager.request(evt);
        expect(syncManager.queue).toEqual([evt]);
    });


    it("Should NOT add a PATCH request if there is a CREATE request for the same target", function() {
        var createEvt = new Layer.Core.XHRSyncEvent({
            operation: "POST",
            target: "fred"
        });
        syncManager.queue = [createEvt];

        // Run
        syncManager.request(evt);

        // Posttest
        expect(syncManager.queue).toEqual([createEvt]);
    });

    it("Should add a PATCH request if there is a CREATE request for a different target", function() {
        var createEvt = new Layer.Core.XHRSyncEvent({
            operation: "POST",
            target: "fred2"
        });
        syncManager.queue = [createEvt];

        // Run
        syncManager.request(evt);

        // Posttest
        expect(syncManager.queue).toEqual([createEvt, evt]);

    });

    it("Should trigger sync:add event", function() {
        spyOn(syncManager, "trigger");
        syncManager.request(evt);
        expect(syncManager.trigger).toHaveBeenCalledWith('sync:add', {
            request: evt,
            target: evt.target
        });

    });

    it("Should add a DELETE request", function() {
        evt.operation = "DELETE";
        syncManager.request(evt);
        expect(syncManager.queue).toEqual([evt]);
    });

    it("Should call _purgeOnDelete when adding a DELETE request", function() {
        spyOn(syncManager, "_purgeOnDelete");
        evt.operation = "DELETE";
        syncManager.request(evt);
        expect(syncManager._purgeOnDelete).toHaveBeenCalledWith(evt);
    });

    it("Should call _processNextRequest", function() {
        spyOn(syncManager, "_processNextRequest");
        syncManager.request(evt);
        expect(syncManager._processNextRequest).toHaveBeenCalledWith(evt);
    });

    it("Should add a receipt request to the receipts queue", function() {
        var receiptEvt = new Layer.Core.XHRSyncEvent({
            operation: "RECEIPT"
        });

        // Run
        syncManager.request(receiptEvt);

        // Posttest
        expect(syncManager.receiptQueue).toEqual([receiptEvt]);

    });
  });

  describe("The _processNextRequest() method", function() {
    var evt;
    beforeEach(function() {
        client._clientReady();
        evt = new Layer.Core.XHRSyncEvent({
            operation: "PATCH",
            target: "fred"
        });
    });

    it("Should call _processNextStandardRequest if this is the first request in the queue and no arguments", function() {
        spyOn(syncManager, "_processNextStandardRequest");
        syncManager.queue = [evt];
        syncManager._processNextRequest();
        expect(syncManager._processNextStandardRequest).toHaveBeenCalledWith();
    });

    it("Should not fire any requests if there are firing requests in the queue and no arguments", function() {
        syncManager.queue = [evt];
        evt.isFiring = true;
        spyOn(syncManager, "_processNextStandardRequest");
        syncManager._processNextRequest();
        expect(syncManager._processNextStandardRequest).not.toHaveBeenCalled();
    });

    it("Should call dbManager.writeSyncEvents and then _processNextStandardRequest if this is the first request in the queue and an argument", function() {
        spyOn(syncManager, "_processNextStandardRequest");
        spyOn(client.dbManager, "writeSyncEvents").and.callFake(function(data, callback) {
            expect(syncManager._processNextStandardRequest).not.toHaveBeenCalled();
            callback();
        });
        syncManager.queue = [evt];
        syncManager._processNextRequest(evt);
        expect(syncManager._processNextStandardRequest).toHaveBeenCalledWith();
    });

    it("Should fire requests if there are multiple nonfiring requests in the queue", function() {
        syncManager.queue = [evt, new Layer.Core.XHRSyncEvent({})];
        evt.isFiring = false;
        spyOn(syncManager, "_processNextStandardRequest");
        syncManager._processNextRequest();
        expect(syncManager._processNextStandardRequest).toHaveBeenCalledWith();
    });

    it("Should call _processNextReceiptRequest if there are ANY requests in the receipts queue", function() {
        syncManager.queue = [];
        syncManager.receiptQueue = [
            new Layer.Core.XHRSyncEvent({
                operation: "RECEIPT"
            }),
            new Layer.Core.XHRSyncEvent({
                operation: "RECEIPT"
            })
        ];
        syncManager.receiptQueue.isFiring = true;
        spyOn(syncManager, "_processNextReceiptRequest");

        // Run
        syncManager._processNextRequest();

        // Posttest
        expect(syncManager._processNextReceiptRequest).toHaveBeenCalledWith();
    });
  });


  describe("The _processNextStandardRequest() method", function() {
    beforeEach(function() {
      client._clientReady();
    });
    it("Should call socketManager.sendRequest", function() {
        var data = {name: "fred"}
        syncManager.queue = [new Layer.Core.WebsocketSyncEvent({
            data: data
        })];
        spyOn(syncManager.requestManager, "sendRequest");

        // Run
        syncManager._processNextStandardRequest();

        // Posttest
        expect(syncManager.requestManager.sendRequest).toHaveBeenCalledWith({
            data: data,
            callback: jasmine.any(Function),
            isChangesArray: false
        });
    });

    it("Should call socketManager.sendRequest with returnChangesArray", function() {
        var data = {name: "fred"}
        syncManager.queue = [new Layer.Core.WebsocketSyncEvent({
            data: data,
            returnChangesArray: true
        })];
        spyOn(syncManager.requestManager, "sendRequest");

        // Run
        syncManager._processNextStandardRequest();

        // Posttest
        expect(syncManager.requestManager.sendRequest).toHaveBeenCalledWith({
            data: data,
            callback: jasmine.any(Function),
            isChangesArray: true
        });
    });

    it("Should call xhr", function() {
        syncManager.queue = [new Layer.Core.XHRSyncEvent({
            data: "fred",
            url: "fred2",
            method: "PATCH"
        })];

        // Run
        syncManager._processNextStandardRequest();

        // Posttest
        expect(requests.mostRecent().url).toEqual("fred2");
        expect(requests.mostRecent().method).toEqual("PATCH");
        expect(requests.mostRecent().params).toEqual("fred");

    });

    it("Should set firing to true", function() {
        syncManager.queue = [new Layer.Core.WebsocketSyncEvent({
            data: {name: "fred"}
        })];
        expect(syncManager.queue[0].isFiring).toBe(false);

        // Run
        syncManager._processNextStandardRequest();

        // Posttest
        expect(syncManager.queue[0].isFiring).toBe(true);
    });

    it("Should only allow one call to be within _validateRequest", function() {
        spyOn(syncManager, "_validateRequest");
        syncManager.queue = [new Layer.Core.WebsocketSyncEvent({
            data: {name: "fred"}
        })];

        // Run
        syncManager._processNextStandardRequest();
        expect(syncManager.queue[0]._isValidating).toBe(true);
        expect(syncManager._validateRequest.calls.count()).toEqual(1);
        syncManager._processNextStandardRequest();

        // Posttest
        expect(syncManager.queue[0]._isValidating).toBe(true);
        expect(syncManager._validateRequest.calls.count()).toEqual(1);
    });

    it("Should call abort if isDestroyed", function() {
        var data = {name: "fred"}
        syncManager.queue = [new Layer.Core.WebsocketSyncEvent({
            data: data
        })];
        spyOn(syncManager.requestManager, "sendRequest");
        syncManager.isDestroyed = true;

        // Run
        syncManager._processNextStandardRequest();

        // Posttest
        expect(syncManager.requestManager.sendRequest).not.toHaveBeenCalled();
        syncManager.isDestroyed = false;
    });

    it("Should call abort if not authenticated", function() {
        var data = {name: "fred"}
        syncManager.queue = [new Layer.Core.WebsocketSyncEvent({
            data: data
        })];
        spyOn(syncManager.requestManager, "sendRequest");
        client.isAuthenticated = false;

        // Run
        syncManager._processNextStandardRequest();

        // Posttest
        expect(syncManager.requestManager.sendRequest).not.toHaveBeenCalled();
    });

    it("Should call xhr with forced update of auth header", function() {
        var token = client.sessionToken
        client.xhr({
            url: "fred",
            method: "POST",
            sync: {}
        });
        syncManager.queue = [new Layer.Core.XHRSyncEvent({
            data: "fred",
            url: "fred2",
            method: "PATCH"
        })];

        client.sessionToken = "fred";
        expect(token).not.toEqual("fred");

        // Run
        syncManager._processNextStandardRequest();

        // Posttest
        expect(requests.mostRecent().requestHeaders.authorization).toEqual("Layer session-token=\"fred\"");
        expect(requests.mostRecent().method).toEqual("PATCH");
        expect(requests.mostRecent().params).toEqual("fred");
    });
  });

  describe("The _processNextReceiptRequest() method", function() {
    beforeEach(function() {
      client._clientReady();
    });
    it("Should fire up to 5 receiptRequests", function() {
        syncManager.receiptQueue = [
            new Layer.Core.XHRSyncEvent({operation: "RECEIPT"}),
            new Layer.Core.XHRSyncEvent({operation: "RECEIPT"}),
            new Layer.Core.XHRSyncEvent({operation: "RECEIPT"}),
            new Layer.Core.XHRSyncEvent({operation: "RECEIPT"}),
            new Layer.Core.XHRSyncEvent({operation: "RECEIPT"}),
            new Layer.Core.XHRSyncEvent({operation: "RECEIPT"}),
            new Layer.Core.XHRSyncEvent({operation: "RECEIPT"}),
            new Layer.Core.XHRSyncEvent({operation: "RECEIPT"})
        ];

        // Run
        syncManager._processNextReceiptRequest();

        // Posttest
        expect(syncManager.receiptQueue[0].isFiring).toBe(true);
        expect(syncManager.receiptQueue[1].isFiring).toBe(true);
        expect(syncManager.receiptQueue[2].isFiring).toBe(true);
        expect(syncManager.receiptQueue[3].isFiring).toBe(true);
        expect(syncManager.receiptQueue[4].isFiring).toBe(false);
        expect(syncManager.receiptQueue[5].isFiring).toBe(false);
        expect(syncManager.receiptQueue[6].isFiring).toBe(false);
        expect(syncManager.receiptQueue[7].isFiring).toBe(false);
        expect(requests.count()).toEqual(4);
    });
  });


  describe("The _xhrResult() method", function() {
    beforeEach(function() {
        syncManager.queue = [new Layer.Core.XHRSyncEvent({
            data: "fred",
            url: "fred2",
            method: "PATCH"
        })];
        spyOn(syncManager, "_xhrError");
        spyOn(syncManager, "_xhrSuccess");
    });

    it("Should set firing to false", function() {
        syncManager.queue[0].isFiring = true;
        syncManager._xhrResult({}, syncManager.queue[0]);
        expect(syncManager.queue[0].isFiring).toBe(false);
    });

    it("Should put the request into the result", function() {
        var result = {};
        syncManager._xhrResult(result, syncManager.queue[0]);
        expect(result).toEqual({request: syncManager.queue[0]});
    });

    it("Should call _xhrSuccess", function() {
        var result = {success: true};
        syncManager._xhrResult(result, syncManager.queue[0]);
        expect(syncManager._xhrSuccess).toHaveBeenCalledWith(result);
        expect(syncManager._xhrError).not.toHaveBeenCalled();
    });

    it("Should call _xhrSuccess if _handleDeduplicationErrors changes success to true", function() {
        var result = {success: false};
        spyOn(syncManager, "_handleDeduplicationErrors").and.callFake(function(result) {
          result.success = true;
        });

        syncManager._xhrResult(result, syncManager.queue[0]);
        expect(syncManager._xhrSuccess).toHaveBeenCalledWith(result);
        expect(syncManager._xhrError).not.toHaveBeenCalled();
    });

    it("Should call _xhrError", function() {
        var result = {success: false};
        syncManager._xhrResult(result, syncManager.queue[0]);
        expect(syncManager._xhrSuccess).not.toHaveBeenCalled();
        expect(syncManager._xhrError).toHaveBeenCalledWith(result);
    });
  });
});
