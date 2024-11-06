'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Paperclip, Send } from 'lucide-react'
import ChatHistory from './ChatHistory'
import UserProfile from './UserProfile'
import ChatInterface from './ChatInterface'
import { useState } from 'react'

// Main Layout component
export default function Layout({ children, session }) {
  const [currentChatId, setCurrentChatId] = useState(null)
  const handleNewChat = (chatId) => {
    setCurrentChatId(chatId)
    // Reset the refs in ChatInterface
    window.history.pushState({}, '', `/chat/${chatId}`)
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#f9fafb' }}>
      {/* Sidebar */}
      <aside className="flex w-60 flex-col" style={{ backgroundColor: '#f9fafb' }}>
        {/* Header */}
        <div className="flex items-center p-4">
          <Image src="/images/logo.png" alt="Playground Logo" width={28} height={28} />
          <span className="ml-2 text-xl font-semibold">Playground</span>
        </div>

        {/* Main sidebar content - History */}
        <ChatHistory currentChatId={currentChatId} onNewChat={handleNewChat} />

        {/* Footer - User profile */}
        <UserProfile session={session} />
      </aside>

      {/* Main content area */}

      <div className="flex h-full justify-center rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-col" style={{ width: '75%' }}>
          <ChatInterface key={currentChatId} chatId={currentChatId} />
        </div>
      </div>
    </div>
  )
}
