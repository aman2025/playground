'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

// Component to display chat history in sidebar
export default function ChatHistory({ currentChatId, onNewChat }) {
  const [chats, setChats] = useState([])

  useEffect(() => {
    // Fetch chat history with message counts
    const fetchChats = async () => {
      const response = await fetch('/api/chats?include_message_count=true')
      const data = await response.json()
      setChats(data)
    }
    fetchChats()
  }, [currentChatId])

  const handleNewChat = async () => {
    try {
      // Check for existing empty chat
      const emptyChat = chats.find((chat) => chat.messageCount === 0)
      if (emptyChat) {
        // Use existing empty chat instead of creating new one
        if (onNewChat) {
          onNewChat(emptyChat.id)
        }
        return
      }

      // Create new chat if no empty chat exists
      const response = await fetch('/api/chats', {
        method: 'POST',
      })
      const newChat = await response.json()
      setChats((prev) => [newChat, ...prev])
      if (onNewChat) {
        onNewChat(newChat.id)
      }
    } catch (error) {
      console.error('Error creating new chat:', error)
    }
  }

  return (
    <div className="w-64 bg-gray-800 p-4 text-white">
      <button onClick={handleNewChat} className="mb-4 w-full rounded bg-gray-700 p-2">
        New Chat
      </button>
      <div className="space-y-2">
        {chats.map((chat) => (
          <Link
            key={chat.id}
            href={`/chat/${chat.id}`}
            className={`block rounded p-2 ${
              currentChatId === chat.id ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
          >
            {chat.title}
          </Link>
        ))}
      </div>
    </div>
  )
}
