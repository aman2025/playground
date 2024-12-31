'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useChatStore } from '@/store/chatStore'
import { chatApi } from '@/services/api'
import { Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns'

// Component to display chat history in sidebar
export default function ChatHistory() {
  const { setCurrentChatId, currentChatId } = useChatStore()

  // Add queryClient for cache management
  const queryClient = useQueryClient()

  // Fetch chats using React Query
  const { data: chats = [], isLoading } = useQuery({
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

  // Add ChatHistorySkeleton component
  const ChatHistorySkeleton = () => (
    <div className="flex flex-col space-y-2 px-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center justify-between">
          <Skeleton className="h-5 w-full rounded-md" />
        </div>
      ))}
    </div>
  )

  // Function to categorize chats by date
  const categorizeChats = (chats) => {
    return chats.reduce(
      (acc, chat) => {
        const createdAt = new Date(chat.createdAt)

        if (isToday(createdAt)) {
          acc.today.push(chat)
        } else if (isYesterday(createdAt)) {
          acc.yesterday.push(chat)
        } else if (isThisWeek(createdAt)) {
          acc.lastWeek.push(chat)
        } else if (isThisMonth(createdAt)) {
          acc.lastMonth.push(chat)
        } else {
          acc.older.push(chat)
        }

        return acc
      },
      {
        today: [],
        yesterday: [],
        lastWeek: [],
        lastMonth: [],
        older: [],
      }
    )
  }

  // Render category section
  const CategorySection = ({ title, chats }) => {
    if (!chats.length) return null

    return (
      <div className="mb-4">
        <h3 className="px-2 pb-1 text-xs text-gray-400">{title}</h3>
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => handleChatClick(chat.id)}
            className={`group mb-1 block flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-1 text-left ${
              currentChatId === chat.id ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
          >
            <span className="block flex-grow truncate text-sm">{chat.title}</span>
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
                className="ml-2 hidden rounded p-0 group-hover:block"
              >
                <Trash2 className="h-3.5 w-3.5 text-gray-500 hover:text-blue-600" />
              </button>
            </ConfirmDialog>
          </div>
        ))}
      </div>
    )
  }

  return (
    <ScrollArea className="chat-history flex-1 px-3" type="always">
      <div className="flex flex-col">
        {isLoading ? (
          <ChatHistorySkeleton />
        ) : (
          <>
            {/* Render categorized chat sections */}
            {(() => {
              const categorized = categorizeChats(chats)
              return (
                <>
                  <CategorySection title="Today" chats={categorized.today} />
                  <CategorySection title="Yesterday" chats={categorized.yesterday} />
                  <CategorySection title="Last 7 days" chats={categorized.lastWeek} />
                  <CategorySection title="Last month" chats={categorized.lastMonth} />
                  <CategorySection title="Older" chats={categorized.older} />
                </>
              )
            })()}
          </>
        )}
      </div>
    </ScrollArea>
  )
}
