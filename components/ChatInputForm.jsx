'use client'
import { useState, useRef, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { chatApi } from '../services/api'
import { useChatStore } from '../store/chatStore'

// ChatInputForm component handles message input and file attachment
export default function ChatInputForm({ chatId }) {
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
      setIsSending(true)

      try {
        const response = await chatApi.sendMessage(chatId, formData)
        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        let fullResponse = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)

          // Process SSE data
          const lines = chunk.split('\n').filter((line) => line.trim())
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonData = JSON.parse(line.slice(6))

                // Update immediately without waiting
                fullResponse += jsonData.content
                queryClient.setQueryData(['messages', chatId], (old) => {
                  const messages = [...(old || [])]
                  const lastMessage = messages[messages.length - 1]

                  if (lastMessage?.role === 'assistant' && lastMessage.id === 'temp-assistant') {
                    // Update existing assistant message
                    return messages.map((msg) =>
                      msg.id === 'temp-assistant' ? { ...msg, content: fullResponse } : msg
                    )
                  } else {
                    // Add new assistant message
                    return [
                      ...messages,
                      {
                        id: 'temp-assistant',
                        content: fullResponse,
                        role: 'assistant',
                        createdAt: new Date().toISOString(),
                      },
                    ]
                  }
                })
              } catch (e) {
                console.error('Error parsing SSE data:', e)
              }
            }
          }
        }
        return fullResponse
      } finally {
        setIsSending(false)
      }
    },
    onError: (err, newMessage, context) => {
      // If the mutation fails, roll back to the previous state
      queryClient.setQueryData(['messages', chatId], context?.previousMessages)
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

    const formData = new FormData()
    formData.append('content', input)
    if (fileInputRef.current?.files?.[0]) {
      formData.append('image', fileInputRef.current.files[0])
    }

    try {
      if (!chatId) {
        const newChat = await createChatMutation.mutateAsync(input.trim())
        queryClient.invalidateQueries({ queryKey: ['chats'] })

        // Don't await this call
        sendMessageMutation.mutate({
          chatId: newChat.id,
          formData,
        })
      } else {
        // Don't await this call
        sendMessageMutation.mutate({ chatId, formData })
      }

      // Clear input immediately after sending
      setInput('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

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
