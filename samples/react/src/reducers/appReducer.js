/**
 * Manages global state for our app.
 *
 * Currently, the main global state is whether or not the client is ready,
 * and who our current user is.
 */
import {
  CLIENT_READY,
} from '../actions/messenger';

const initialState = {
  ready: false,
  clientReady: false,
  user: {},
  appId: '',
};

export default function appReducer(state = initialState, action) {
  const { payload, type } = action;

  switch (type) {
    case CLIENT_READY:
      return {
        ...state,
        ready: true,
        clientReady: true,
        user: payload.user,
        appId: payload.appId,
      };
    default:
      return state;
  }
}
