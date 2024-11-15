'use client'
import { useQuery } from '@tanstack/react-query'
import ChatMessage from './ChatMessage'
import { useChatStore } from '../store/chatStore'
import { chatApi } from '../services/api'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function ChatInterface() {
  const { currentChatId, isSending } = useChatStore()

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
    <ScrollArea className="flex flex-1">
      <div className="flex justify-center">
        <div className="flex w-full max-w-screen-md">
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
            <div className="w-full">
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
      </div>
    </ScrollArea>
  )
}
