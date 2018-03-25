'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _core = require('../../../core');

var _core2 = _interopRequireDefault(_core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * TODO: Location Model should be able to use one of these
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @ignore
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var OrganizationModel = function (_MessageTypeModel) {
  _inherits(OrganizationModel, _MessageTypeModel);

  function OrganizationModel() {
    _classCallCheck(this, OrganizationModel);

    return _possibleConstructorReturn(this, (OrganizationModel.__proto__ || Object.getPrototypeOf(OrganizationModel)).apply(this, arguments));
  }

  _createClass(OrganizationModel, [{
    key: 'parseModelChildParts',
    value: function parseModelChildParts() {
      _get(OrganizationModel.prototype.__proto__ || Object.getPrototypeOf(OrganizationModel.prototype), 'parseModelChildParts', this).call(this);
      this.addressModels = this.getModelsByRole('address');
      this.contactModels = this.getModelsByRole('contact');
    }
  }]);

  return OrganizationModel;
}(_core.MessageTypeModel);

OrganizationModel.prototype.addressModels = null;
OrganizationModel.prototype.contactModels = null;
OrganizationModel.prototype.type = '';

OrganizationModel.MIMEType = 'application/vnd.layer.organization+json';

// Register the Card Model Class with the Client
_core2.default.Client.registerMessageTypeModelClass(OrganizationModel, 'OrganizationModel');

module.exports = OrganizationModel;