import { create } from 'zustand'

// Zustand store for managing chat state
export const useChatStore = create((set, get) => ({
  currentChatId: null,
  setCurrentChatId: (chatId) => set({ currentChatId: chatId }),
  isSending: false,
  setIsSending: (state) => set({ isSending: state }),
  scrollToBottom: null,
}))
