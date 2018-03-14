/**
 * There are two ways to instantiate this class:
 *
 *      // 1. Using a Query Builder
 *      var conversationQueryBuilder = QueryBuilder.conversations().sortBy('lastMessage');
 *      var conversationQuery = client.createQuery(queryBuilder);
 *      var channelQueryBuilder = QueryBuilder.channels();
 *      var channelQuery = client.createQuery(queryBuilder);
 *
 *      // 2. Passing properties directly
 *      var conversationQuery = client.createQuery({
 *        model: Layer.Core.Query.Conversation,
 *        sortBy: [{'createdAt': 'desc'}]
 *      });
 *      var channelQuery = client.createQuery({
 *        model: Layer.Core.Query.Conversation,
 *        sortBy: [{'createdAt': 'desc'}]
 *      });
 *      var channelQuery = client.createQuery({
 *        model: Layer.Core.Query.Channel
 *      });
 *
 * You can change the data selected by your query any time you want using:
 *
 *      query.update({
 *        paginationWindow: 200
 *      });
 *
 *      query.update({
 *        predicate: 'conversation.id = "' + conv.id + "'"
 *      });
 *
 *     // Or use the Query Builder:
 *     queryBuilder.paginationWindow(200);
 *     query.update(queryBuilder);
 *
 * You can release data held in memory by your queries when done with them:
 *
 *      query.destroy();
 *
 * #### Query Types
 *
 * For documentation on creating each of these types of queries, see the specified Query Subclass:
 *
 * * Layer.Core.ConversationsQuery
 * * Layer.Core.ChannelsQuery
 * * Layer.Core.MessagesQuery
 * * Layer.Core.IdentitiesQuery
 * * Layer.Core.MembersQuery
 *
 * #### dataType
 *
 * The Layer.Core.Query.dataType property lets you specify what type of data shows up in your results:
 *
 * ```javascript
 * var query = client.createQuery({
 *     model: Layer.Core.Query.Message,
 *     predicate: "conversation.id = 'layer:///conversations/uuid'",
 *     dataType: Layer.Core.Query.InstanceDataType
 * })
 *
 * var query = client.createQuery({
 *     model: Layer.Core.Query.Message,
 *     predicate: "conversation.id = 'layer:///conversations/uuid'",
 *     dataType: Layer.Core.Query.ObjectDataType
 * })
 * ```
 *
 * The property defaults to Layer.Core.Query.InstanceDataType.  Instances support methods and let you subscribe to events for direct notification
 * of changes to any of the results of your query:
 *
* ```javascript
 * query.data[0].on('messages:change', function(evt) {
 *     alert('The first message has had a property change; probably isRead or recipient_status!');
 * });
 * ```
 *
 * A value of Layer.Core.Query.ObjectDataType will cause the data to be an array of immutable objects rather than instances.  One can still get an instance from the POJO:
 *
 * ```javascript
 * var m = client.getMessage(query.data[0].id);
 * m.on('messages:change', function(evt) {
 *     alert('The first message has had a property change; probably isRead or recipient_status!');
 * });
 * ```
 *
 * ## Query Events
 *
 * Queries fire events whenever their data changes.  There are 5 types of events;
 * all events are received by subscribing to the `change` event.
 *
 * ### 1. Data Events
 *
 * The Data event is fired whenever a request is sent to the server for new query results.  This could happen when first creating the query, when paging for more data, or when changing the query's properties, resulting in a new request to the server.
 *
 * The Event object will have an `evt.data` array of all newly added results.  But frequently you may just want to use the `query.data` array and get ALL results.
 *
 * ```javascript
 * query.on('change', function(evt) {
 *   if (evt.type === 'data') {
 *      var newData = evt.data;
 *      var allData = query.data;
 *   }
 * });
 * ```
 *
 * Note that `query.on('change:data', function(evt) {}` is also supported.
 *
 * ### 2. Insert Events
 *
 * A new Conversation or Message was created. It may have been created locally by your user, or it may have been remotely created, received via websocket, and added to the Query's results.
 *
 * The Layer.Core.LayerEvent.target property contains the newly inserted object.
 *
 * ```javascript
 *  query.on('change', function(evt) {
 *    if (evt.type === 'insert') {
 *       var newItem = evt.target;
 *       var allData = query.data;
 *    }
 *  });
 * ```
 *
 * Note that `query.on('change:insert', function(evt) {}` is also supported.
 *
 * ### 3. Remove Events
 *
 * A Conversation or Message was deleted. This may have been deleted locally by your user, or it may have been remotely deleted, a notification received via websocket, and removed from the Query results.
 *
 * The Layer.Core.LayerEvent.target property contains the removed object.
 *
 * ```javascript
 * query.on('change', function(evt) {
 *   if (evt.type === 'remove') {
 *       var removedItem = evt.target;
 *       var allData = query.data;
 *   }
 * });
 * ```
 *
 * Note that `query.on('change:remove', function(evt) {}` is also supported.
 *
 * ### 4. Reset Events
 *
 * Any time your query's model or predicate properties have been changed
 * the query is reset, and a new request is sent to the server.  The reset event informs your UI that the current result set is empty, and that the reason its empty is that it was `reset`.  This helps differentiate it from a `data` event that returns an empty array.
 *
 * ```javascript
 * query.on('change', function(evt) {
 *   if (evt.type === 'reset') {
 *       var allData = query.data; // []
 *   }
 * });
 * ```
 *
 * Note that `query.on('change:reset', function(evt) {}` is also supported.
 *
 * ### 5. Property Events
 *
 * If any properties change in any of the objects listed in your Layer.Core.Query.data property, a `property` event will be fired.
 *
 * The Layer.Core.LayerEvent.target property contains object that was modified.
 *
 * See Layer.Core.LayerEvent.changes for details on how changes are reported.
 *
 * ```javascript
 * query.on('change', function(evt) {
 *   if (evt.type === 'property') {
 *       var changedItem = evt.target;
 *       var isReadChanges = evt.getChangesFor('isRead');
 *       var recipientStatusChanges = evt.getChangesFor('recipientStatus');
 *       if (isReadChanges.length) {
 *           ...
 *       }
 *
 *       if (recipientStatusChanges.length) {
 *           ...
 *       }
 *   }
 * });
 *```
 * Note that `query.on('change:property', function(evt) {}` is also supported.
 *
 * ### 6. Move Events
 *
 * Occasionally, a property change will cause an item to be sorted differently, causing a Move event.
 * The event will tell you what index the item was at, and where it has moved to in the Query results.
 * This is currently only supported for Conversations.
 *
 * ```javascript
 * query.on('change', function(evt) {
 *   if (evt.type === 'move') {
 *       var changedItem = evt.target;
 *       var oldIndex = evt.fromIndex;
 *       var newIndex = evt.newIndex;
 *       var moveNode = list.childNodes[oldIndex];
 *       list.removeChild(moveNode);
 *       list.insertBefore(moveNode, list.childNodes[newIndex]);
 *   }
 * });
 *```
 * Note that `query.on('change:move', function(evt) {}` is also supported.
 *
 * @class  Layer.Core.Query
 * @extends Layer.Core.Root
 *
 */
