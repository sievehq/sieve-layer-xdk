/**
 * Persistence manager.
 *
 * This class manages all indexedDB access.  It is not responsible for any localStorage access, though it may
 * receive configurations related to data stored in localStorage.  It will simply ignore those configurations.
 *
 * Rich Content will be written to IndexedDB as long as its small; see Layer.Core.DbManager.MaxPartSize for more info.
 *
 * TODO:
 * 0. Redesign this so that knowledge of the data is not hard-coded in
 * @class Layer.Core.DbManager
 * @protected
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _settings = require('../settings');

var _namespace = require('./namespace');

var _namespace2 = _interopRequireDefault(_namespace);

var _root = require('./root');

var _root2 = _interopRequireDefault(_root);

var _syncEvent = require('./sync-event');

var _syncEvent2 = _interopRequireDefault(_syncEvent);

var _constants = require('../constants');

var _constants2 = _interopRequireDefault(_constants);

var _utils = require('../utils');

var _utils2 = _interopRequireDefault(_utils);

var _announcement = require('./models/announcement');

var _announcement2 = _interopRequireDefault(_announcement);

var _identity = require('./models/identity');

var _identity2 = _interopRequireDefault(_identity);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } 


var DB_VERSION = 5;
var MAX_SAFE_INTEGER = 9007199254740991;
var SYNC_NEW = _constants2.default.SYNC_STATE.NEW;

function getDate(inDate) {
  return inDate ? inDate.toISOString() : null;
}

var TABLES = [{
  name: 'conversations',
  indexes: {
    created_at: ['created_at'],
    last_message_sent: ['last_message_sent']
  }
}, {
  name: 'channels',
  indexes: {
    created_at: ['created_at']
  }
}, {
  name: 'messages',
  indexes: {
    conversationId: ['conversationId', 'position']
  }
}, {
  name: 'identities',
  indexes: {}
}, {
  name: 'syncQueue',
  indexes: {}
}];

var DbManager = function (_Root) {
  _inherits(DbManager, _Root);

  /**
   * Create the DB Manager
   *
   * Key configuration is the Layer.Core.DbManager.persistenceFeatures property.
   *
   * @method constructor
   * @param {Object} options
   * @param {Object} options.persistenceFeatures
   * @return {Layer.Core.DbManager} this
   */
  function DbManager(options) {
    _classCallCheck(this, DbManager);

    // If no indexedDB, treat everything as disabled.
    var _this = _possibleConstructorReturn(this, (DbManager.__proto__ || Object.getPrototypeOf(DbManager)).call(this, options));

    if (!window.indexedDB || !options.enabled) {
      options.tables = {};
    } else {
      // Test if Arrays as keys supported, disable persistence if not
      var enabled = true;

      /* istanbul ignore next */
      try {
        window.IDBKeyRange.bound(['announcement', 0], ['announcement', MAX_SAFE_INTEGER]);
      } catch (e) {
        options.tables = {};
        enabled = false;
      }

      // If Client is a Layer.Core.ClientAuthenticator, it won't support these events; this affects Unit Tests
      if (enabled && _settings.client.constructor._supportedEvents.indexOf('conversations:add') !== -1) {
        _settings.client.on('conversations:add', function (evt) {
          return _this.writeConversations(evt.conversations);
        }, _this);
        _settings.client.on('conversations:change', function (evt) {
          return _this._updateConversation(evt.target, evt.changes);
        }, _this);
        _settings.client.on('conversations:delete conversations:sent-error', function (evt) {
          return _this.deleteObjects('conversations', [evt.target]);
        }, _this);

        _settings.client.on('channels:add', function (evt) {
          return _this.writeChannels(evt.channels);
        }, _this);
        _settings.client.on('channels:change', function (evt) {
          return _this._updateChannel(evt.target, evt.changes);
        }, _this);
        _settings.client.on('channels:delete channels:sent-error', function (evt) {
          return _this.deleteObjects('channels', [evt.target]);
        }, _this);

        _settings.client.on('messages:add', function (evt) {
          return _this.writeMessages(evt.messages);
        }, _this);
        _settings.client.on('messages:change', function (evt) {
          return _this.writeMessages([evt.target]);
        }, _this);
        _settings.client.on('messages:delete messages:sent-error', function (evt) {
          return _this.deleteObjects('messages', [evt.target]);
        }, _this);

        _settings.client.on('identities:add', function (evt) {
          return _this.writeIdentities(evt.identities);
        }, _this);
        _settings.client.on('identities:change', function (evt) {
          return _this.writeIdentities([evt.target]);
        }, _this);
        _settings.client.on('identities:unfollow', function (evt) {
          return _this.deleteObjects('identities', [evt.target]);
        }, _this);
      }

      // Sync Queue only really works properly if we have the Messages and Conversations written to the DB; turn it off
      // if that won't be the case.
      if (!options.tables.conversations && !options.tables.channels || !options.tables.messages) {
        options.tables.syncQueue = false;
      }
    }

    TABLES.forEach(function (tableDef) {
      _this['_permission_' + tableDef.name] = Boolean(options.tables[tableDef.name]);
    });
    _this._open(false);
    return _this;
  }

  _createClass(DbManager, [{
    key: '_getDbName',
    value: function _getDbName() {
      return 'LayerXDK_' + _settings.client.appId;
    }

    /**
     * Open the Database Connection.
     *
     * This is only called by the constructor.
     * @method _open
     * @param {Boolean} retry
     * @private
     */

  }, {
    key: '_open',
    value: function _open(retry) {
      var _this2 = this;

      if (this.db) {
        this.db.close();
        delete this.db;
      }
      if (!_settings.client) return;

      // Abort if all tables are disabled
      var enabledTables = TABLES.filter(function (tableDef) {
        return _this2['_permission_' + tableDef.name];
      });
      if (enabledTables.length === 0) {
        this._isOpenError = true;
        this.trigger('error', { error: 'Persistence is disabled by application' });
        return;
      }

      // Open the database
      var request = window.indexedDB.open(this._getDbName(), DB_VERSION);

      try {
        /* istanbul ignore next */
        request.onerror = function (evt) {
          if (!retry) {
            _this2.deleteTables(function () {
              return _this2._open(true);
            });
          }

          // Triggered by Firefox private browsing window
          else {
              _this2._isOpenError = true;
              _utils2.default.logger.warn('Database Unable to Open (common cause: private browsing window)', evt.target.error);
              _this2.trigger('error', { error: evt });
            }
        };

        request.onupgradeneeded = function (evt) {
          return _this2._onUpgradeNeeded(evt);
        };
        request.onsuccess = function (evt) {
          _this2.db = evt.target.result;
          _this2.isOpen = true;
          _this2.trigger('open');

          _this2.db.onversionchange = function () {
            if (_this2.db) _this2.db.close();
            _this2.isOpen = false;
            setTimeout(function () {
              return _this2._open(false);
            }, 1000);
          };

          _this2.db.onerror = function (err) {
            return _utils2.default.logger.info('db-manager Error: ', err);
          };
        };
      }

      /* istanbul ignore next */
      catch (err) {
        // Safari Private Browsing window will fail on request.onerror
        this._isOpenError = true;
        _utils2.default.logger.error('Database Unable to Open: ', err);
        this.trigger('error', { error: err });
      }
    }

    /**
     * Use this to setup a call to happen as soon as the database is open.
     *
     * Typically, this call will immediately, synchronously call your callback.
     * But if the DB is not open yet, your callback will be called once its open.
     * @method onOpen
     * @param {Function} callback
     */

  }, {
    key: 'onOpen',
    value: function onOpen(callback) {
      if (this.isOpen || this._isOpenError) callback();else this.once('open error', callback);
    }

    /**
     * The onUpgradeNeeded function is called by IndexedDB any time DB_VERSION is incremented.
     *
     * This invocation is part of the built-in lifecycle of IndexedDB.
     *
     * @method _onUpgradeNeeded
     * @param {IDBVersionChangeEvent} event
     * @private
     */
    /* istanbul ignore next */

  }, {
    key: '_onUpgradeNeeded',
    value: function _onUpgradeNeeded(event) {
      var _this3 = this;

      var db = event.target.result;
      var isComplete = false;

      // This appears to only get called once; its presumed this is because we're creating but not using a lot of transactions.
      var onComplete = function onComplete(evt) {
        if (!isComplete) {
          _this3.db = db;
          _this3.isComplete = true;
          _this3.isOpen = true;
          _this3.trigger('open');
        }
      };

      var currentTables = Array.prototype.slice.call(db.objectStoreNames);
      TABLES.forEach(function (tableDef) {
        try {
          if (currentTables.indexOf(tableDef.name) !== -1) db.deleteObjectStore(tableDef.name);
        } catch (e) {
          // Noop
        }
        try {
          var store = db.createObjectStore(tableDef.name, { keyPath: 'id' });
          Object.keys(tableDef.indexes).forEach(function (indexName) {
            return store.createIndex(indexName, tableDef.indexes[indexName], { unique: false });
          });
          store.transaction.oncomplete = onComplete;
        } catch (e) {
          // Noop
          /* istanbul ignore next */
          _utils2.default.logger.error('Failed to create object store ' + tableDef.name, e);
        }
      });
    }

    /**
     * Convert array of Conversation instances into Conversation DB Entries.
     *
     * A Conversation DB entry looks a lot like the server representation, but
     * includes a sync_state property, and `last_message` contains a message ID not
     * a Message object.
     *
     * @method _getConversationData
     * @private
     * @param {Layer.Core.Conversation[]} conversations
     * @return {Object[]} conversations
     */

  }, {
    key: '_getConversationData',
    value: function _getConversationData(conversations) {
      return conversations.filter(function (conversation) {
        if (conversation._fromDB) {
          conversation._fromDB = false;
          return false;
        } else if (conversation.isLoading || conversation.syncState === SYNC_NEW) {
          return false;
        } else {
          return true;
        }
      }).map(function (conversation) {
        var participants = _identity2.default.toDbBasicObjects(conversation.participants);
        return {
          id: conversation.id,
          url: conversation.url,
          participants: participants,
          distinct: conversation.distinct,
          created_at: getDate(conversation.createdAt),
          metadata: conversation.metadata,
          unread_message_count: conversation.unreadCount,
          last_message: conversation.lastMessage ? conversation.lastMessage.id : '',
          last_message_sent: conversation.lastMessage ? getDate(conversation.lastMessage.sentAt) : getDate(conversation.createdAt),
          sync_state: conversation.syncState
        };
      });
    }
  }, {
    key: '_updateConversation',
    value: function _updateConversation(conversation, changes) {
      var _this4 = this;

      var idChanges = changes.filter(function (item) {
        return item.property === 'id';
      });
      if (idChanges.length) {
        this.deleteObjects('conversations', [{ id: idChanges[0].oldValue }], function () {
          _this4.writeConversations([conversation]);
        });
      } else {
        this.writeConversations([conversation]);
      }
    }

    /**
     * Writes an array of Conversations to the Database.
     *
     * @method writeConversations
     * @param {Layer.Core.Conversation[]} conversations - Array of Conversations to write
     * @param {Function} [callback]
     */

  }, {
    key: 'writeConversations',
    value: function writeConversations(conversations, callback) {
      this._writeObjects('conversations', this._getConversationData(conversations.filter(function (conversation) {
        return !conversation.isDestroyed;
      })), callback);
    }

    /**
     * Convert array of Channel instances into Channel DB Entries.
     *
     * A Channel DB entry looks a lot like the server representation, but
     * includes a sync_state property, and `last_message` contains a message ID not
     * a Message object.
     *
     * @method _getChannelData
     * @private
     * @param {Layer.Core.Channel[]} channels
     * @return {Object[]} channels
     */

  }, {
    key: '_getChannelData',
    value: function _getChannelData(channels) {
      return channels.filter(function (channel) {
        if (channel._fromDB) {
          channel._fromDB = false;
          return false;
        } else if (channel.isLoading || channel.syncState === SYNC_NEW) {
          return false;
        } else {
          return true;
        }
      }).map(function (channel) {
        var item = {
          id: channel.id,
          url: channel.url,
          created_at: getDate(channel.createdAt),
          sync_state: channel.syncState,
          // TODO: membership object should be written... but spec incomplete
          membership: null,
          name: channel.name,
          metadata: channel.metadata
        };
        return item;
      });
    }
  }, {
    key: '_updateChannel',
    value: function _updateChannel(channel, changes) {
      var _this5 = this;

      var idChanges = changes.filter(function (item) {
        return item.property === 'id';
      });
      if (idChanges.length) {
        this.deleteObjects('channels', [{ id: idChanges[0].oldValue }], function () {
          _this5.writeChannels([channel]);
        });
      } else {
        this.writeChannels([channel]);
      }
    }

    /**
     * Writes an array of Conversations to the Database.
     *
     * @method writeChannels
     * @param {Layer.Core.Channel[]} channels - Array of Channels to write
     * @param {Function} [callback]
     */

  }, {
    key: 'writeChannels',
    value: function writeChannels(channels, callback) {
      this._writeObjects('channels', this._getChannelData(channels.filter(function (channel) {
        return !channel.isDestroyed;
      })), callback);
    }

    /**
     * Writes an array of Identities to the Database.
     *
     * @method writeIdentities
     * @param {Layer.Core.Identity[]} identities - Array of Identities to write
     * @param {Function} [callback]
     */

  }, {
    key: 'writeIdentities',
    value: function writeIdentities(identities, callback) {
      var _this6 = this;

      identities = identities.filter(function (identity) {
        if (identity.isDestroyed) return false;
        if (identity._fromDB) {
          identity._fromDB = false;
          return false;
        } else if (identity.isLoading || !identity.isFullIdentity) {
          return false;
        } else {
          return true;
        }
      });

      _identity2.default.toDbObjects(identities, function (identityObjs) {
        _this6._writeObjects('identities', identityObjs, callback);
      });
    }

    /**
     * Convert array of Message instances into Message DB Entries.
     *
     * A Message DB entry looks a lot like the server representation, but
     * includes a sync_state property.
     *
     * @method _getMessageData
     * @private
     * @param {Layer.Core.Message[]} messages
     * @param {Function} callback
     * @return {Object[]} messages
     */

  }, {
    key: '_getMessageData',
    value: function _getMessageData(messages, callback) {
      var dbMessages = messages.filter(function (message) {
        if (message._fromDB) {
          message._fromDB = false;
          return false;
        } else if (message.syncState === _constants2.default.SYNC_STATE.LOADING) {
          return false;
        } else {
          return true;
        }
      }).map(function (message) {
        var sender = _identity2.default.toDbBasicObjects([message.sender])[0];
        return {
          id: message.id,
          url: message.url,
          parts: message.mapParts(function (part) {
            var body = _utils2.default.isBlob(part.body) && part.body.size > DbManager.MaxPartSize ? null : part.body;
            return {
              body: body,
              id: part.id,
              encoding: part.encoding,
              mime_type: part.getMimeTypeWithAttributes(),
              content: !part._content ? null : {
                id: part._content.id,
                download_url: part._content.downloadUrl,
                expiration: part._content.expiration,
                refresh_url: part._content.refreshUrl,
                size: part._content.size
              }
            };
          }),
          position: message.position,
          sender: sender,
          recipient_status: message.recipientStatus,
          sent_at: getDate(message.sentAt),
          received_at: getDate(message.receivedAt),
          conversationId: message instanceof _announcement2.default ? 'announcement' : message.conversationId,
          sync_state: message.syncState,
          is_unread: message.isUnread
        };
      });

      // Find all blobs and convert them to base64... because Safari 9.1 doesn't support writing blobs those Frelling Smurfs.
      var count = 0;
      var parts = [];
      dbMessages.forEach(function (message) {
        message.parts.forEach(function (part) {
          if (_utils2.default.isBlob(part.body)) parts.push(part);
        });
      });
      if (parts.length === 0) {
        callback(dbMessages);
      } else {
        parts.forEach(function (part) {
          _utils2.default.blobToBase64(part.body, function (base64) {
            part.body = base64;
            part.useBlob = true;
            count++;
            if (count === parts.length) callback(dbMessages);
          });
        });
      }
    }

    /**
     * Writes an array of Messages to the Database.
     *
     * @method writeMessages
     * @param {Layer.Core.Message[]} messages - Array of Messages to write
     * @param {Function} [callback]
     */

  }, {
    key: 'writeMessages',
    value: function writeMessages(messages, callback) {
      var _this7 = this;

      messages = messages.filter(function (message) {
        if (message.isDestroyed) {
          return false;
        } else if (message.isNew()) {
          message.once('messages:sending', function () {
            return _this7.writeMessages([message]);
          }, _this7);
          return false;
        } else {
          return true;
        }
      });

      this._getMessageData(messages, function (dbMessageData) {
        return _this7._writeObjects('messages', dbMessageData, callback);
      });
    }

    /**
     * Convert array of SyncEvent instances into SyncEvent DB Entries.
     *
     * @method _getSyncEventData
     * @param {Layer.Core.SyncEvent[]} syncEvents
     * @return {Object[]} syncEvents
     * @private
     */

  }, {
    key: '_getSyncEventData',
    value: function _getSyncEventData(syncEvents) {
      return syncEvents.filter(function (syncEvt) {
        if (syncEvt.fromDB) {
          syncEvt.fromDB = false;
          return false;
        } else {
          return true;
        }
      }).map(function (syncEvent) {
        var item = {
          id: syncEvent.id,
          target: syncEvent.target,
          depends: syncEvent.depends,
          isWebsocket: syncEvent instanceof _syncEvent2.default.WebsocketSyncEvent,
          operation: syncEvent.operation,
          data: syncEvent.data,
          url: syncEvent.url || '',
          headers: syncEvent.headers || null,
          method: syncEvent.method || null,
          created_at: syncEvent.createdAt
        };
        return item;
      });
    }

    /**
     * Writes an array of SyncEvent to the Database.
     *
     * @method writeSyncEvents
     * @param {Layer.Core.SyncEvent[]} syncEvents - Array of Sync Events to write
     * @param {Function} [callback]
     */

  }, {
    key: 'writeSyncEvents',
    value: function writeSyncEvents(syncEvents, callback) {
      this._writeObjects('syncQueue', this._getSyncEventData(syncEvents), callback);
    }

    /**
     * Write an array of data to the specified Database table.
     *
     * @method _writeObjects
     * @param {string} tableName - The name of the table to write to
     * @param {Object[]} data - Array of POJO data to write
     * @param {Function} [callback] - Called when all data is written
     * @protected
     */

  }, {
    key: '_writeObjects',
    value: function _writeObjects(tableName, data, callback) {
      var _this8 = this;

      if (!this['_permission_' + tableName] || this._isOpenError) return callback ? callback() : null;

      // Just quit if no data to write
      if (!data.length) {
        if (callback) callback();
        return;
      }

      // PUT (udpate) or ADD (insert) each item of data one at a time, but all as part of one large transaction.
      this.onOpen(function () {
        _this8.getObjects(tableName, data.map(function (item) {
          return item.id;
        }), function (foundItems) {
          var updateIds = {};
          foundItems.forEach(function (item) {
            updateIds[item.id] = item;
          });

          var transaction = _this8.db.transaction([tableName], 'readwrite');
          var store = transaction.objectStore(tableName);
          transaction.oncomplete = transaction.onerror = callback;

          data.forEach(function (item) {
            try {
              if (updateIds[item.id]) {
                store.put(item);
              } else {
                store.add(item);
              }
            } catch (e) {
              /* istanbul ignore next */
              // Safari throws an error rather than use the onerror event.
              _utils2.default.logger.error(e);
            }
          });
        });
      });
    }

    /**
     * Load all conversations from the database.
     *
     * @method loadConversations
     * @param {string} sortBy       - One of 'last_message' or 'created_at'; always sorts in DESC order
     * @param {string} [fromId=]    - For pagination, provide the conversationId to get Conversations after
     * @param {number} [pageSize=]  - To limit the number of results, provide a number for how many results to return.
     * @param {Function} [callback]  - Callback for getting results
     * @param {Layer.Core.Conversation[]} callback.result
     */

  }, {
    key: 'loadConversations',
    value: function loadConversations(sortBy, fromId, pageSize, callback) {
      var _this9 = this;

      try {
        var sortIndex = void 0;
        var range = null;
        var fromConversation = fromId ? _settings.client.getConversation(fromId) : null;
        if (sortBy === 'last_message') {
          sortIndex = 'last_message_sent';
          if (fromConversation) {
            range = window.IDBKeyRange.upperBound([fromConversation.lastMessage ? getDate(fromConversation.lastMessage.sentAt) : getDate(fromConversation.createdAt)]);
          }
        } else {
          sortIndex = 'created_at';
          if (fromConversation) {
            range = window.IDBKeyRange.upperBound([getDate(fromConversation.createdAt)]);
          }
        }

        // Step 1: Get all Conversations
        this._loadByIndex('conversations', sortIndex, range, Boolean(fromId), pageSize, function (data) {
          // Step 2: Gather all Message IDs needed to initialize these Conversation's lastMessage properties.
          var messagesToLoad = data.map(function (item) {
            return item.last_message;
          }).filter(function (messageId) {
            return messageId && !_settings.client.getMessage(messageId);
          });

          // Step 3: Load all Messages needed to initialize these Conversation's lastMessage properties.
          _this9.getObjects('messages', messagesToLoad, function (messages) {
            _this9._loadConversationsResult(data, messages, callback);
          });
        });
      } catch (e) {
        // Noop -- handle browsers like IE that don't like these IDBKeyRanges
      }
    }

    /**
     * Assemble all LastMessages and Conversation POJOs into Layer.Core.Message and Layer.Core.Conversation instances.
     *
     * @method _loadConversationsResult
     * @private
     * @param {Object[]} conversations
     * @param {Object[]} messages
     * @param {Function} callback
     * @param {Layer.Core.Conversation[]} callback.result
     */

  }, {
    key: '_loadConversationsResult',
    value: function _loadConversationsResult(conversations, messages, callback) {
      var _this10 = this;

      // Instantiate and Register each Message
      messages.forEach(function (message) {
        return _this10._createMessage(message);
      });

      // Instantiate and Register each Conversation; will find any lastMessage that was registered.
      var newData = conversations.map(function (conversation) {
        return _this10._createConversation(conversation) || _settings.client.getConversation(conversation.id);
      }).filter(function (conversation) {
        return conversation;
      });

      // Return the data
      if (callback) callback(newData);
    }

    /**
     * Load all channels from the database.
     *
     * @method loadChannels
     * @param {string} sortBy       - One of 'last_message' or 'created_at'; always sorts in DESC order
     * @param {string} [fromId=]    - For pagination, provide the channelId to get Channel after
     * @param {number} [pageSize=]  - To limit the number of results, provide a number for how many results to return.
     * @param {Function} [callback]  - Callback for getting results
     * @param {Layer.Core.Channel[]} callback.result
     */

  }, {
    key: 'loadChannels',
    value: function loadChannels(fromId, pageSize, callback) {
      var _this11 = this;

      try {
        var sortIndex = 'created_at';
        var range = null;
        var fromChannel = fromId ? _settings.client.getChannel(fromId) : null;
        if (fromChannel) {
          range = window.IDBKeyRange.upperBound([getDate(fromChannel.createdAt)]);
        }

        this._loadByIndex('channels', sortIndex, range, Boolean(fromId), pageSize, function (data) {
          _this11._loadChannelsResult(data, callback);
        });
      } catch (e) {
        // Noop -- handle browsers like IE that don't like these IDBKeyRanges
      }
    }

    /**
     * Assemble all LastMessages and Conversation POJOs into Layer.Core.Message and Layer.Core.Conversation instances.
     *
     * @method _loadChannelsResult
     * @private
     * @param {Object[]} channels
     * @param {Function} callback
     * @param {Layer.Core.Channel[]} callback.result
     */

  }, {
    key: '_loadChannelsResult',
    value: function _loadChannelsResult(channels, callback) {
      var _this12 = this;

      // Instantiate and Register each Conversation; will find any lastMessage that was registered.
      var newData = channels.map(function (channel) {
        return _this12._createChannel(channel) || _settings.client.getChannel(channel.id);
      }).filter(function (conversation) {
        return conversation;
      });

      // Return the data
      if (callback) callback(newData);
    }

    /**
     * Load all messages for a given Conversation ID from the database.
     *
     * Use _loadAll if loading All Messages rather than all Messages for a Conversation.
     *
     * @method loadMessages
     * @param {string} conversationId - ID of the Conversation whose Messages are of interest.
     * @param {string} [fromId=]    - For pagination, provide the messageId to get Messages after
     * @param {number} [pageSize=]  - To limit the number of results, provide a number for how many results to return.
     * @param {Function} [callback]   - Callback for getting results
     * @param {Layer.Core.Message[]} callback.result
     */

  }, {
    key: 'loadMessages',
    value: function loadMessages(conversationId, fromId, pageSize, callback) {
      var _this13 = this;

      if (!this._permission_messages || this._isOpenError) return callback([]);
      try {
        var fromMessage = fromId ? _settings.client.getMessage(fromId) : null;
        var query = window.IDBKeyRange.bound([conversationId, 0], [conversationId, fromMessage ? fromMessage.position : MAX_SAFE_INTEGER]);
        this._loadByIndex('messages', 'conversationId', query, Boolean(fromId), pageSize, function (data) {
          _this13._loadMessagesResult(data, callback);
        });
      } catch (e) {
        // Noop -- handle browsers like IE that don't like these IDBKeyRanges
      }
    }

    /**
     * Load all Announcements from the database.
     *
     * @method loadAnnouncements
     * @param {string} [fromId=]    - For pagination, provide the messageId to get Announcements after
     * @param {number} [pageSize=]  - To limit the number of results, provide a number for how many results to return.
     * @param {Function} [callback]
     * @param {Layer.Core.Announcement[]} callback.result
     */

  }, {
    key: 'loadAnnouncements',
    value: function loadAnnouncements(fromId, pageSize, callback) {
      var _this14 = this;

      if (!this._permission_messages || this._isOpenError) return callback([]);
      try {
        var fromMessage = fromId ? _settings.client.getMessage(fromId) : null;
        var query = window.IDBKeyRange.bound(['announcement', 0], ['announcement', fromMessage ? fromMessage.position : MAX_SAFE_INTEGER]);
        this._loadByIndex('messages', 'conversationId', query, Boolean(fromId), pageSize, function (data) {
          _this14._loadMessagesResult(data, callback);
        });
      } catch (e) {
        // Noop -- handle browsers like IE that don't like these IDBKeyRanges
      }
    }
  }, {
    key: '_blobifyPart',
    value: function _blobifyPart(part) {
      if (part.useBlob) {
        part.body = _utils2.default.base64ToBlob(part.body, part.mimeType);
        delete part.useBlob;
        part.encoding = null;
      }
    }

    /**
     * Registers and sorts the message objects from the database.
     *
     * TODO: Encode limits on this, else we are sorting tens of thousands
     * of messages in javascript.
     *
     * @method _loadMessagesResult
     * @private
     * @param {Object[]} Message objects from the database.
     * @param {Function} callback
     * @param {Layer.Core.Message} callback.result - Message instances created from the database
     */

  }, {
    key: '_loadMessagesResult',
    value: function _loadMessagesResult(messages, callback) {
      var _this15 = this;

      // Convert base64 to blob before sending it along...
      messages.forEach(function (message) {
        return message.parts.forEach(function (part) {
          return _this15._blobifyPart(part);
        });
      });

      // Instantiate and Register each Message
      var newData = messages.map(function (message) {
        return _this15._createMessage(message) || _settings.client.getMessage(message.id);
      }).filter(function (message) {
        return message;
      });

      // Return the results
      if (callback) callback(newData);
    }

    /**
     * Load all Identities from the database.
     *
     * @method loadIdentities
     * @param {Function} callback
     * @param {Layer.Core.Identity[]} callback.result
     */

  }, {
    key: 'loadIdentities',
    value: function loadIdentities(callback) {
      var _this16 = this;

      this._loadAll('identities', function (data) {
        _this16._loadIdentitiesResult(data, callback);
      });
    }

    /**
     * Assemble all LastMessages and Identityy POJOs into Layer.Core.Message and Layer.Core.Identityy instances.
     *
     * @method _loadIdentitiesResult
     * @private
     * @param {Object[]} identities
     * @param {Function} callback
     * @param {Layer.Core.Identity[]} callback.result
     */

  }, {
    key: '_loadIdentitiesResult',
    value: function _loadIdentitiesResult(identities, callback) {
      var _this17 = this;

      // Instantiate and Register each Identity.
      var newData = identities.map(function (identity) {
        return _this17._createIdentity(identity) || _settings.client.getIdentity(identity.id);
      }).filter(function (identity) {
        return identity;
      });

      // Return the data
      if (callback) callback(newData);
    }

    /**
     * Instantiate and Register the Conversation from a conversation DB Entry.
     *
     * If the Layer.Core.Conversation already exists, then its presumed that whatever is in
     * javascript cache is more up to date than whats in IndexedDB cache.
     *
     * Attempts to assign the lastMessage property to refer to appropriate Message.  If it fails,
     * it will be set to null.
     *
     * @method _createConversation
     * @private
     * @param {Object} conversation
     * @returns {Layer.Core.Conversation}
     */

  }, {
    key: '_createConversation',
    value: function _createConversation(conversation) {
      if (!_settings.client.getConversation(conversation.id)) {
        conversation._fromDB = true;
        var newConversation = _settings.client._createObject(conversation);
        newConversation.syncState = conversation.sync_state;
        return newConversation;
      }
    }

    /**
     * Instantiate and Register the Channel from a Channel DB Entry.
     *
     * If the Layer.Core.Channel already exists, then its presumed that whatever is in
     * javascript cache is more up to date than whats in IndexedDB cache.
     *
     * Attempts to assign the lastMessage property to refer to appropriate Message.  If it fails,
     * it will be set to null.
     *
     * @method _createChannel
     * @private
     * @param {Object} channel
     * @returns {Layer.Core.Channel}
     */

  }, {
    key: '_createChannel',
    value: function _createChannel(channel) {
      if (!_settings.client.getChannel(channel.id)) {
        channel._fromDB = true;
        var newChannel = _settings.client._createObject(channel);
        newChannel.syncState = channel.sync_state;
        return newChannel;
      }
    }

    /**
     * Instantiate and Register the Message from a message DB Entry.
     *
     * If the Layer.Core.Message already exists, then its presumed that whatever is in
     * javascript cache is more up to date than whats in IndexedDB cache.
     *
     * @method _createMessage
     * @private
     * @param {Object} message
     * @returns {Layer.Core.Message}
     */

  }, {
    key: '_createMessage',
    value: function _createMessage(message) {
      if (!_settings.client.getMessage(message.id)) {
        message._fromDB = true;
        if (message.conversationId.indexOf('layer:///conversations') === 0) {
          message.conversation = {
            id: message.conversationId
          };
        } else if (message.conversationId.indexOf('layer:///channels') === 0) {
          message.channel = {
            id: message.conversationId
          };
        }
        delete message.conversationId;
        var newMessage = _settings.client._createObject(message);
        newMessage.syncState = message.sync_state;
        return newMessage;
      }
    }

    /**
     * Instantiate and Register the Identity from an identities DB Entry.
     *
     * If the Layer.Core.Identity already exists, then its presumed that whatever is in
     * javascript cache is more up to date than whats in IndexedDB cache.
     *
     * @method _createIdentity
     * @param {Object} identity
     * @returns {Layer.Core.Identity}
     */

  }, {
    key: '_createIdentity',
    value: function _createIdentity(identity) {
      if (!_settings.client.getIdentity(identity.id)) {
        identity._fromDB = true;
        var newidentity = _settings.client._createObject(identity);
        newidentity.syncState = identity.sync_state;
        return newidentity;
      }
    }

    /**
     * Load all Sync Events from the database.
     *
     * @method loadSyncQueue
     * @param {Function} callback
     * @param {Layer.Core.SyncEvent[]} callback.result
     */

  }, {
    key: 'loadSyncQueue',
    value: function loadSyncQueue(callback) {
      var _this18 = this;

      this._loadAll('syncQueue', function (syncEvents) {
        return _this18._loadSyncEventRelatedData(syncEvents, callback);
      });
    }

    /**
     * Validate that we have appropriate data for each SyncEvent and instantiate it.
     *
     * Any operation that is not a DELETE must have a valid target found in the database or javascript cache,
     * otherwise it can not be executed.
     *
     * TODO: Need to cleanup sync entries that have invalid targets
     *
     * @method _loadSyncEventRelatedData
     * @private
     * @param {Object[]} syncEvents
     * @param {Function} callback
     * @param {Layer.Core.SyncEvent[]} callback.result
     */

  }, {
    key: '_loadSyncEventRelatedData',
    value: function _loadSyncEventRelatedData(syncEvents, callback) {
      var _this19 = this;

      // Gather all Message IDs that are targets of operations.
      var messageIds = syncEvents.filter(function (item) {
        return item.operation !== 'DELETE' && item.target && item.target.match(/messages/);
      }).map(function (item) {
        return item.target;
      });

      // Gather all Conversation IDs that are targets of operations.
      var conversationIds = syncEvents.filter(function (item) {
        return item.operation !== 'DELETE' && item.target && item.target.match(/conversations/);
      }).map(function (item) {
        return item.target;
      });

      var identityIds = syncEvents.filter(function (item) {
        return item.operation !== 'DELETE' && item.target && item.target.match(/identities/);
      }).map(function (item) {
        return item.target;
      });

      // Load any Messages/Conversations that are targets of operations.
      // Call _createMessage or _createConversation on all targets found.
      var counter = 0;
      var maxCounter = 3;
      this.getObjects('messages', messageIds, function (messages) {
        messages.forEach(function (message) {
          return _this19._createMessage(message);
        });
        counter++;
        if (counter === maxCounter) _this19._loadSyncEventResults(syncEvents, callback);
      });
      this.getObjects('conversations', conversationIds, function (conversations) {
        conversations.forEach(function (conversation) {
          return _this19._createConversation(conversation);
        });
        counter++;
        if (counter === maxCounter) _this19._loadSyncEventResults(syncEvents, callback);
      });
      this.getObjects('identities', identityIds, function (identities) {
        identities.forEach(function (identity) {
          return _this19._createIdentity(identity);
        });
        counter++;
        if (counter === maxCounter) _this19._loadSyncEventResults(syncEvents, callback);
      });
    }

    /**
     * Turn an array of Sync Event DB Entries into an array of Layer.Core.SyncEvent.
     *
     * @method _loadSyncEventResults
     * @private
     * @param {Object[]} syncEvents
     * @param {Function} callback
     * @param {Layer.Core.SyncEvent[]} callback.result
     */

  }, {
    key: '_loadSyncEventResults',
    value: function _loadSyncEventResults(syncEvents, callback) {
      // If the target is present in the sync event, but does not exist in the system,
      // do NOT attempt to instantiate this event... unless its a DELETE operation.
      var newData = syncEvents.filter(function (syncEvent) {
        var hasTarget = Boolean(syncEvent.target && _settings.client.getObject(syncEvent.target));
        return syncEvent.operation === 'DELETE' || hasTarget;
      }).map(function (syncEvent) {
        if (syncEvent.isWebsocket) {
          return new _syncEvent2.default.WebsocketSyncEvent({
            target: syncEvent.target,
            depends: syncEvent.depends,
            operation: syncEvent.operation,
            id: syncEvent.id,
            data: syncEvent.data,
            fromDB: true,
            createdAt: syncEvent.created_at
          });
        } else {
          return new _syncEvent2.default.XHRSyncEvent({
            target: syncEvent.target,
            depends: syncEvent.depends,
            operation: syncEvent.operation,
            id: syncEvent.id,
            data: syncEvent.data,
            method: syncEvent.method,
            headers: syncEvent.headers,
            url: syncEvent.url,
            fromDB: true,
            createdAt: syncEvent.created_at
          });
        }
      });

      // Sort the results and then return them.
      // TODO: Query results should come back sorted by database with proper Index
      _utils2.default.sortBy(newData, function (item) {
        return item.createdAt;
      });
      callback(newData);
    }

    /**
     * Load all data from the specified table.
     *
     * @method _loadAll
     * @protected
     * @param {String} tableName
     * @param {Function} callback
     * @param {Object[]} callback.result
     */

  }, {
    key: '_loadAll',
    value: function _loadAll(tableName, callback) {
      var _this20 = this;

      if (!this['_permission_' + tableName] || this._isOpenError) return callback([]);
      this.onOpen(function () {
        var data = [];
        _this20.db.transaction([tableName], 'readonly').objectStore(tableName).openCursor().onsuccess = function (evt) {
          /* istanbul ignore next */
          if (_this20.isDestroyed) return;
          var cursor = evt.target.result;
          if (cursor) {
            data.push(cursor.value);
            cursor.continue();
          } else if (!_this20.isDestroyed) {
            /* istanbul ignore next */
            callback(data);
          }
        };
      });
    }

    /**
     * Load all data from the specified table and with the specified index value.
     *
     * Results are always sorted in DESC order at this time.
     *
     * @method _loadByIndex
     * @protected
     * @param {String} tableName - 'messages', 'conversations', 'identities'
     * @param {String} indexName - Name of the index to query on
     * @param {IDBKeyRange} range - Range to Query for (null ok)
     * @param {Boolean} isFromId - If querying for results after a specified ID, then we want to skip the first result (which will be that ID) ("" is OK)
     * @param {number} pageSize - If a value is provided, return at most that number of results; else return all results.
     * @param {Function} callback
     * @param {Object[]} callback.result
     */

  }, {
    key: '_loadByIndex',
    value: function _loadByIndex(tableName, indexName, range, isFromId, pageSize, callback) {
      var _this21 = this;

      if (!this['_permission_' + tableName] || this._isOpenError) return callback([]);
      var shouldSkipNext = isFromId;
      this.onOpen(function () {
        var data = [];
        _this21.db.transaction([tableName], 'readonly').objectStore(tableName).index(indexName).openCursor(range, 'prev').onsuccess = function (evt) {
          /* istanbul ignore next */
          if (_this21.isDestroyed) return;
          var cursor = evt.target.result;
          if (cursor) {
            if (shouldSkipNext) {
              shouldSkipNext = false;
            } else {
              data.push(cursor.value);
            }
            if (pageSize && data.length >= pageSize) {
              callback(data);
            } else {
              cursor.continue();
            }
          } else {
            callback(data);
          }
        };
      });
    }

    /**
     * Deletes the specified objects from the specified table.
     *
     * Currently takes an array of data to delete rather than an array of IDs;
     * If you only have an ID, [{id: myId}] should work.
     *
     * @method deleteObjects
     * @param {String} tableName
     * @param {Object[]} data
     * @param {Function} [callback]
     */

  }, {
    key: 'deleteObjects',
    value: function deleteObjects(tableName, data, callback) {
      var _this22 = this;

      if (!this['_permission_' + tableName] || this._isOpenError) return callback ? callback() : null;
      this.onOpen(function () {
        var transaction = _this22.db.transaction([tableName], 'readwrite');
        var store = transaction.objectStore(tableName);
        transaction.oncomplete = callback;
        data.forEach(function (item) {
          return store.delete(item.id);
        });
      });
    }

    /**
     * Retrieve the identified objects from the specified database table.
     *
     * Turning these into instances is the responsibility of the caller.
     *
     * Inspired by http://www.codeproject.com/Articles/744986/How-to-do-some-magic-with-indexedDB
     *
     * @method getObjects
     * @param {String} tableName
     * @param {String[]} ids
     * @param {Function} callback
     * @param {Object[]} callback.result
     */

  }, {
    key: 'getObjects',
    value: function getObjects(tableName, ids, callback) {
      var _this23 = this;

      if (!this['_permission_' + tableName] || this._isOpenError) return callback([]);
      var data = [];

      // Gather, sort, and filter replica IDs
      var sortedIds = ids.sort();
      for (var i = sortedIds.length - 1; i > 0; i--) {
        if (sortedIds[i] === sortedIds[i - 1]) sortedIds.splice(i, 1);
      }
      var index = 0;

      // Iterate over the table searching for the specified IDs
      this.onOpen(function () {
        _this23.db.transaction([tableName], 'readonly').objectStore(tableName).openCursor().onsuccess = function (evt) {
          /* istanbul ignore next */
          if (_this23.isDestroyed) return;
          var cursor = evt.target.result;
          if (!cursor) {
            callback(data);
            return;
          }
          var key = cursor.key;

          // The cursor has passed beyond this key. Check next.
          while (key > sortedIds[index]) {
            index++;
          } // The cursor is pointing at one of our IDs, get it and check next.
          if (key === sortedIds[index]) {
            data.push(cursor.value);
            index++;
          }

          // Done or check next
          if (index === sortedIds.length) {
            /* istanbul ignore else */
            if (!_this23.isDestroyed) callback(data);
          } else {
            cursor.continue(sortedIds[index]);
          }
        };
      });
    }

    /**
     * A simplified getObjects() method that gets a single object, and also gets its related objects.
     *
     * @method getObject
     * @param {string} tableName
     * @param {string} id
     * @param {Function} callback
     * @param {Object} callback.data
     */

  }, {
    key: 'getObject',
    value: function getObject(tableName, id, callback) {
      var _this24 = this;

      if (!this['_permission_' + tableName] || this._isOpenError) return callback();

      this.onOpen(function () {
        _this24.db.transaction([tableName], 'readonly').objectStore(tableName).openCursor(window.IDBKeyRange.only(id)).onsuccess = function (evt) {
          var cursor = evt.target.result;
          if (!cursor) return callback(null);

          switch (tableName) {
            case 'messages':
              // Convert base64 to blob before sending it along...
              cursor.value.parts.forEach(function (part) {
                return _this24._blobifyPart(part);
              });
              return callback(cursor.value);
            case 'identities':
            case 'channels':
              return callback(cursor.value);
            case 'conversations':
              if (cursor.value.last_message) {
                var lastMessage = _settings.client.getMessage(cursor.value.last_message);
                if (lastMessage) {
                  return _this24._getMessageData([lastMessage], function (messages) {
                    cursor.value.last_message = messages[0];
                    callback(cursor.value);
                  });
                } else {
                  return _this24.getObject('messages', cursor.value.last_message, function (message) {
                    cursor.value.last_message = message;
                    callback(cursor.value);
                  });
                }
              } else {
                return callback(cursor.value);
              }
          }
        };
      });
    }

    /**
     * Claim a Sync Event.
     *
     * A sync event is claimed by locking the table,  validating that it is still in the table... and then deleting it from the table.
     *
     * @method claimSyncEvent
     * @param {Layer.Core.SyncEvent} syncEvent
     * @param {Function} callback
     * @param {Boolean} callback.result
     */

  }, {
    key: 'claimSyncEvent',
    value: function claimSyncEvent(syncEvent, callback) {
      var _this25 = this;

      if (!this._permission_syncQueue || this._isOpenError) return callback(true);
      this.onOpen(function () {
        var transaction = _this25.db.transaction(['syncQueue'], 'readwrite');
        var store = transaction.objectStore('syncQueue');
        store.get(syncEvent.id).onsuccess = function (evt) {
          return callback(Boolean(evt.target.result));
        };
        store.delete(syncEvent.id);
      });
    }

    /**
     * Delete all data from all tables.
     *
     * This should be called from Layer.Core.Client.logout()
     *
     * @method deleteTables
     * @param {Function} [calllback]
     */

  }, {
    key: 'deleteTables',
    value: function deleteTables() {
      var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

      try {
        var request = window.indexedDB.deleteDatabase(this._getDbName());
        request.onsuccess = request.onerror = callback;
        delete this.db;
      } catch (e) {
        _utils2.default.logger.error('Failed to delete database', e);
        if (callback) callback(e);
      }
    }
  }]);

  return DbManager;
}(_root2.default);

