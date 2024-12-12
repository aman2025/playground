'use client'
import { useState, useRef, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { chatApi } from '../services/api'
import { useChatStore } from '../store/chatStore'
import { ImageIcon, SendIcon, X, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import mediumZoom from 'medium-zoom'

// ChatInputForm component handles message input and file attachment
export default function ChatInputForm({ chatId }) {
  const [input, setInput] = useState('')
  const fileInputRef = useRef()
  const queryClient = useQueryClient()
  const { setCurrentChatId, setIsSending, scrollToBottom } = useChatStore()
  const [isCancelling, setIsCancelling] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const textareaRef = useRef(null)
  const previewZoomRef = useRef(null)

  // Add this helper function at the top of the component
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

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

      // Get just the user's message without context
      const userMessage = formData.get('content')
      const actualUserMessage = userMessage.split('\n\nUser: ').pop() || userMessage

      // Convert image to base64 if present
      let base64Image = null
      const imageFile = formData.get('image')
      if (imageFile) {
        base64Image = await fileToBase64(imageFile)
      }
      // Update optimistic message to show only the actual user message
      const optimisticMessage = {
        id: 'temp-' + Date.now(),
        content: actualUserMessage,
        role: 'user',
        imageUrl: base64Image, // Use base64 image instead of URL.createObjectURL
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

    // Combine context window with current input
    const contextWindow = useChatStore.getState().contextWindow
    const contextPrompt = contextWindow.map((msg) => `${msg.role}: ${msg.content}`).join('\n')
    const fullPrompt = contextWindow.length
      ? `Previous context:\n${contextPrompt}\n\nUser: ${input}`
      : input

    formData.append('content', fullPrompt)
    if (fileInputRef.current?.files?.[0]) {
      formData.append('image', fileInputRef.current.files[0])
    }

    try {
      const currentInput = input
      setInput('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      setImagePreview(null)

      if (!chatId) {
        // Reset context window for new chat
        useChatStore.setState({ contextWindow: [] })

        try {
          const newChat = await createChatMutation.mutateAsync(currentInput.trim())
          await queryClient.invalidateQueries({ queryKey: ['chats'] })

          await sendMessageMutation.mutateAsync({
            chatId: newChat.id,
            formData,
          })
        } catch (error) {
          console.error('Error creating chat and sending message:', error)
        }
      } else {
        sendMessageMutation.mutate({ chatId, formData })
      }

      scrollToBottom?.()
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
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
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

  // Add a new handler function for paste events
  const handlePaste = async (e) => {
    // Get clipboard items
    const items = e.clipboardData?.items

    if (!items) return

    // Look for image items in clipboard
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        // Prevent default paste behavior
        e.preventDefault()

        // Get the image file from clipboard
        const file = item.getAsFile()
        if (!file) continue

        // Create preview URL for the image
        const previewUrl = URL.createObjectURL(file)
        setImagePreview(previewUrl)

        // Set the file in the file input
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        if (fileInputRef.current) {
          fileInputRef.current.files = dataTransfer.files
        }

        break
      }
    }
  }

  // Add this useEffect for cleanup
  useEffect(() => {
    return () => {
      // Cleanup preview URL when component unmounts
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  // Add useEffect for zoom functionality
  useEffect(() => {
    if (previewZoomRef.current) {
      const zoom = mediumZoom(previewZoomRef.current, {
        margin: 24,
        background: 'rgba(0, 0, 0, 0.5)',
        scrollOffset: 0,
      })

      // Keep the original image visible
      zoom.on('open', () => {
        if (previewZoomRef.current) {
          previewZoomRef.current.style.visibility = 'visible'
        }
      })

      return () => {
        zoom.detach()
      }
    }
  }, [imagePreview]) // Re-run when imagePreview changes

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
              <div className="mb-2 h-20 w-32 overflow-hidden rounded border border-gray-200 bg-white">
                <img
                  ref={previewZoomRef}
                  src={imagePreview}
                  alt="Preview"
                  className="h-full w-full cursor-zoom-in object-cover"
                />
              </div>
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
          onPaste={handlePaste}
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
