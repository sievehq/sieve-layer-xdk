/* global layer */
'use strict';

// Synchronous load of the configuration
import config from './LayerConfiguration.json'
import './login_style.css'
import './ui_web_style.css'
window.googleMapsAPIKey = config[0].google_maps_key;

if (!config[0].app_id) throw new Error("No app_id key found in LayerConfiguration.json");

/**
 * layerSample global utility
 *
 * @param {String}    appId - Layer Staging Application ID
 * @param {String}    userId - User ID to log in as
 * @param {Function}  challenge - Layer Client challenge function
 * @param {Function}  dateFormat - Get a nice date string
 */
const layerSample = {
  appId: config[0].app_id,
  identityProviderUrl: config[0].identity_provider_url + '/authenticate',
  userId: null,
  email: null,
  password: null,
  validateSetup: function(client, Layer) {
    // This query should be removed from production apps; its only here to validate your sample app setup.
    var conversationQuery = client.createQuery({
      paginationWindow: 1,
      model: Layer.Core.Query.Conversation,
    });
    conversationQuery.on('change:data', function() {
      if (conversationQuery.data.length === 0) {
        var identityQuery = client.createQuery({
          paginationWindow: 5,
          model: Layer.Core.Query.Identity
        });
        identityQuery.on('change:data', function() {
          if (identityQuery.data.length === 0) {
            alert("There are no other users to talk to; please use your Identity Server to register new users");
          } else {
            var conversation = client.createConversation({
              participants: identityQuery.data.map(function(user) {
                return user.id;
              }),
              metadata: {
                conversationName: "Sample Conversation"
              }
            });
            conversation.createMessage("Welcome to the new Conversation").send();
          }
        });
      }
    });
  },
  getIdentityToken: function(Layer, nonce, callback) {
    Layer.Utils.xhr({
      url: layerSample.identityProviderUrl,
      headers: {
        'Content-type': 'application/json',
        'Accept': 'application/json'
      },
      method: 'POST',
      data: {
        nonce: nonce,
        email: layerSample.email,
        password: layerSample.password
      }
    }, function(res) {
      if (res.success && res.data.identity_token) {
        console.log('challenge: ok');

        callback(res.data.identity_token);

        // Cleanup identity dialog
        var node = window.document && document.getElementById('identity');
        if (node) node.parentNode.removeChild(node);
      } else {
        alert('Login failed; please check your user id and password');
      }
    });
  },
  onLogin: function(callback) {
    this.loginCallback = callback;
  }
};

window.document && document.addEventListener('DOMContentLoaded', function() {
  /**
   * Dirty HTML dialog injection
   */
  var form = document.createElement('form');
  form.innerHTML += '<img src="http://static.layer.com/logo-only-blue.png" />';
  form.innerHTML += '<h1>Welcome to Layer sample app!</h1>';
  form.innerHTML += '<div class="login-group"><label for="email">Email</label><input type="text" id="email" /></div>';
  form.innerHTML += '<div class="login-group"><label for="password">Password</label><input type="password" id="password" /></div>';

  var button = document.createElement('button');
  button.type = 'button';
  button.appendChild(document.createTextNode('Login'));

  form.appendChild(button);

  var container = document.createElement('div');
  container.setAttribute('id', 'identity');
  container.appendChild(form);
  document.body.insertBefore(container, document.querySelectorAll('.main-app')[0]);

  function submit() {
    layerSample.email = document.getElementById('email').value;
    layerSample.password = document.getElementById('password').value;
    if (layerSample.email && layerSample.password) {
      layerSample.loginCallback(layerSample.userId);
    } else {
      alert("Please fill in an email address and password");
    }
  }

  button.addEventListener('click', submit);
  form.addEventListener('submit', submit);
  form.addEventListener('keydown', (e) => {
    if (e.keyCode === 13 && !e.shiftKey) {
      submit();
    }
  });
});

export default layerSample;
