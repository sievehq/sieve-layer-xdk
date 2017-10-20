import React from 'react';
import { render } from 'react-dom';

import { Layer, layerClient, LayerReactUI } from './get-layer';
import configureStore from './store/configureStore';
import { ownerSet } from './actions/messenger';
import ChatView from './ChatView'
import LoginTools from '../common/identityServices';

/**
 * Client authentication challenge.
 * Sign in to Layer sample identity provider service.
 */
layerClient.on('challenge', e => {
  LoginTools.getIdentityToken(Layer, e.nonce, e.callback);
});

LoginTools.onLogin(() => {
  /**
   * Start authentication
   */
  layerClient.connect();
});

/**
 * Share the client with the middleware layer
 */
const store = configureStore(layerClient);

/**
 * validate that the sample data has been properly set up
 */
LoginTools.validateSetup(layerClient, Layer);

render(
  <ChatView client={layerClient} store={store} />,
  document.getElementById('root')
);
