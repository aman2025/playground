'use client'
import { useQuery } from '@tanstack/react-query'
import ChatMessage from './ChatMessage'
import { useChatStore } from '../store/chatStore'
import { chatApi } from '../services/api'
import { ScrollArea } from '@/components/ui/scroll-area'
import Loading from '@/components/Loading'

export default function ChatInterface({ session }) {
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
    // Transform the response data to handle message status
    select: (data) => {
      if (!Array.isArray(data)) return []
      return data.map((message) => ({
        ...message,
        // Add visual indicator for paused messages
        isPaused: message.status === 'paused',
      }))
    },
  })

  return (
    <ScrollArea className="flex flex-1" type="always">
      <div className="flex justify-center">
        <div className="flex w-full max-w-[818px]">
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
                <ChatMessage key={message.id} message={message} session={session} />
              ))}
              {isSending && <Loading className="mt-4" />}
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  )
}