/**
 * @property {boolean} is the db connection open
 */


DbManager.prototype.isOpen = false;

/**
 * @property {boolean} is the db connection will not open
 * @private
 */
DbManager.prototype._isOpenError = false;

/**
 * @property {boolean} Is reading/writing messages allowed?
 * @private
 */
DbManager.prototype._permission_messages = false;

/**
 * @property {boolean} Is reading/writing conversations allowed?
 * @private
 */
DbManager.prototype._permission_conversations = false;

/**
 * @property {boolean} Is reading/writing channels allowed?
 * @private
 */
DbManager.prototype._permission_channels = false;

/**
 * @property {boolean} Is reading/writing identities allowed?
 * @private
 */
DbManager.prototype._permission_identities = false;

/**
 * @property {boolean} Is reading/writing unsent server requests allowed?
 * @private
 */
DbManager.prototype._permission_syncQueue = false;

/**
 * @property IDBDatabase
 */
DbManager.prototype.db = null;

/**
 * Rich Content may be written to indexeddb and persisted... if its size is less than this number of bytes.
 *
 * This value can be customized; this example only writes Rich Content that is less than 5000 bytes
 *
 *    Layer.Core.DbManager.MaxPartSize = 5000;
 *
 * @static
 * @property {Number}
 */
DbManager.MaxPartSize = 250000;

DbManager._supportedEvents = ['open', 'error'].concat(_root2.default._supportedEvents);

_root2.default.initClass.apply(DbManager, [DbManager, 'DbManager', _namespace2.default]);
module.exports = DbManager;