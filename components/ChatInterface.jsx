'use client'
import { useState, useRef, useEffect } from 'react'
import ChatMessage from './ChatMessage'

export default function ChatInterface({ initialChatId }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatId, setChatId] = useState(initialChatId)
  const fileInputRef = useRef()

  const chatInitializedRef = useRef(false)
  const messagesLoadedRef = useRef(false)

  useEffect(() => {
    const initializeChat = async () => {
      if (chatInitializedRef.current || chatId) return
      chatInitializedRef.current = true

      try {
        const getResponse = await fetch('/api/chats')
        const chats = await getResponse.json()

        for (const chat of chats) {
          console.log('chatid:', chat.id)
          const messagesResponse = await fetch(`/api/chat/${chat.id}/messages`)
          const messages = await messagesResponse.json()
          if (messages.length === 0) {
            setChatId(chat.id)
            window.history.pushState({}, '', `/chat/${chat.id}`)
            return
          }
        }
        const response = await fetch('/api/chats', {
          method: 'POST',
        })
        const newChat = await response.json()
        setChatId(newChat.id)
        window.history.pushState({}, '', `/chat/${newChat.id}`)
      } catch (error) {
        console.error('Error creating initial chat:', error)
      }
    }

    initializeChat()
  }, [chatId])

  useEffect(() => {
    const loadMessages = async () => {
      if (messagesLoadedRef.current || !chatId) return

      try {
        const response = await fetch(`/api/chat/${chatId}/messages`)
        if (response.ok) {
          const data = await response.json()
          setMessages(data)
          messagesLoadedRef.current = true
        }
      } catch (error) {
        console.error('Error loading messages:', error)
      }
    }

    loadMessages()
  }, [chatId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() && !fileInputRef.current?.files?.[0]) return
    if (!chatId) return

    setIsLoading(true)
    const formData = new FormData()
    formData.append('content', input)
    if (fileInputRef.current?.files?.[0]) {
      formData.append('image', fileInputRef.current.files[0])
    }

    try {
      const response = await fetch(`/api/chat/${chatId}/messages`, {
        method: 'POST',
        body: formData,
      })
      const newMessages = await response.json()
      setMessages((prev) => [...prev, ...newMessages])
      setInput('')
      fileInputRef.current.value = ''
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <input type="file" ref={fileInputRef} accept="image/*" className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded bg-gray-200 p-2"
          >
            📎
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded border p-2"
            placeholder="Type a message..."
            disabled={isLoading}
          />
          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 text-white"
            disabled={isLoading}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
