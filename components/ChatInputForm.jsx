'use client'
import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { chatApi } from '../services/api'
import { useChatStore } from '../store/chatStore'

// ChatInputForm component handles message input and file attachment
export default function ChatInputForm({ chatId }) {
  const [input, setInput] = useState('')
  const fileInputRef = useRef()
  const queryClient = useQueryClient()
  const { addChat, setCurrentChatId, addMessage } = useChatStore()

  // Mutation for creating a new chat
  const createChatMutation = useMutation({
    mutationFn: async (title) => {
      const newChat = await chatApi.createChat(title)
      return newChat
    },
    onSuccess: (newChat) => {
      addChat(newChat)
      setCurrentChatId(newChat.id)
      window.history.pushState({}, '', `/chat/${newChat.id}`)
      queryClient.invalidateQueries(['chats'])
      return newChat
    },
  })

  // Mutation for sending a message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ chatId, formData }) => {
      const response = await chatApi.sendMessage(chatId, formData)
      return response
    },
    onSuccess: (newMessage) => {
      // Add message to store
      addMessage(newMessage[0])
      // Invalidate messages query for this chat
      queryClient.invalidateQueries(['messages', chatId])
    },
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    try {
      const formData = new FormData()
      formData.append('content', input)
      if (fileInputRef.current?.files?.[0]) {
        formData.append('image', fileInputRef.current.files[0])
      }

      if (!chatId) {
        // Create new chat first, then send the message
        const newChat = await createChatMutation.mutateAsync(input.trim())

        // Create a message object for the store
        const messageContent = {
          content: formData.get('content'),
          role: 'user',
          chatId: newChat.id,
        }
        // Add optimistic update
        addMessage(messageContent)

        // Send the first message using the new chat ID
        await sendMessageMutation.mutateAsync({
          chatId: newChat.id,
          formData,
        })
      } else {
        // Create a message object for the store
        const messageContent = {
          content: formData.get('content'),
          role: 'user',
          chatId: chatId,
        }
        // Add optimistic update
        addMessage(messageContent)

        // Send message
        await sendMessageMutation.mutateAsync({ chatId, formData })
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setInput('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Loading state is now derived from mutations
  const isMutating = createChatMutation.isPending || sendMessageMutation.isPending

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
            disabled={isMutating}
          />
          <button
            type="submit"
            className={`rounded px-4 py-2 text-white ${
              isMutating ? 'cursor-not-allowed bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
            }`}
            disabled={isMutating || !input.trim()}
          >
            {isMutating ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </form>
  )
}
