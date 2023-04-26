import { createContext } from 'react';

import { ChatbarInitialState } from './Chatbar.state';

export const ChatbarContext = createContext({
  state: ChatbarInitialState,
  dispatch: () => {},
  handleDeleteConversation: () => {},
  handleClearConversations: () => {},
  handleExportData: () => {},
  handleImportConversations: () => {},
  handlePluginKeyChange: () => {},
  handleClearPluginKey: () => {},
  handleApiKeyChange: () => {},
});