'use client'
import { useQuery } from '@tanstack/react-query'
import ChatMessage from './ChatMessage'
import ChatInputForm from './ChatInputForm'
import { useChatStore } from '../store/chatStore'
import { chatApi } from '../services/api'
import { useState } from 'react'

export default function ChatInterface() {
  console.log('ChatInterface')
  const [isSending, setIsSending] = useState(false)
  const { currentChatId } = useChatStore()

  // Fetch messages using React Query
  const {
    data: messages = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['messages', currentChatId],
    queryFn: () => chatApi.getMessages(currentChatId),
    enabled: !!currentChatId,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
    // Add retry logic
    retry: 3,
    // Add error handler
    onError: (error) => {
      console.error('Error fetching messages:', error)
    },
    // Transform the response data
    select: (data) => {
      return Array.isArray(data) ? data : []
    },
  })

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-gray-400">
            Loading messages...
          </div>
        ) : isError ? (
          <div className="flex h-full items-center justify-center text-red-500">
            Error: {error?.message || 'Failed to load messages'}
          </div>
        ) : !currentChatId ? (
          <div className="flex h-full items-center justify-center text-gray-400">
            Select a chat or start a new conversation
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-400">Playground</div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div className={`typing-indicator ${isSending ? 'active' : ''}`}>
              <div className="dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>
      <ChatInputForm chatId={currentChatId} onSendingStateChange={setIsSending} />
    </div>
  )
}