import { client } from '../../settings';
import Core from '../namespace';
import Root from '../root';
import { ErrorDictionary } from '../layer-error';
import { logger } from '../../utils';

class Query extends Root {

  constructor(options) {
    if (typeof options.build === 'function') options = options.build();
    super(options);
    this.predicate = this._fixPredicate(options.predicate || '');

    if ('paginationWindow' in options) {
      const paginationWindow = options.paginationWindow;
      this.paginationWindow = Math.min(this._getMaxPageSize(), options.paginationWindow);
      if (options.paginationWindow !== paginationWindow) {
        logger.warn(`paginationWindow value ${paginationWindow} in Query constructor ` +
          `excedes Query.MaxPageSize of ${this._getMaxPageSize()}`);
      }
    }

    this.data = [];
    this._initialPaginationWindow = this.paginationWindow;
    client.on('all', this._handleEvents, this);

    if (!client.isReady) {
      client.once('ready', () => this._run(), this);
    } else {
      this._run();
    }
  }

  /**
   * Cleanup and remove this Query, its subscriptions and data.
   *
   * @method destroy
   */
  destroy() {
    this.data = [];
    this._triggerChange({
      data: [],
      type: 'reset',
    });
    client.off(null, null, this);
    client._removeQuery(this);
    this.data = null;
    super.destroy();
  }

  /**
   * Get the maximum number of items allowed in a page
   *
   * @method _getMaxPageSize
   * @private
   * @returns {number}
   */
  _getMaxPageSize() {
    return this.constructor.MaxPageSize;
  }

