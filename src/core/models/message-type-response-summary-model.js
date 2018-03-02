
/**
 * The MessageTypeResponseSummaryModel represents a the Message Part that contains all user Responses to a given Message Part.
 *
 * Message Part has a MIME Type of application/vnd.layer.responsesummary+json
 *
 * @class  Layer.Core.MessageTypeResponseSummaryModel
 * @extends Layer.Core.Root
 */
import Core from '../namespace';
import Syncable from './syncable';
import Root from '../root';
import Util from '../../utils';
import Identity from './identity';


class MessageTypeResponseSummaryModel extends Root {
  constructor(options) {
    super(options);
    if (!this._participantData) this._participantData = {};
  }

  // TODO: Known issue: doesObjectMatch won't compare arrays.
  _parseMessage(payload) {
    const participantData = payload.participant_data;
    if (!Util.doesObjectMatch(this._participantData, participantData)) {
      this._participantData = participantData;
      return true;
    }
  }

  _normalizeId(id) {
    if (id.indexOf(Identity.prefixUUID) === 0) {
      return id.substring(Identity.prefixUUID.length);
    } else {
      return id;
    }
  }

  /**
   * Get the Response Message value corresponding to the given `responseName` and `identityId`.
   *
   * @method getResponse
   * @param {String} responseName    Name of the response to lookup
   * @param {String} identityId         Identity ID of the user who made the response
   */
  getResponse(responseName, identityId) {
    const responses = this._participantData[this._normalizeId(identityId)] || {};
    const result = responses[responseName];
    return (result != null) ? result : null;
  }

  /**
   * Get _All_ responses from all users that contain the specified `responseName`
   *
   * ```
   * var responses = model.responses.getResponses("selection");
   * responses.forEach(response => {
   *   const identity = client.getIdentity(response.identityId);
   *   console.log(`${identity.displayName} selected ${response.value}`);
   * }
   * ```
   *
   * This method returns an array of all responses from all users who have a `responseName`, where each element
   * in the array contains:
   *
   * * `identityId` of the user who sent that response
   * * `value` the value of the response
   *
   * Note that a user who has set a `responseName` and then later cleared it will still have a `responseName`
   * property whose value may be an empty string, null, or other empty values. These results are included in the
   * array.
   *
   * @param {String} responseName
   * @param {String[]} [identityIds=null] Only include results from these authorized users (optional)
   * @returns {Object[]} responses
   */
  getResponses(responseName, identityIds) {
    const ids = identityIds && identityIds.length ? identityIds.map(id => this._normalizeId(id)) : null;
    return Object.keys(this._participantData)
      .filter((identityId) => {
        if (!(responseName in this._participantData[identityId])) return false;
        if (ids && ids.indexOf(identityId) === -1) return false;
        return true;
      })
      .map(identityId => ({
        identityId,
        value: this._participantData[identityId][responseName],
      }));
  }
}

MessageTypeResponseSummaryModel.prototype._participantData = null;
MessageTypeResponseSummaryModel.prototype.part = null;

MessageTypeResponseSummaryModel._supportedEvents = ['change'].concat(Root._supportedEvents);

MessageTypeResponseSummaryModel.inObjectIgnore = Root.inObjectIgnore;
Root.initClass.apply(MessageTypeResponseSummaryModel,
  [MessageTypeResponseSummaryModel, 'MessageTypeResponseSummaryModel', Core]);
Syncable.subclasses.push(MessageTypeResponseSummaryModel);
module.exports = MessageTypeResponseSummaryModel;
