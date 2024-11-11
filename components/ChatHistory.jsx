'use client'
import { useQuery } from '@tanstack/react-query'
import { useChatStore } from '@/store/chatStore'
import { chatApi } from '@/services/api'

// Component to display chat history in sidebar
export default function ChatHistory() {
  const { setCurrentChatId, currentChatId } = useChatStore()

  // Fetch chats using React Query
  const { data: chats = [] } = useQuery({
    queryKey: ['chats'],
    queryFn: chatApi.getAllChats,
  })

  const handleChatClick = (chatId) => {
    setCurrentChatId(chatId)
    window.history.pushState({}, '', `/chat/${chatId}`)
  }

  return (
    <div className="">
      <div className="space-y-2">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => handleChatClick(chat.id)}
            className={`block w-full rounded p-2 text-left ${
              currentChatId === chat.id ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
          >
            {chat.title}
          </button>
        ))}
      </div>
    </div>
  )
}
