/**
 * TODO: Location Model should be able to use one of these
 * @ignore
 */

import { Client, MessagePart, MessageTypeModel, Util }  from '../../../core';

class OrganizationModel extends MessageTypeModel {

  _parseMessage(payload) {
    super._parseMessage(payload);

    this.addressModels = this.getModelsFromPart('address');
    this.contactModels = this.getModelsFromPart('contact');
  }
}

OrganizationModel.prototype.addressModels = null;
OrganizationModel.prototype.contactModels = null;
OrganizationModel.prototype.type = '';

OrganizationModel.MIMEType = 'application/vnd.layer.organization+json';

// Register the Card Model Class with the Client
Client.registerMessageTypeModelClass(OrganizationModel, 'OrganizationModel');

module.exports = OrganizationModel;
