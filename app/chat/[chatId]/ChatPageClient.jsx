'use client'

import { useEffect } from 'react'
import { useChatStore } from '@/store/chatStore'

// Client-side component to handle chat state
export default function ChatPageClient({ chatId }) {
  const { setCurrentChatId } = useChatStore()

  useEffect(() => {
    // Set the current chat ID from the URL parameter
    if (chatId) {
      setCurrentChatId(chatId)
    }
  }, [chatId, setCurrentChatId])

  return null // This component doesn't render anything itself
}
