'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useChatStore } from '@/store/chatStore'
import { chatApi } from '@/services/api'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useState } from 'react'

// Component to display chat history in sidebar
export default function ChatHistory() {
  console.log('ChatHistory')
  const { setCurrentChatId, currentChatId } = useChatStore()

  // Add queryClient for cache management
  const queryClient = useQueryClient()

  // Fetch chats using React Query
  const { data: chats = [] } = useQuery({
    queryKey: ['chats'],
    queryFn: chatApi.getAllChats,
  })

  // Add delete mutation
  const deleteMutation = useMutation({
    mutationFn: chatApi.deleteChat,
    onMutate: (deletedChatId) => {
      return { deletedChatId }
    },
    onSuccess: (_, __, context) => {
      const { deletedChatId } = context
      queryClient.invalidateQueries({ queryKey: ['chats'] })

      // If deleted chat was current, switch to next available chat
      if (currentChatId === deletedChatId) {
        const nextChat = chats.find((chat) => chat.id !== deletedChatId)
        if (nextChat) {
          setCurrentChatId(nextChat.id)
          window.history.pushState({}, '', `/chat/${nextChat.id}`)
        } else {
          setCurrentChatId(null)
          window.history.pushState({}, '', '/chat')
        }
      }
    },
  })

  // Add state for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [chatToDelete, setChatToDelete] = useState(null)

  const handleDelete = (e, chatId) => {
    e.stopPropagation() // Prevent chat selection when clicking delete
    setChatToDelete(chatId)
    setDeleteDialogOpen(true)
  }

  // Handle confirm delete action
  const handleConfirmDelete = async () => {
    if (chatToDelete) {
      await deleteMutation.mutate(chatToDelete)
    }
  }

  const handleChatClick = (chatId) => {
    setCurrentChatId(chatId)
    window.history.pushState({}, '', `/chat/${chatId}`)
  }

  const router = useRouter()

  const handleNewChat = () => {
    setCurrentChatId(null)
    router.push('/chat')
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleNewChat}
        className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        New Chat
      </button>

      <div className="space-y-2">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => handleChatClick(chat.id)}
            className={`block flex w-full cursor-pointer items-center justify-between rounded p-2 text-left ${
              currentChatId === chat.id ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
          >
            <span>{chat.title}</span>
            <ConfirmDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
              title="Delete Chat"
              description="Are you sure you want to delete this chat? This action cannot be undone."
              onConfirm={handleConfirmDelete}
              confirmText="Delete"
              confirmVariant="destructive"
            >
              <button
                onClick={(e) => handleDelete(e, chat.id)}
                className="rounded p-1 hover:bg-gray-300"
              >
                <Trash2 className="h-4 w-4 text-gray-500" />
              </button>
            </ConfirmDialog>
          </div>
        ))}
      </div>
    </div>
  )
}