  /**
   * Updates properties of the Query.
   *
   * Currently supports updating:
   *
   * * paginationWindow
   * * predicate
   * * sortBy
   *
   * Any change to predicate or model results in clearing all data from the
   * query's results and triggering a change event with [] as the new data.
   *
   * ```
   * query.update({
   *    paginationWindow: 200
   * });
   * ```
   *
   * ```
   * query.update({
   *    paginationWindow: 100,
   *    predicate: 'conversation.id = "layer:///conversations/UUID"'
   * });
   * ```
   *
   * ```
   * query.update({
   *    sortBy: [{"lastMessage.sentAt": "desc"}]
   * });
   * ```
   *
   * @method update
   * @param  {Object} options
   * @param {String} [options.predicate] - A new predicate for the query
   * @param {String} [options.model] - A new model for the Query
   * @param {number} [paginationWindow] - Increase/decrease our result size to match this pagination window.
   * @return {Layer.Core.Query} this
   */
  update(options = {}) {
    let needsRefresh;
    let needsRecreate;

    const optionsBuilt = (typeof options.build === 'function') ? options.build() : options;

    if ('paginationWindow' in optionsBuilt && this.paginationWindow !== optionsBuilt.paginationWindow) {
      this.paginationWindow = Math.min(this._getMaxPageSize() + this.size, optionsBuilt.paginationWindow);
      if (this.paginationWindow < optionsBuilt.paginationWindow) {
        logger.warn(`paginationWindow value ${optionsBuilt.paginationWindow} in Query.update() ` +
          `increases size greater than Query.MaxPageSize of ${this._getMaxPageSize()}`);
      }
      needsRefresh = true;
    }
    if ('model' in optionsBuilt && this.model !== optionsBuilt.model) {
      throw new Error(ErrorDictionary.modelImmutable);
    }

    if ('predicate' in optionsBuilt) {
      const predicate = this._fixPredicate(optionsBuilt.predicate || '');
      if (this.predicate !== predicate) {
        this.predicate = predicate;
        needsRecreate = true;
      }
    }
    if ('sortBy' in optionsBuilt && JSON.stringify(this.sortBy) !== JSON.stringify(optionsBuilt.sortBy)) {
      this.sortBy = optionsBuilt.sortBy;
      needsRecreate = true;
    }
    if (needsRecreate) {
      this._reset();
    }
    if (needsRecreate || needsRefresh) this._run();
    return this;
  }

  /**
   * Normalizes the predicate.
   *
   * @method _fixPredicate
   * @param {String} inValue
   * @private
   */
  _fixPredicate(inValue) {
    if (inValue) throw new Error(ErrorDictionary.predicateNotSupported);
    return '';
  }

  /**
   * After redefining the query, reset it: remove all data/reset all state.
   *
   * @method _reset
   * @private
   */
  _reset() {
    this.totalSize = 0;
    const data = this.data;
    this.data = [];
    client._checkAndPurgeCache(data);
    this.isFiring = false;
    this._predicate = null;
    this._nextDBFromId = '';
    this._nextServerFromId = '';
    this.pagedToEnd = false;
    this.paginationWindow = this._initialPaginationWindow;
    this._triggerChange({
      data: [],
      type: 'reset',
    });
  }

  /**
   * Reset your query to its initial state and then rerun it.
   *
   * @method reset
   */
  reset() {
    this._reset();
    this._run();
  }

  /**
   * Execute the query.
   *
   * No, don't murder it, just fire it.  No, don't make it unemployed,
   * just connect to the server and get the results.
   *
   * @method _run
   * @private
   */
  _run() {
    // Find the number of items we need to request.
    const pageSize = Math.min(this.paginationWindow - this.size, this._getMaxPageSize());

    // If there is a reduction in pagination window, then this variable will be negative, and we can shrink
    // the data.
    if (pageSize < 0) {
      const removedData = this.data.slice(this.paginationWindow);
      this.data = this.data.slice(0, this.paginationWindow);
      client._checkAndPurgeCache(removedData);
      this.pagedToEnd = false;
      this._triggerAsync('change', { data: [] });
    } else if (pageSize === 0 || this.pagedToEnd) {
      // No need to load 0 results.
    } else {
      this._fetchData(pageSize);
    }
  }

