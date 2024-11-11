'use client'
import { useState, useRef } from 'react'
import { useChatStore } from '../store/chatStore'

// ChatInputForm component handles message input and file attachment
export default function ChatInputForm({ chatId, isLoading, setIsLoading }) {
  const [input, setInput] = useState('')
  const fileInputRef = useRef()
  const { addChat, setCurrentChatId, addMessage } = useChatStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('content', input)
      if (fileInputRef.current?.files?.[0]) {
        formData.append('image', fileInputRef.current.files[0])
      }

      let response
      if (!chatId) {
        // Create new chat
        const createChatResponse = await fetch('/api/chats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: input.trim() }),
        })
        const newChat = await createChatResponse.json()
        // Send the first message
        response = await fetch(`/api/chat/${newChat.id}/messages`, {
          method: 'POST',
          body: formData,
        })
        // 等创建chat和message成功后，再更新store
        if (response.ok) {
          addChat(newChat)
          setCurrentChatId(newChat.id)
          window.history.pushState({}, '', `/chat/${newChat.id}`)
        }
      } else {
        // Create a message object from formData
        const messageContent = {
          content: formData.get('content'),
          role: 'user',
          chatId: chatId,
          // Add any other required message properties
        }
        // Add message to store with proper object format
        addMessage(messageContent)

        // Send message to existing chat
        response = await fetch(`/api/chat/${chatId}/messages`, {
          method: 'POST',
          body: formData,
        })
        const newMessage = await response.json()
        // Update messages in the store with the server response
        addMessage(newMessage[0])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
      setInput('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t p-4">
      <div className="flex flex-col gap-2">
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
            className={`rounded px-4 py-2 text-white ${
              isLoading ? 'cursor-not-allowed bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
            }`}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </form>
  )
}
