import { create } from 'zustand'

// Zustand store for managing chat state
export const useChatStore = create((set, get) => ({
  chats: [],
  messages: [],
  currentChatId: null,
  setChats: (chats) => set({ chats }),
  addChat: (newChat) => set((state) => ({ chats: [newChat, ...state.chats] })),
  setMessages: (messages) => {
    set({ messages: Array.isArray(messages) ? messages : [] })
  },
  addMessage: (newMessage) => {
    set((state) => ({
      messages: [...state.messages, ...newMessage],
    }))
  },
  setCurrentChatId: (chatId) => set({ currentChatId: chatId }),
}))
