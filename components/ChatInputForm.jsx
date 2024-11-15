'use client'
import { useState, useRef, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { chatApi } from '../services/api'
import { useChatStore } from '../store/chatStore'

// ChatInputForm component handles message input and file attachment
export default function ChatInputForm({ chatId }) {
  console.log('ChatInputForm')
  const [input, setInput] = useState('')
  const fileInputRef = useRef()
  const queryClient = useQueryClient()
  const { setCurrentChatId, setIsSending } = useChatStore()

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
        // Invalidate chats query, update the chat list
        queryClient.invalidateQueries({ queryKey: ['chats'] })

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

  // Update useEffect to use store
  useEffect(() => {
    const isSending = createChatMutation.isPending || sendMessageMutation.isPending
    setIsSending(isSending)
  }, [createChatMutation.isPending, sendMessageMutation.isPending, setIsSending])

  return (
    <div className="flex justify-center bg-white">
      <form onSubmit={handleSubmit} className="flex w-full max-w-screen-md bg-gray-100 pb-4 pt-4">
        <div className="flex w-full flex-col gap-2">
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
              disabled={createChatMutation.isPending || sendMessageMutation.isPending}
            />
            <button
              type="submit"
              className={`rounded px-4 py-2 text-white ${
                createChatMutation.isPending || sendMessageMutation.isPending
                  ? 'cursor-not-allowed bg-blue-300'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
              disabled={
                createChatMutation.isPending || sendMessageMutation.isPending || !input.trim()
              }
            >
              {createChatMutation.isPending || sendMessageMutation.isPending
                ? 'Sending...'
                : 'Send'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
