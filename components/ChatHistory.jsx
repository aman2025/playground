'use client'
import { useEffect } from 'react'
import { useChatStore } from '@/store/chatStore'

// Component to display chat history in sidebar
export default function ChatHistory() {
  const { chats, setChats, setCurrentChatId, currentChatId } = useChatStore()

  // Fetch chats on initial load
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch('/api/chats?include_message_count=true')
        if (!response.ok) {
          throw new Error('Failed to fetch chats')
        }
        const data = await response.json()
        setChats(data)
      } catch (error) {
        console.error('Error fetching chats:', error)
        // Set empty array to prevent map errors
        setChats([])
      }
    }
    fetchChats()
  }, [setChats])

  const handleChatClick = (chatId) => {
    setCurrentChatId(chatId)
    window.history.pushState({}, '', `/chat/${chatId}`)

    // No need to use router.push, just update the state
  }

  return (
    <div className="">
      <div className="space-y-2">
        {/* Add null check before mapping */}
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
