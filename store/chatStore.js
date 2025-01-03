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

    const lastTwoMessages = []
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

  // Add new state for code viewer
  codeViewerContent: null,
  setCodeViewerContent: (content) => set({ codeViewerContent: content }),
  isCodeViewerOpen: false,
  setIsCodeViewerOpen: (isOpen) => set({ isCodeViewerOpen: isOpen }),
}))
