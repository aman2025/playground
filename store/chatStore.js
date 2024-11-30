import { create } from 'zustand'

export const useChatStore = create((set) => ({
  currentChatId: null,
  setCurrentChatId: (chatId) => {
    // Reset context window when switching to a new chat
    set({
      currentChatId: chatId,
      contextWindow: [],
    })
  },
  isSending: false,
  setIsSending: (state) => set({ isSending: state }),
  scrollToBottom: null,
  contextWindow: [],
  // Add function to capture context before sending
  captureContextWindow: (messages) => {
    if (!messages?.length) {
      console.log('Context Window Captured: Empty (New Chat)')
      return set({ contextWindow: [] })
    }

    const lastTwoMessages = messages.slice(-2)
    console.log('Context Window Captured:', {
      totalMessages: messages.length,
      contextWindow: lastTwoMessages,
    })
    set({ contextWindow: lastTwoMessages })
  },
}))
