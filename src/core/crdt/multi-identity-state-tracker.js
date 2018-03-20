import { client } from '../../settings';
import CRDTTracker from './state-tracker';

/**
 * The Multi Identity tracker class tracks all state related to a given named state across all users.
 *
 * So if multiple users have all sent in values for "myStateName" one Multi Identity Tracker class will be instantiated
 * that will track all users's "myStateName" state.
 *
 * @class Layer.Core.CRDT.MultiIdentityStateTracker
 */
class CRDTMultiIdentityStateTracker {

  /**
   *
   * @method constructor
   * @param {Object} options
   * @param {String} name    Name of the state to be tracked
   * @param {String} options.type   The Operation type chosen from Layer.Constants.CRDT_TYPES
   */
  constructor({ name, type }) {
    this.users = {};
    this.name = name;
    this.type = type;
  }

  /**
   * Adds tracking for the specified user (no-op if already tracked)
   *
   * @method _addUser
   * @private
   * @param {String} userId
   */
  _addUser(userId) {
    if (!this.users[userId]) {
      this.users[userId] = new CRDTTracker({
        type: this.type,
        name: this.name,
        userId,
      });
    }
  }

  /**
   * Returns the value of this state for the specified Identity
   *
   * @method getValue
   * @param {Layer.Core.Identity} identity
   * @returns {String|Number|Boolean|String[]|Number[]|Boolean[]}
   */
  getValue(identity) {
    if (this.users[identity.userId]) {
      return this.users[identity.userId].getValue();
    } else {
      return null;
    }
  }

  /**
   * Returns the value for all of the specified identities if they have posted a Response Message for this state.
   *
   * A `null` input will return All Identities.
   *
   * @method getValues
   * @param {Layer.Core.Identity[]} [identities=null]
   * @returns {Object} results
   * @param {String} return.identityId
   * @param {String|Number|Boolean|String[]|Number[]|Boolean[]} return.value
   */
  getValues(identities) {
    const userIds = (identities === null) ? Object.keys(this.users) : identities.map(identity => identity.userId);

    return userIds
      .map((userId) => {
        const tracker = this.users[userId];
        if (tracker) {
          const identity = client.getIdentity(userId);
          if (identity) {
            return {
              identityId: identity.id,
              value: tracker.getValue(),
            };
          }
        }
        return null;
      })
      .filter(result => result); // filter out the null results that lack a tracker
  }

  /**
   * Adds a value for this state for the current authenticated user.
   *
   * @method addValue
   * @param {String|Number|Boolean} value
   * @returns {Layer.Core.CRDT.ChangeReport[]}
   */
  addValue(value) {
    const userId = client.user.userId;
    this._addUser(userId);
    return this.users[userId].add(value);
  }

  /**
   * Removes a value for this state for the current authenticated user.
   *
   * @method removeValue
   * @param {String|Number|Boolean} value
   * @returns {Layer.Core.CRDT.ChangeReport[]}
   */
  removeValue(value) {
    const userId = client.user.userId;
    this._addUser(userId);
    return this.users[userId].remove(value);
  }

  /**
   * Given a full Response Summary payload from the server, update this tracker's state and generate any needed change operations.
   *
   * @method synchronize
   * @param {Object} payload
   * @returns {Layer.Core.CRDT.ChangeReport[]}
   */
  synchronize(payload) {
    const changes = [];
    Object.keys(payload).forEach((userId) => {
      const userFullState = payload[userId];
      const userState = userFullState[this.name];
      if (userState) {
        this._addUser(userId);
        const localChanges = this.users[userId].synchronize(payload);
        changes.push(...localChanges);
      }
    });
    return changes;
  }
}

module.exports = CRDTMultiIdentityStateTracker;