  _fetchData(pageSize) {
    // Noop
  }

  /**
   * Returns the sort field for the query.
   *
   * Returns One of:
   *
   * * 'position' (Messages only)
   * * 'last_message' (Conversations only)
   * * 'created_at' (Conversations only)
   * @method _getSortField
   * @private
   * @return {String} sort key used by server
   */
  _getSortField() {
    // Noop
  }

  /**
   * Process the results of the `_run` method; calls __appendResults.
   *
   * @method _processRunResults
   * @private
   * @param  {Object} results - Full xhr response object with server results
   * @param {Number} pageSize - Number of entries that were requested
   */
  _processRunResults(results, requestUrl, pageSize) {
    if (requestUrl !== this._firingRequest || this.isDestroyed) return;

    // isFiring is false... unless we are still syncing
    this.isFiring = false;
    this._firingRequest = '';
    if (results.success) {
      this.totalSize = Number(results.xhr.getResponseHeader('Layer-Count'));
      if (results.data.length < pageSize || results.data.length === this.totalSize) this.pagedToEnd = true;
      this._appendResults(results, false);
      this._firstRun = false;
    } else if (results.data.getNonce()) {
      client.once('ready', () => {
        this._run();
      }, this);
    } else {
      // Note that there is retry logic for 3 retries in client-authenticator.js _nonsyncXhr() which is handled
      // prior to giving up and sending us this error
      this.trigger('error', { error: results.data });
    }
  }

  /**
   * Appends arrays of data to the Query results.
   *
   * @method  _appendResults
   * @private
   */
  _appendResults(results, fromDb) {
    const finalResults = [];

    // For all results, register them with the client
    // If already registered with the client, properties will be updated as needed
    // Database results rather than server results will arrive already registered.
    results.data.forEach((item) => {
      if (!(item instanceof Root)) client._createObject(item);
    });

    // Filter results to just the new results
    const newResults = results.data.filter(item => this._getIndex(item.id) === -1);

    // Update the next ID to use in pagination
    const resultLength = results.data.length;
    if (resultLength) {
      if (fromDb) {
        this._nextDBFromId = results.data[resultLength - 1].id;
      } else {
        this._nextServerFromId = results.data[resultLength - 1].id;
      }
    }

    // Update this.data
    if (this.dataType === Query.ObjectDataType) {
      this.data = [].concat(this.data);
    }

    // Insert the results... if the results are a match
    newResults.forEach((itemIn) => {
      const item = client.getObject(itemIn.id);
      if (item && (!this.filter || this.filter(item))) {
        this._appendResultsSplice(item);
        finalResults.push(item);
      }
    });


    // Trigger the change event
    this._triggerChange({
      type: 'data',
      data: finalResults.map(item => this._getData(item)),
      query: this,
      target: client,
    });
  }

  // Should be overridden by most subclasses
  _appendResultsSplice(item) {
    const data = this.data;
    const index = this._getInsertIndex(item, data);
    data.splice(index, 0, this._getData(item));
  }

  // Should be overridden by most subclasses
  _getInsertIndex(item, data) {
    return data.length;
  }

  /**
   * Returns a correctly formatted object representing a result.
   *
   * Format is specified by the `dataType` property.
   *
   * @method _getData
   * @private
   * @param  {Layer.Core.Root} item - Conversation, Message, etc... instance
   * @return {Object} - Conversation, Message, etc... instance or Object
   */
  _getData(item) {
    if (this.dataType === Query.ObjectDataType) {
      return item.toObject();
    }
    return item;
  }

  /**
   * Returns an instance regardless of whether the input is instance or object
   * @method _getInstance
   * @private
   * @param {Layer.Core.Root|Object} item - Conversation, Message, etc... object/instance
   * @return {Layer.Core.Root}
   */
  _getInstance(item) {
    if (item instanceof Root) return item;
    return client.getObject(item.id);
  }

  /**
   * Ask the query for the item matching the ID.
   *
   * Returns undefined if the ID is not found.
   *
   * @method _getItem
   * @private
   * @param  {String} id
   * @return {Object} Conversation, Message, etc... object or instance
   */
  _getItem(id) {
    const index = this._getIndex(id);
    return index === -1 ? null : this.data[index];
  }

