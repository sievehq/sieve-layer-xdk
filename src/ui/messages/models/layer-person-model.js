/**
 * TODO: Location Model should be able to use one of these
 * TODO: Look at vcard fields
 * @ignore
 */

import { Client, MessagePart, MessageTypeModel, Util }  from '../../../core';

class PersonModel extends MessageTypeModel {

  _parseMessage(payload) {
    super._parseMessage(payload);

    this.addressModels = this.getModelsByRole('address');
  }
}

PersonModel.prototype.addressModels = null;
PersonModel.prototype.phone = '';
PersonModel.prototype.email = '';
PersonModel.prototype.name = '';
PersonModel.prototype.jobRole = ''; // Used for Person who is an Employee only, not for customers
PersonModel.prototype.identityId = '';

PersonModel.MIMEType = 'application/vnd.layer.person+json';

// Register the Card Model Class with the Client
Client.registerMessageTypeModelClass(PersonModel, 'PersonModel');

module.exports = PersonModel;
