'use client'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import ChatMessage from './ChatMessage'
import { useChatStore } from '../store/chatStore'
import { chatApi } from '../services/api'
import { ScrollArea } from '@/components/ui/scroll-area'
import Loading from '@/components/Loading'
import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { FileText, HelpCircle, Lightbulb } from 'lucide-react'

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

  // Create a loading skeleton component
  const MessageSkeleton = () => (
    <div className="flex w-full flex-col space-y-4 py-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-[360px]" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <ScrollArea ref={scrollAreaRef} className="flex flex-1" type="always">
      <div className="h-full w-full pt-6" data-radix-scroll-area-viewport="">
        <div
          className={`w-full ${
            !currentChatId
              ? 'flex min-h-[calc(100vh-200px)] items-center justify-center'
              : 'flex justify-center'
          }`}
        >
          <div className="flex w-full max-w-[818px]">
            {isLoading ? (
              <MessageSkeleton />
            ) : isError ? (
              <div className="flex h-full items-center justify-center text-red-500">
                Error: {error?.message || 'Failed to load messages'}
              </div>
            ) : !currentChatId ? (
              <div className="mx-auto w-full max-w-4xl px-4">
                {/* Playground Header */}
                <div className="mb-12 text-center">
                  <div className="mx-auto mb-2 h-16 w-16">
                    <Image src="/images/logo.png" alt="Playground Logo" width={64} height={64} />
                  </div>
                  <h1 className="text-sm font-semibold">PLAYGROUND</h1>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {/* Generate Form Card */}
                  <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                    <div className="mb-4 flex items-start items-center space-x-3">
                      <div className="text-gray-400">
                        <FileText className="h-5 w-5" />
                      </div>
                      <h3 className="font-medium">Generate a form</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Based on provided image, there are two input field and a button
                    </p>
                  </div>

                  {/* How to Card */}
                  <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                    <div className="mb-4 flex items-start items-center space-x-3">
                      <div className="text-gray-400">
                        <HelpCircle className="h-5 w-5" />
                      </div>
                      <h3 className="font-medium">How to</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      How do I write a request for a proposal?
                    </p>
                  </div>

                  {/* Generate Idea Card */}
                  <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                    <div className="mb-4 flex items-start items-center space-x-3">
                      <div className="text-gray-400">
                        <Lightbulb className="h-5 w-5" />
                      </div>
                      <h3 className="font-medium">Generate idea</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      List ideas for a fun remote team building event
                    </p>
                  </div>
                </div>
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
