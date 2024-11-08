'use client'
import { useEffect } from 'react'
import { useChatStore } from '@/store/chatStore'

// Component to display chat history in sidebar
export default function ChatHistory() {
  const { chats, setChats, setCurrentChatId, currentChatId } = useChatStore()

  // Fetch chats on initial load
  useEffect(() => {
    const fetchChats = async () => {
      const response = await fetch('/api/chats?include_message_count=true')
      const data = await response.json()
      setChats(data)
    }
    fetchChats()
  }, [setChats])

  const handleChatClick = (chatId) => {
    setCurrentChatId(chatId)
    window.history.pushState({}, '', `/chat/${chatId}`)

    // No need to use router.push, just update the state
  }

  return (
    <div className="w-64 bg-gray-800 p-4 text-white">
      <div className="space-y-2">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => handleChatClick(chat.id)}
            className={`block w-full rounded p-2 text-left ${
              currentChatId === chat.id ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
          >
            {chat.title}
          </button>
        ))}
      </div>
    </div>
  )
}
