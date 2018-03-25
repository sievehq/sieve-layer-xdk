/**
 * Call this function to initialize all of the angular 1.x directives needed to handle the Layer UI for Web widgets.
 *
 * When passing scope values/function into widget properties, prefix the property with `ng-`;
 * for functions, replace `on-` with `ng-`.  If passing in a literal, do NOT prefix with `ng-`:
 *
 * ```
 *    <layer-notifier notify-in-foreground="toast"></layer-notifier>
 *    <layer-conversation-view ng-query="myscopeProp.query"></layer-conversation-view>
 *    <layer-conversation-list ng-conversation-selected="myscope.handleSelectionFunc"></layer-conversation-list>
 *    <layer-send-button></layer-send-button>
 *    <layer-file-upload-button></layer-file-upload-button>
 * ```
 *
 * Call this function to initialize angular 1.x Directives which will be part of the "layerXDKControllers" controller:
 *
 * ```
 * import '@layerhq/web-xdk/ui/adapters/angular';
 * Layer.UI.adapters.angular(angular); // Creates the layerXDKControllers controller
 * angular.module('MyApp', ['layerXDKControllers']);
 * ```
 *
 *   Now you can put `<layer-conversation-view>` and other widgets into angular templates and expect them to work.
 *   Prefix ALL property names with `ng-` to insure that scope is evaluated prior to passing the value on to the webcomponent.
 *
 * ### Importing
 *
 * Not included with the standard build. To import:
 *
 * ```
 * import '@layerhq/web-xdk/ui/adapters/angular';
 * ```
 *
 * @class Layer.UI.adapters.angular
 * @singleton
 * @param {Object} angular     Pass in the AngularJS library
 */
'use strict';

var _componentServices = require('../component-services');

var _index = require('./index');



function initAngular(angular) {

  // Define the layerXDKController
  var controllers = angular.module('layerXDKControllers', []);

  // Setup the properties for the given widget that is being generated
  function setupProps(scope, elem, attrs, props) {

    /*
     * For each property we are going to do the following:
     *
     * 1. See if there is an initial value
     * 2. Evaluate it against the scope via scope.$eval() so we have a resolved value
     * 3. $observe() for any changes in the property
     * 4. $watch() for any changes in the output of scope.$eval()
     *
     * One complicating factor here: while we do support passing in values such as `query` or `query-id`, these
     * values, if placed within an html template, will be passed directly on to a webcomponent BEFORE
     * this code triggers and corrects those values.  This can cause errors.
     *
     * Instead, if one passes `ng-query` or `ng-query-id` in via the html template, there is no `ng-query` property
     * to pass this value on to until the code below triggers.  The code below will map `ng-query` to `query` AFTER
     * its been evaluated.
     *
     * The above steps are applied once for `query-id`, and a second time for `ng-query-id` so that either one works, but `ng-`
     * works better.
     *
     * Best Practice therefore: Use `ng-` prefix on all properties passed via html template files.
     */
    props.forEach(function (prop) {
      var ngPropertyName = prop.propertyName.indexOf('on') === 0 ? 'ng' + prop.propertyName.substring(2) : 'ng' + prop.propertyName.substring(0, 1).toUpperCase() + prop.propertyName.substring(1);

      // Observe for changes to the attribute value and apply them to the property value
      attrs.$observe(prop.propertyName, function (value) {
        if (elem.properties) {
          elem[prop.propertyName] = value;
        } else {
          if (!elem.properties) elem.properties = {};
          elem.properties[prop.propertyName] = value;
        }
      });

      // Observe for changes to the attribute value prefixed with "ng-" and watch the scoped expression for changes
      // that need to be applied to the property value.
      attrs.$observe(ngPropertyName, function (expression) {
        scope.$watch(expression, function (value) {
          if (!elem.properties) elem.properties = {};
          if (elem.properties._internalState && !elem.properties._internalState.disableSetters) {
            elem[prop.propertyName] = value;
          } else {
            elem.properties[prop.propertyName] = value;
          }
        });
      });
    });
  }

  // Gather all UI Components
  Object.keys(_componentServices.ComponentsHash).forEach(function (componentName) {
    var component = _componentServices.ComponentsHash[componentName];

    // Get the camel case controller name
    var controllerName = componentName.replace(/-(.)/g, function (str, value) {
      return value.toUpperCase();
    });

    controllers.directive(controllerName, function () {
      return {
        restrict: 'E',
        link: function link(scope, elem, attrs) {
          var functionProps = component.properties;
          setupProps(scope, elem[0], attrs, functionProps);
        }
      };
    });
  });
}

module.exports = initAngular;
(0, _index.register)('angular', initAngular);