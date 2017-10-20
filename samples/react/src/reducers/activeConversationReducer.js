/**
 * Manages state describing the currently selected Conversation.
 */
import {
  SELECT_CONVERSATION,
  ROUTER_DID_CHANGE,
  EDIT_CONVERSATION_TITLE,
  CHANGE_CONVERSATION_TITLE,
  SAVE_CONVERSATION_TITLE,
  CANCEL_EDIT_CONVERSATION_TITLE,
} from '../actions/messenger';

const initialState = {
  editingTitle: false,
  title: '',
  conversation: null,
};

export default function activeConversationReducer(state = initialState, action) {
  const { payload, type } = action;

  switch (type) {
    case SELECT_CONVERSATION:
      return {
        ...state,
        conversation: payload.conversation,
        title: '',
        editingTitle: false
      };

    case EDIT_CONVERSATION_TITLE:
      return {
        ...state,
        editingTitle: true
      };
    case CHANGE_CONVERSATION_TITLE:
      return {
        ...state,
        title: payload.title
      };
    case SAVE_CONVERSATION_TITLE:
      return {
        ...state,
        title: '',
        editingTitle: false
      };
    case CANCEL_EDIT_CONVERSATION_TITLE:
      return {
        ...state,
        editingTitle: false,
        title: ''
      };

    default:
      return state;
  }
}
