'use client'
import { useQuery } from '@tanstack/react-query'
import ChatMessage from './ChatMessage'
import { useChatStore } from '../store/chatStore'
import { chatApi } from '../services/api'
import { ScrollArea } from '@/components/ui/scroll-area'
import Loading from '@/components/Loading'
import { useRef, useState, useEffect } from 'react'

export default function ChatInterface({ session }) {
  const currentChatId = useChatStore((state) => state.currentChatId)
  const isSending = useChatStore((state) => state.isSending)
  const { setContextWindow } = useChatStore.getState()

  // Add a ref to track if we should update context
  const shouldUpdateContext = useRef(true)

  // Fetch messages using React Query first
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
    retry: 3,
    onError: (error) => {
      console.error('Error fetching messages:', error)
    },
    // Transform the response data to handle message status
    select: (data) => {
      if (!Array.isArray(data)) return []
      return data.map((message) => ({
        ...message,
        isPaused: message.status === 'paused',
      }))
    },
  })

  // Modify the messages effect to only update context when not streaming
  useEffect(() => {
    if (shouldUpdateContext.current && !isSending && messages?.length > 0) {
      setContextWindow(messages)
    }
  }, [messages, isSending])

  // Disable context updates when streaming starts, re-enable when it ends
  useEffect(() => {
    shouldUpdateContext.current = !isSending
  }, [isSending])

  // Add refs and state for scroll management
  const scrollAreaRef = useRef(null)
  const [userScrolled, setUserScrolled] = useState(false)

  // Update scroll handler to use Radix UI's viewport
  const handleScroll = (event) => {
    // Get the viewport element directly
    const viewport = event.currentTarget
    const { scrollTop, scrollHeight, clientHeight } = viewport
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10

    if (!isAtBottom) {
      setUserScrolled(true)
    } else {
      setUserScrolled(false)
    }
  }

  // Add scroll event listener to viewport
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (viewport) {
        viewport.addEventListener('scroll', handleScroll)
        return () => viewport.removeEventListener('scroll', handleScroll)
      }
    }
  }, []) // Empty dependency array since we only want to attach/detach the listener once

  // Auto-scroll effect
  useEffect(() => {
    if (!userScrolled && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      )
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages, isSending, userScrolled])

  // Add scroll to bottom function
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight
        setUserScrolled(false) // Reset user scroll state
      }
    }
  }

  // Add to chat store for external access
  useEffect(() => {
    useChatStore.setState({ scrollToBottom })
    return () => {
      useChatStore.setState({ scrollToBottom: null })
    }
  }, [])

  return (
    <ScrollArea ref={scrollAreaRef} className="flex flex-1" type="always">
      <div className="h-full w-full pt-6" data-radix-scroll-area-viewport="">
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
              <div className="flex h-full items-center justify-center text-gray-400">
                Playground
              </div>
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
      </div>
    </ScrollArea>
  )
}
