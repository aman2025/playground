'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useChatStore } from '@/store/chatStore'
import ChatHistory from '@/components/ChatHistory'
import UserProfile from '@/components/UserProfile'
import ChatInputForm from '@/components/ChatInputForm'
import ChatInterface from '@/components/ChatInterface'

// Main Layout component
export default function Layout({ session }) {
  const { setCurrentChatId, currentChatId } = useChatStore()
  const pathname = usePathname()

  // Handle initial route and refresh, load current chat id from url
  useEffect(() => {
    const match = pathname.match(/\/chat\/(.+)/)
    if (match && match[1]) {
      setCurrentChatId(match[1])
    }
  }, [pathname, setCurrentChatId])

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
        {/* Header */}
        <div className="flex items-center p-4">
          <Image src="/images/logo.png" alt="Playground Logo" width={28} height={28} />
          <span className="ml-2 text-xl font-semibold">Playground</span>
        </div>

        {/* Chat History Section */}
        <div className="flex-1 overflow-y-auto">
          <ChatHistory />
        </div>

        {/* Footer - User profile */}
        <UserProfile session={session} />
      </aside>

      {/* Main Chat Area */}
      <main className="flex flex-1 flex-col">
        <ChatInterface />
        <ChatInputForm chatId={currentChatId} />
      </main>
    </div>
  )
}
