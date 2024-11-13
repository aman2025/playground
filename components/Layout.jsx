'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useChatStore } from '@/store/chatStore'
import ChatHistory from '@/components/ChatHistory'
import UserProfile from '@/components/UserProfile'
import ChatInterface from '@/components/ChatInterface'

// Main Layout component
export default function Layout({ session }) {
  console.log('layout')
  const { setCurrentChatId } = useChatStore()
  const pathname = usePathname()

  // Handle initial route and refresh, load current chat id from url
  useEffect(() => {
    const match = pathname.match(/\/chat\/(.+)/)
    if (match && match[1]) {
      setCurrentChatId(match[1])
    }
  }, [pathname, setCurrentChatId])

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
        <ChatHistory />

        {/* Footer - User profile */}
        <UserProfile session={session} />
      </aside>

      {/* Main content area */}
      <div className="flex h-full flex-1 justify-center rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-col" style={{ width: '75%' }}>
          <ChatInterface />
        </div>
      </div>
    </div>
  )
}
