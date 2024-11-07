'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

// ChatInputForm component handles message input and file attachment
export default function ChatInputForm({ chatId, onSuccess, isLoading, setIsLoading }) {
  const [input, setInput] = useState('')
  const fileInputRef = useRef()
  const router = useRouter()

  // Handle form submission and API call
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    setIsLoading(true)
    try {
      if (!chatId) {
        // Create new chat using the input text as title
        const createChatResponse = await fetch('/api/chats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: input.trim() }),
        })
        const newChat = await createChatResponse.json()

        // Create the first message
        const formData = new FormData()
        formData.append('content', input)
        if (fileInputRef.current?.files?.[0]) {
          formData.append('image', fileInputRef.current.files[0])
        }

        const messageResponse = await fetch(`/api/chat/${newChat.id}/messages`, {
          method: 'POST',
          body: formData,
        })
        const newMessages = await messageResponse.json()

        // Update UI and redirect
        onSuccess(newMessages, newChat.id)
        window.history.pushState({}, '', `/chat/${newChat.id}`)
        // Dispatch custom event with new chat data
        window.dispatchEvent(new CustomEvent('newChat', { detail: newChat }))
      } else {
        // Just send message for existing chat
        const formData = new FormData()
        formData.append('content', input)
        if (fileInputRef.current?.files?.[0]) {
          formData.append('image', fileInputRef.current.files[0])
        }

        const response = await fetch(`/api/chat/${chatId}/messages`, {
          method: 'POST',
          body: formData,
        })
        const newMessages = await response.json()
        onSuccess(newMessages)
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
