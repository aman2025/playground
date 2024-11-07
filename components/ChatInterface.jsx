'use client'
import { useEffect, useState } from 'react'
import ChatMessage from './ChatMessage'
import ChatInputForm from './ChatInputForm'
import { useChatStore } from '../store/chatStore'

export default function ChatInterface() {
  const { messages, setMessages, currentChatId } = useChatStore()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    console.log('Messages updated:', messages)
  }, [messages])

  useEffect(() => {
    const loadMessages = async () => {
      if (!currentChatId) {
        console.warn('No currentChatId set, cannot load messages')
        return
      }

      try {
        const response = await fetch(`/api/chat/${currentChatId}/messages`)
        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data) && data.length > 0) {
            console.log('Loaded messages from API:', data)
            setMessages(data)
          } else {
            console.warn('Received empty or invalid messages array:', data)
          }
        } else {
          console.error('Failed to fetch messages, response not ok:', response.status)
        }
      } catch (error) {
        console.error('Error loading messages:', error)
      }
    }

    loadMessages()
  }, [currentChatId, setMessages])

  const handleNewMessage = (newMessage) => {
    console.log('New message received:', newMessage)
    setMessages((prevMessages) => {
      const currentMessages = Array.isArray(prevMessages) ? prevMessages : []
      return [...currentMessages, newMessage]
    })
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-400">Playground</div>
        ) : (
          messages.map((message) => <ChatMessage key={message.id} message={message} />)
        )}
      </div>
      <ChatInputForm
        chatId={currentChatId}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        onMessageSent={handleNewMessage}
      />
    </div>
  )
}
