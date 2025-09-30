'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useChatStore } from '@/store/chatStore'
import ChatHistory from '@/components/ChatHistory'
import UserProfile from '@/components/UserProfile'
import ChatInputForm from '@/components/ChatInputForm'
import ChatInterface from '@/components/ChatInterface'
import CodeViewer from '@/components/CodeViewer'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'

// Main Layout component
export default function Layout({ session }) {
  const { setCurrentChatId, currentChatId, setContextWindow } = useChatStore()
  const pathname = usePathname()

  // Handle initial route and refresh, load current chat id from url
  useEffect(() => {
    const match = pathname.match(/\/chat\/(.+)/)
    if (match && match[1]) {
      setCurrentChatId(match[1])
    }
  }, [pathname, setCurrentChatId])

  const router = useRouter()

  const handleNewChat = () => {
    setCurrentChatId(null)
    setContextWindow([])
    router.push('/chat')
  }

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
        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-blue-500 p-1 text-sm text-blue-500 hover:border-blue-600 hover:text-blue-600"
          >
            <Plus size={16} className="hover:text-blue-600" />
            New Chat
          </button>
        </div>

        {/* Chat History Section */}
        <ChatHistory />

        {/* Footer - User profile */}
        <UserProfile session={session} />
      </aside>

      {/* Main Chat Area */}
      <main className="flex h-full w-1 flex-1 flex-col p-2 pl-0">
        <div
          className="flex h-full w-full flex-col overflow-hidden rounded-[8px] bg-white"
          style={{ border: '1px solid var(--border-color-base)' }}
        >
          <ChatInterface session={session} />
          <ChatInputForm chatId={currentChatId} />
        </div>
      </main>
      
      {/* Code Viewer Modal */}
      <CodeViewer />
    </div>
  )
}
