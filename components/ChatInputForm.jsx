'use client'
import { useState, useRef, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { chatApi } from '../services/api'
import { useChatStore } from '../store/chatStore'
import { ImageIcon, SendIcon, X, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// ChatInputForm component handles message input and file attachment
export default function ChatInputForm({ chatId }) {
  const [input, setInput] = useState('')
  const fileInputRef = useRef()
  const queryClient = useQueryClient()
  const { setCurrentChatId, setIsSending, scrollToBottom } = useChatStore()
  const [isCancelling, setIsCancelling] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const textareaRef = useRef(null)

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

      // Scroll to bottom after sending message, scrollToBottom is function from chat store
      scrollToBottom?.()

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

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Create preview URL for the image
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
    }
  }

  // Handle removing the image
  const handleRemoveImage = () => {
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Add this useEffect for auto-resizing
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto'
    // Calculate new height (limit to 6 rows worth of height)
    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight)
    const maxHeight = lineHeight * 6
    const newHeight = Math.min(textarea.scrollHeight, maxHeight)
    textarea.style.height = `${newHeight}px`
  }, [input]) // Re-run when input changes

  // Add this handler function near your other handlers
  const handleKeyDown = (e) => {
    // Send message on Enter, but allow Shift+Enter for new lines
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault() // Prevent default to avoid new line
      if (input.trim()) {
        // Only send if input is not empty
        handleSubmit(e)
      }
    }
  }

  return (
    <div className="flex justify-center p-3">
      <div
        className="relative flex w-full max-w-screen-md flex-col rounded-[20px] border border-gray-200 bg-white p-2"
        style={{ boxShadow: '0px 0px 8px 0px rgba(0, 0, 0, 0.06)' }}
      >
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {/* Image preview area */}
        {imagePreview && (
          <div className="relative mb-2">
            <div className="relative inline-block">
              <img src={imagePreview} alt="Preview" className="max-h-32 rounded-lg object-cover" />
              <Button
                variant="ghost"
                size="icon"
                className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-gray-800/50 p-0.5 text-white hover:bg-gray-900/50"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Main input area */}
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder="Type a message..."
          className="w-full resize-none overflow-y-auto bg-transparent px-2 py-2 text-sm focus:outline-none focus:ring-0"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ maxHeight: '9rem' }}
        />

        {/* Bottom controls area */}
        <div className="flex items-center justify-between pt-2">
          {/* Image upload button with tooltip */}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-[10px] text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Upload image</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Send button */}
          <Button
            size="icon"
            disabled={
              !input.trim() && !createChatMutation.isPending && !sendMessageMutation.isPending
            }
            className={`h-8 w-8 rounded-[10px] ${
              !input.trim() && !createChatMutation.isPending && !sendMessageMutation.isPending
                ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
            onClick={
              createChatMutation.isPending || sendMessageMutation.isPending
                ? handleCancelStream
                : handleSubmit
            }
          >
            {(createChatMutation.isPending || sendMessageMutation.isPending) && !isCancelling ? (
              <Square className="h-5 w-5" />
            ) : (
              <SendIcon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
