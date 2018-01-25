import { push } from 'redux-router';
import { Layer } from '../get-layer';
import {
  CREATE_CONVERSATION,
  SELECT_CONVERSATION,
  SELECT_CONVERSATION_ID,
  SAVE_CONVERSATION_TITLE,
  MARK_MESSAGE_READ,
  TOGGLE_PRESENCE,
  ROUTER_DID_CHANGE,
  clientReady,
  selectConversation
} from '../actions/messenger';

const { uuid } = Layer.Utils;

function internalSelectConversation(layerClient, state, payload, next) {
  if (state.activeConversationState.conversation) {
    const conversation = layerClient.getConversation(state.activeConversationState.conversation.id);
    if (conversation) conversation.off(null, null, selectConversation);
  }

  if (payload.conversation && payload.conversation.id) {
    layerClient.getConversation(payload.conversation.id).on('conversations:change', function(evt) {
      next(selectConversation(evt.target.toObject()));
    }, selectConversation);
    return next(push(`/conversations/${uuid(payload.conversation.id)}`));
  } else {
    return next(push('/'));
  }
}

function handleAction(layerClient, state, action, next) {
  const { type, payload } = action;

  switch(type) {
    /**
     * The app has loaded, it has a conversation id, we want to get from there to having an activeConversation state set.
     */
    case SELECT_CONVERSATION_ID: {
      // Load the Converation, and when its loaded, select it so all of its properties get copied into the redux state
      var onReady = function() {
        var conversation = layerClient.getConversation(payload.id, true);
        conversation.once('conversations:loaded', function() {
          next(selectConversation(conversation.toObject()));
        });

        // Select our potentially incomplete, not yet loaded Conversation and copy what we have into the redux state
        // Or maybe its already loaded, and this will work faster.
        internalSelectConversation(layerClient, state, {conversation}, next);
      };
      if (state.app.ready) {
        onReady();
      } else {
        layerClient.once('ready', onReady);
      }
      return;
    }

    /**
     * Select the conversation, and monitor it for changes; set its current any any updates to its state to be a part of our Redux state
     */
    case SELECT_CONVERSATION: {
      return internalSelectConversation(layerClient, state, payload, next);
    }

    /**
     * Create a Conversation, and then select it.
     */
    case CREATE_CONVERSATION: {
      const { participants } = state.participantState;
      const distinct = participants.length === 1;
      const conversation = layerClient.createConversation({
        distinct,
        participants
      });
      return internalSelectConversation(layerClient, state, {conversation}, next);
    }

    /**
     * Update the Conversation metadata
     */
    case SAVE_CONVERSATION_TITLE:
      layerClient
        .getConversation(`layer:///conversations/${state.router.params.conversationId}`, true)
        .setMetadataProperties({
          conversationName: state.activeConversationState.title
        });
      return;

    // We use this for Announcements; <layer-conversation> handles marking messages read for messages in its view
    case MARK_MESSAGE_READ:
      layerClient
        .getMessage(payload.messageId).isRead = true;
      return;

    case TOGGLE_PRESENCE:
      if (layerClient.user.status === Layer.Core.Identity.STATUS.BUSY) {
        layerClient.user.setStatus(Layer.Core.Identity.STATUS.AVAILABLE);
      } else {
        layerClient.user.setStatus(Layer.Core.Identity.STATUS.BUSY);
      }
      return;
    default:
      return;
  }
}

/**
 * Redux state middleware manager
 */
const layerMiddleware = layerClient => store => {

  layerClient.on('ready', () => {
    store.dispatch(clientReady({ user: layerClient.user.toObject(), appId: layerClient.appId }));
  });

  return next => action => {
    const state = store.getState();

    handleAction(layerClient, state, action, next);

    const nextState = next(action);

    return nextState;
  };
};

export default layerMiddleware;