  /**
   * Get the index of the item represented by the specified ID; or return -1.
   *
   * @method _getIndex
   * @private
   * @param  {String} id
   * @return {number}
   */
  _getIndex(id) {
    for (let index = 0; index < this.data.length; index++) {
      if (this.data[index].id === id) return index;
    }
    return -1;
  }

  /**
   * Handle any change event received from the Layer.Core.Client.
   *
   * These can be caused by websocket events, as well as local
   * requests to create/delete/modify Conversations and Messages.
   *
   * The event does not necessarily apply to this Query, but the Query
   * must examine it to determine if it applies.
   *
   * @method _handleEvents
   * @private
   * @param {String} eventName - "messages:add", "conversations:change"
   * @param {Layer.Core.LayerEvent} evt
   */
  _handleEvents(eventName, evt) {
    // Noop
  }

  /**
   * Handle a change event... for models that don't require custom handling
   *
   * @method _handleChangeEvent
   * @param {Layer.Core.LayerEvent} evt
   * @private
   */
  _handleChangeEvent(name, evt) {
    const index = this._getIndex(evt.target.id);

    if (index !== -1) {
      if (this.dataType === Query.ObjectDataType) {
        this.data = [
          ...this.data.slice(0, index),
          evt.target.toObject(),
          ...this.data.slice(index + 1),
        ];
      }
      this._triggerChange({
        type: 'property',
        target: this._getData(evt.target),
        query: this,
        isChange: true,
        changes: evt.changes,
      });
    }
  }

  _handleAddEvent(name, evt) {
    const list = evt[name]
      .filter(obj => this._getIndex(obj.id) === -1)
      .map(obj => this._getData(obj))
      .filter(item => !this.filter || this.filter(item));

    // Add them to our result set and trigger an event for each one
    if (list.length) {
      const data = this.data = this.dataType === Query.ObjectDataType ? [].concat(this.data) : this.data;
      list.forEach((item) => {
        data.push(item);
        this.totalSize += 1;

        this._triggerChange({
          type: 'insert',
          index: data.length - 1,
          target: item,
          query: this,
        });
      });
    }
  }

  _handleRemoveEvent(name, evt) {
    const removed = [];
    evt[name].forEach((obj) => {
      const index = this._getIndex(obj.id);

      if (index !== -1) {
        if (obj.id === this._nextDBFromId) this._nextDBFromId = this._updateNextFromId(index);
        if (obj.id === this._nextServerFromId) this._nextServerFromId = this._updateNextFromId(index);
        removed.push({
          data: obj,
          index,
        });
        if (this.dataType === Query.ObjectDataType) {
          this.data = [
            ...this.data.slice(0, index),
            ...this.data.slice(index + 1),
          ];
        } else {
          this.data.splice(index, 1);
        }
      }
    });

    this.totalSize -= removed.length;
    removed.forEach((removedObj) => {
      this._triggerChange({
        type: 'remove',
        target: this._getData(removedObj.data),
        index: removedObj.index,
        query: this,
      });
    });
  }

  /**
   * If the current next-id is removed from the list, get a new nextId.
   *
   * If the index is greater than 0, whatever is after that index may have come from
   * websockets or other sources, so decrement the index to get the next safe paging id.
   *
   * If the index if 0, even if there is data, that data did not come from paging and
   * can not be used safely as a paging id; return '';
   *
   * @method _updateNextFromId
   * @private
   * @param {number} index - Current index of the nextFromId
   * @returns {String} - Next ID or empty string
   */
  _updateNextFromId(index) {
    if (index > 0) return this.data[index - 1].id;
    else return '';
  }

  /*
   * If this is ever changed to be async, make sure that destroy() still triggers synchronous events
   */
  _triggerChange(evt) {
    if (this.isDestroyed || client._inCleanup) return;
    this.trigger('change', evt);
    this.trigger('change:' + evt.type, evt);
  }

  toString() {
    return this.id;
  }
}


Query.prefixUUID = 'layer:///queries/';

/**
 * Query for Conversations.
 *
 * Use this value in the Layer.Core.Query.model property.
 * @property {String} Conversation
 * @static
 */
Query.Conversation = 'Conversation';

/**
 * Query for Channels.
 *
 * Use this value in the Layer.Core.Query.model property.
 * @property {String} Channel
 * @static
 */
Query.Channel = 'Channel';

/**
 * Query for Messages.
 *
 * Use this value in the Layer.Core.Query.model property.
 * @property {String} Message
 * @static
 */
