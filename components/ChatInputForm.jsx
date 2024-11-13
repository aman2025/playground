'use client'
import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { chatApi } from '../services/api'
import { useChatStore } from '../store/chatStore'

// ChatInputForm component handles message input and file attachment
export default function ChatInputForm({ chatId }) {
  console.log('ChatInputForm')
  const [input, setInput] = useState('')
  const fileInputRef = useRef()
  const queryClient = useQueryClient()
  const { setCurrentChatId } = useChatStore()

  // Mutation for creating a new chat
  const createChatMutation = useMutation({
    mutationFn: async (title) => {
      const newChat = await chatApi.createChat(title)
      return newChat
    },
    onSuccess: (newChat) => {
      setCurrentChatId(newChat.id)
      window.history.pushState({}, '', `/chat/${newChat.id}`)
      return newChat
    },
  })

  // Mutation for sending a message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ chatId, formData }) => {
      const response = await chatApi.sendMessage(chatId, formData)
      return response
    },
    onMutate: async ({ chatId, formData }) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['messages', chatId] })

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(['messages', chatId])

      // Optimistically update the messages cache
      const optimisticMessage = {
        id: 'temp-' + Date.now(), // Temporary ID
        content: formData.get('content'),
        role: 'user',
        image: formData.get('image') ? URL.createObjectURL(formData.get('image')) : null,
        createdAt: new Date().toISOString(),
        // Add any other required message properties
      }

      queryClient.setQueryData(['messages', chatId], (old) => [...(old || []), optimisticMessage])

      // Return a context object with the snapshot
      return { previousMessages }
    },
    onError: (err, newMessage, context) => {
      // If the mutation fails, roll back to the previous state
      queryClient.setQueryData(['messages', chatId], context.previousMessages)
    },
    onSuccess: (newMessage, { chatId }) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: ['messages', chatId],
        exact: true,
      })
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
        // Wait for chat creation before sending message
        const newChat = await createChatMutation.mutateAsync(input.trim())
        queryClient.invalidateQueries(['chats'])

        // Wait for message to be sent
        await sendMessageMutation.mutateAsync({
          chatId: newChat.id,
          formData,
        })
      } else {
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
