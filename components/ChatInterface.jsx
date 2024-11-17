'use client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import ChatMessage from './ChatMessage'
import { useChatStore } from '../store/chatStore'
import { chatApi } from '../services/api'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState } from 'react'

export default function ChatInterface() {
  const queryClient = useQueryClient()
  const { currentChatId, isSending, setIsSending } = useChatStore()
  const [streamingMessage, setStreamingMessage] = useState('')

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

  // Add this function to handle streaming responses
  const handleStreamingResponse = async (response) => {
    setIsSending(true)
    setStreamingMessage('')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter((line) => line.trim())

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.content) {
                setStreamingMessage((prev) => prev + data.content)
              }
            } catch (e) {
              console.error('Error parsing SSE message:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error reading stream:', error)
    } finally {
      setIsSending(false)
      // Invalidate the messages query to fetch the complete message
      queryClient.invalidateQueries(['messages', currentChatId])
    }
  }

  return (
    <ScrollArea className="flex flex-1" type="always">
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
              {streamingMessage && (
                <ChatMessage
                  message={{
                    id: 'streaming',
                    content: streamingMessage,
                    role: 'assistant',
                  }}
                />
              )}
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
