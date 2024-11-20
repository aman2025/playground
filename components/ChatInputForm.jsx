'use client'
import { useState, useRef, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { chatApi } from '../services/api'
import { useChatStore } from '../store/chatStore'
import { Send, Square } from 'lucide-react'

// ChatInputForm component handles message input and file attachment
export default function ChatInputForm({ chatId }) {
  const [input, setInput] = useState('')
  const fileInputRef = useRef()
  const queryClient = useQueryClient()
  const { setCurrentChatId, setIsSending } = useChatStore()
  const [isCancelling, setIsCancelling] = useState(false)

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
      }
      // add user message
      queryClient.setQueryData(['messages', chatId], (old) => [...(old || []), optimisticMessage])

      // Return a context object with the snapshot
      return { previousMessages }
    },
    onError: (err, newMessage, context) => {
      // todo: not previousMessages data
      // Snapshot the previous value
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
        try {
          // Create chat and wait for it to complete
          const newChat = await createChatMutation.mutateAsync(input.trim())
          await queryClient.invalidateQueries({ queryKey: ['chats'] })

          // Now that we have the chat, wait for the message mutation
          await sendMessageMutation.mutateAsync({
            chatId: newChat.id,
            formData,
          })
        } catch (error) {
          console.error('Error creating chat and sending message:', error)
        }
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

  // Update the cancel handler
  const handleCancelStream = async () => {
    if (!chatId || isCancelling) return

    try {
      setIsCancelling(true)
      const response = await chatApi.pauseMessage(chatId)

      if (response.error === 'No active stream found') {
        // If no stream is found, just reset the UI state
        console.log('No active stream found, resetting state')
        setIsSending(false)
      }

      // Invalidate the messages query to ensure UI is updated
      queryClient.invalidateQueries({
        queryKey: ['messages', chatId],
        exact: true,
      })
    } catch (error) {
      console.error('Error cancelling stream:', error)
    } finally {
      setIsCancelling(false)
      setIsSending(false)
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
            />
            <button
              type="button"
              onClick={handleCancelStream}
              disabled={isCancelling}
              className={`rounded-[8px] px-3 py-2 text-white ${
                createChatMutation.isPending || sendMessageMutation.isPending
                  ? 'cursor-pointer bg-blue-300'
                  : 'bg-blue-500 hover:bg-blue-600'
              } ${isCancelling ? 'opacity-50' : ''}`}
            >
              {(createChatMutation.isPending || sendMessageMutation.isPending) && !isCancelling ? (
                <Square className="h-5 w-5" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
