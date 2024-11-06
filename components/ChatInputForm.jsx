'use client'
import { useState, useRef } from 'react'

// ChatInputForm component handles message input and file attachment
export default function ChatInputForm({ chatId, onSuccess, isLoading, setIsLoading }) {
  const [input, setInput] = useState('')
  const fileInputRef = useRef()

  // Handle form submission and API call
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() && !fileInputRef.current?.files?.[0]) return
    if (!chatId) return

    const formData = new FormData()
    formData.append('content', input)
    if (fileInputRef.current?.files?.[0]) {
      formData.append('image', fileInputRef.current.files[0])
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/chat/${chatId}/messages`, {
        method: 'POST',
        body: formData,
      })
      const newMessages = await response.json()
      onSuccess(newMessages)
      setInput('')
      fileInputRef.current.value = ''
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
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
  )
}
