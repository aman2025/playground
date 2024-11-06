'use client'
import { useState, useEffect } from 'react'
import ChatMessage from './ChatMessage'
import ChatInputForm from './ChatInputForm'

export default function ChatInterface({ chatId }) {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadMessages = async () => {
      if (!chatId) return

      try {
        const response = await fetch(`/api/chat/${chatId}/messages`)
        if (response.ok) {
          const data = await response.json()
          setMessages(data)
        }
      } catch (error) {
        console.error('Error loading messages:', error)
      }
    }

    loadMessages()
  }, [chatId])

  const handleSuccess = (newMessages) => {
    setMessages((prev) => [...prev, ...newMessages])
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
        chatId={chatId}
        onSuccess={handleSuccess}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
    </div>
  )
}
