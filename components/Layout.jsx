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
    <div className="flex h-full" style={{ backgroundColor: 'var(--global-bg)' }}>
      {/* Sidebar */}
      <aside
        className="flex w-64 flex-col border-gray-200 bg-white"
        style={{ backgroundColor: 'var(--global-bg)' }}
      >
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
      <main className="flex h-full w-1 flex-1 flex-col p-2 pl-0">
        <div
          className="flex h-full w-full flex-col overflow-hidden rounded-[8px] bg-white"
          style={{ border: '1px solid var(--border-color-base)' }}
        >
          <ChatInterface />
          <ChatInputForm chatId={currentChatId} />
        </div>
      </main>
    </div>
  )
}
