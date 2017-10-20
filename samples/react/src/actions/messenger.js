/**
 * All of the Redux Actions for the sample app
 */

import { pushState } from 'redux-router';

export const CLIENT_READY = 'CLIENT_READY';
export const SHOW_PARTICIPANTS = 'SHOW_PARTICIPANTS';
export const HIDE_PARTICIPANTS = 'HIDE_PARTICIPANTS';
export const CREATE_CONVERSATION = 'CREATE_CONVERSATION';
export const SELECT_CONVERSATION = 'SELECT_CONVERSATION';
export const SELECT_CONVERSATION_ID = 'SELECT_CONVERSATION_ID';
export const ADD_PARTICIPANT = 'ADD_PARTICIPANT';
export const REMOVE_PARTICIPANT = 'REMOVE_PARTICIPANT';
export const EDIT_CONVERSATION_TITLE = 'EDIT_CONVERSATION_TITLE';
export const CANCEL_EDIT_CONVERSATION_TITLE = 'CANCEL_EDIT_CONVERSATION_TITLE';
export const CHANGE_CONVERSATION_TITLE = 'CHANGE_CONVERSATION_TITLE';
export const SAVE_CONVERSATION_TITLE = 'SAVE_CONVERSATION_TITLE';
export const ROUTER_DID_CHANGE = '@@reduxReactRouter/routerDidChange';
export const SHOW_ANNOUNCEMENTS = 'SHOW_ANNOUNCEMENTS';
export const HIDE_ANNOUNCEMENTS = 'HIDE_ANNOUNCEMENTS';
export const MARK_MESSAGE_READ = 'MARK_MESSAGE_READ';
export const TOGGLE_PRESENCE = 'TOGGLE_PRESENCE';


export function clientReady(payload) {
  return {
    type: CLIENT_READY,
    payload
  };
}

export function selectConversation(conversation) {
  return {
    type: SELECT_CONVERSATION,
    payload: {
      conversation
    }
  }
}

export function selectConversationId(id) {
  return {
    type: SELECT_CONVERSATION_ID,
    payload: {
      id
    }
  }
}

export function showParticipants() {
  return {
    type: SHOW_PARTICIPANTS
  };
}

export function hideParticipants() {
  return {
    type: HIDE_PARTICIPANTS
  };
}

export function createConversation() {
  return {
    type: CREATE_CONVERSATION
  };
}

export function addParticipant(user) {
  return {
    type: ADD_PARTICIPANT,
    payload: {
      user
    }
  };
}

export function removeParticipant(user) {
  return {
    type: REMOVE_PARTICIPANT,
    payload: {
      user
    }
  };
}

export function editConversationTitle() {
  return {
    type: EDIT_CONVERSATION_TITLE
  };
}

export function cancelEditConversationTitle() {
  return {
    type: CANCEL_EDIT_CONVERSATION_TITLE
  };
}

export function changeConversationTitle(title) {
  return {
    type: CHANGE_CONVERSATION_TITLE,
    payload: {
      title
    }
  };
}

export function saveConversationTitle() {
  return {
    type: SAVE_CONVERSATION_TITLE
  };
}

export function markMessageRead(messageId) {
  return {
    type: MARK_MESSAGE_READ,
    payload: {
      messageId
    }
  }
}

export function showAnnouncements() {
  return {
    type: SHOW_ANNOUNCEMENTS
  };
}

export function hideAnnouncements() {
  return {
    type: HIDE_ANNOUNCEMENTS
  };
}

export function togglePresence() {
  return {
    type: TOGGLE_PRESENCE
  };
}