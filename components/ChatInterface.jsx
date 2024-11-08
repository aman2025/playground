'use client'
import { useEffect, useState } from 'react'
import ChatMessage from './ChatMessage'
import ChatInputForm from './ChatInputForm'
import { useChatStore } from '../store/chatStore'

export default function ChatInterface() {
  const { messages, setMessages, currentChatId } = useChatStore()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadMessages = async () => {
      if (!currentChatId) {
        return
      }

      try {
        const response = await fetch(`/api/chat/${currentChatId}/messages`)
        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data) && data.length > 0) {
            setMessages(data)
          }
        }
      } catch (error) {
        console.error('Error loading messages:', error)
      }
    }

    loadMessages()
  }, [currentChatId, setMessages])

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-400">Playground</div>
        ) : (
          messages.map((message) => <ChatMessage key={message.id} message={message} />)
        )}
      </div>
      <ChatInputForm chatId={currentChatId} isLoading={isLoading} setIsLoading={setIsLoading} />
    </div>
  )
}