Query.Message = 'Message';

/**
 * Query for Announcements.
 *
 * Use this value in the Layer.Core.Query.model property.
 * @property {String} Announcement
 * @static
 */
Query.Announcement = 'Announcement';

/**
 * Query for Identities.
 *
 * Use this value in the Layer.Core.Query.model property.
 * @property {String} Identity
 * @static
 */
Query.Identity = 'Identity';

/**
 * Query for Members of a Channel.
 *
 * Use this value in the Layer.Core.Query.model property.
 * @property {String}
 * @static
 */
Query.Membership = 'Membership';

/**
 * Get data as POJOs/immutable objects.
 *
 * This value of Layer.Core.Query.dataType will cause your Query data and events to provide Messages/Conversations as immutable objects.
 *
 * @property {String}
 * @static
 */
Query.ObjectDataType = 'object';

/**
 * Get data as instances of Layer.Core.Message and Layer.Core.Conversation.
 *
 * This value of Layer.Core.Query.dataType will cause your Query data and events to provide Messages/Conversations as instances.
 *
 * @property {String}
 * @static
 */
Query.InstanceDataType = 'instance';

/**
 * Set the maximum page size for queries.
 *
 * @property {number}
 * @static
 */
Query.MaxPageSize = 100;

/**
 * Access the number of results currently loaded.
 *
 * @property {Number}
 * @readonly
 */
Object.defineProperty(Query.prototype, 'size', {
  enumerable: true,
  get: function get() {
    return !this.data ? 0 : this.data.length;
  },
});

/** Access the total number of results on the server.
 *
 * Will be 0 until the first query has successfully loaded results.
 *
 * @property {Number}
 * @readonly
 */
Query.prototype.totalSize = 0;

/**
 * Query results.
 *
 * Array of data resulting from the Query; either a Layer.Core.Root subclass.
 *
 * or plain Objects
 * @property {Object[]}
 * @readonly
 */
Query.prototype.data = null;

/**
 * Specifies the type of data being queried for.
 *
 * Model is one of
 *
 * * Layer.Core.Query.Conversation
 * * Layer.Core.Query.Channel
 * * Layer.Core.Query.Message
 * * Layer.Core.Query.Announcement
 * * Layer.Core.Query.Identity
 *
 * Value can be set via constructor and Layer.Core.Query.update().
 *
 * @property {String}
 * @readonly
 */
Query.prototype.model = '';

/**
 * What type of results to request of the server.
 *
 * Not yet supported; returnType is one of
 *
 * * object
 * * id
 * * count
 *
 *  Value set via constructor.
 + *
 * This Query API is designed only for use with 'object' at this time; waiting for updates to server for
 * this functionality.
 *
 * @property {String}
 * @readonly
 */
Query.prototype.returnType = 'object';

/**
 * Specify what kind of data array your application requires.
 *
 * Used to specify query dataType.  One of
 * * Query.ObjectDataType
 * * Query.InstanceDataType
 *
 * @property {String}
 * @readonly
 */
Query.prototype.dataType = Query.InstanceDataType;

/**
 * Number of results from the server to request/cache.
 *
 * The pagination window can be increased to download additional items, or decreased to purge results
 * from the data property.
 *
 *     query.update({
 *       paginationWindow: 150
 *     })
 *
 * This call will aim to achieve 150 results.  If it previously had 100,
 * then it will load 50 more. If it previously had 200, it will drop 50.
 *
 * Note that the server will only permit 100 at a time.
 *
 * @property {Number}
 * @readonly
 */
Query.prototype.paginationWindow = 100;

/**
 * Sorting criteria for Conversation Queries.
 *
 * Only supports an array of one field/element.
 * Only supports the following options:
 *
 * ```
 * query.update({sortBy: [{'createdAt': 'desc'}]})
 * query.update({sortBy: [{'lastMessage.sentAt': 'desc'}]
 *
 * client.createQuery({
 *   sortBy: [{'lastMessage.sentAt': 'desc'}]
 * });
 * client.createQuery({
 *   sortBy: [{'lastMessage.sentAt': 'desc'}]
 * });
 * ```
 *
 * Why such limitations? Why this structure?  The server will be exposing a Query API at which point the
 * above sort options will make a lot more sense, and full sorting will be provided.
 *
 * @property {String}
 * @readonly
 */
