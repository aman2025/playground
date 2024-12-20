import { create } from 'zustand'

export const useChatStore = create((set) => ({
  currentChatId: null,
  setCurrentChatId: (chatId) => set({ currentChatId: chatId }),

  isSending: false,
  setIsSending: (state) => set({ isSending: state }),
  scrollToBottom: null,
  contextWindow: [],
  // Add function to capture context before sending
  setContextWindow: (messages) => {
    if (!messages?.length) {
      return set({ contextWindow: [] })
    }

    const lastTwoMessages = messages.slice(-2)
    set({ contextWindow: lastTwoMessages })
  },
  // trigger submit message at the welcome cards component
  submitMessage: (message, formData = null) => {
    set({ pendingMessage: message })
    if (formData) {
      // Store the FormData for use in ChatInputForm
      set({ pendingFormData: formData })
    }
  },

  pendingMessage: null,
}))