Query.prototype.sortBy = null;

/**
 * This value tells us what to reset the paginationWindow to when the query is redefined.
 *
 * @property {Number}
 * @private
 */
Query.prototype._initialPaginationWindow = 100;

/**
 * Your Query's WHERE clause.
 *
 * Currently, the only queries supported are:
 *
 * ```
 *  "conversation.id = 'layer:///conversations/uuid'"
 *  "channel.id = 'layer:///channels/uuid"
 * ```
 *
 * Note that both ' and " are supported.
 *
 * @property {String}
 * @readonly
 */
Query.prototype.predicate = null;

/**
 * Tracks whether this Query has ever been run
 *
 * @property {Boolean}
 * @private
 */
Query.prototype._firstRun = true;


/**
 * Callback to determine if a result should be written to the query's data.
 *
 * This exists as an alternative to the `predicate` which is not well supported by the server
 * at this time.  Return `true` to allow an item to be written to the Query data, return `false`
 * to exclude it.
 *
 * ```
 * query.filter = function(item) {
 *    return item.isPropertyTrue === false;
 * };
 * ```
 *
 * @property {Function}
 */
Query.prototype.filter = null;

/**
 * True if the Query is connecting to the server.
 *
 * It is not gaurenteed that every `update()` will fire a request to the server.
 * For example, updating a paginationWindow to be smaller,
 * Or changing a value to the existing value would cause the request not to fire.
 *
 * Recommended pattern is:
 *
 *      query.update({paginationWindow: 50});
 *      if (!query.isFiring) {
 *        alert("Done");
 *      } else {
 *          query.once("change", function(evt) {
 *            if (evt.type == "data") alert("Done");
 *          });
 *      }
 *
 * @property {Boolean}
 * @readonly
 */
Query.prototype.isFiring = false;

/**
 * True if we have reached the last result, and further paging will just return []
 *
 * @property {Boolean}
 * @readonly
 */
Query.prototype.pagedToEnd = false;

/**
 * The last request fired.
 *
 * If multiple requests are inflight, the response
 * matching this request is the ONLY response we will process.
 * @property {String}
 * @private
 */
Query.prototype._firingRequest = '';

/**
 * The ID to use in paging the server.
 *
 * Why not just use the ID of the last item in our result set?
 * Because as we receive websocket events, we insert and append items to our data.
 * That websocket event may not in fact deliver the NEXT item in our data, but simply an item, that sequentially
 * belongs at the end despite skipping over other items of data.  Paging should not be from this new item, but
 * only the last item pulled via this query from the server.
 *
 * @property {String}
 */
Query.prototype._nextServerFromId = '';

/**
 * The ID to use in paging the database.
 *
 * Why not just use the ID of the last item in our result set?
 * Because as we receive websocket events, we insert and append items to our data.
 * That websocket event may not in fact deliver the NEXT item in our data, but simply an item, that sequentially
 * belongs at the end despite skipping over other items of data.  Paging should not be from this new item, but
 * only the last item pulled via this query from the database.
 *
 * @property {String}
 */
Query.prototype._nextDBFromId = '';

Query._supportedEvents = [
  /**
   * The query data has changed; any change event will cause this event to trigger.
   * @event change
   */
  'change',

  /**
   * A new page of data has been loaded from the server
   * @event 'change:data'
   */
  'change:data',

  /**
   * All data for this query has been reset due to a change in the Query predicate.
   * @event 'change:reset'
   */
  'change:reset',

  /**
   * An item of data within this Query has had a property change its value.
   * @event 'change:property'
   */
  'change:property',

  /**
   * A new item of data has been inserted into the Query. Not triggered by loading
   * a new page of data from the server, but is triggered by locally creating a matching
   * item of data, or receiving a new item of data via websocket.
   * @event 'change:insert'
   */
  'change:insert',

  /**
   * An item of data has been removed from the Query. Not triggered for every removal, but
   * is triggered by locally deleting a result, or receiving a report of deletion via websocket.
   * @event 'change:remove'
   */
  'change:remove',

  /**
   * An item of data has been moved to a new index in the Query results.
   * @event 'change:move'
   */
  'change:move',

  /**
   * The query data failed to load from the server.
   * @event error
   */
  'error',

].concat(Root._supportedEvents);

Root.initClass.apply(Query, [Query, 'Query', Core]);

module.exports = Query;
