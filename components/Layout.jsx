import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Paperclip, Send } from 'lucide-react'

// Component for the sidebar history item
const HistoryItem = ({ title }) => (
  <div className="px-4 py-2 hover:bg-gray-700 cursor-pointer">
    {title}
  </div>
)

// Main Layout component
export default function Layout({ children, session }) {
  return (
    <div className="flex h-screen" style={{ backgroundColor: '#f9fafb' }}>
      {/* Sidebar */}
      <aside className="w-60 flex flex-col" style={{ backgroundColor: '#f9fafb' }}>
        {/* Header */}
        <div className="p-4 flex items-center">
          <Image src="/images/logo.png" alt="Playground Logo" width={28} height={28} />
          <span className="ml-2 text-xl font-semibold">Playground</span>
        </div>

        {/* Main sidebar content - History */}
        <div className="flex-grow overflow-y-auto">
          <HistoryItem title="Role form demo" />
          <HistoryItem title="Generate table demo" />
          <HistoryItem title="Who are you?" />
          {/* Add more history items as needed */}
        </div>

        {/* Footer - User profile */}
        <div className="p-4">
          <div className="flex items-center">
            {/* Light blue background circle with the first character of the user's name */}
            <div className="flex items-center justify-center w-9 h-9 bg-blue-300 rounded-full text-white font-bold">
              {session?.user?.name?.charAt(0).toUpperCase() || 'G'}
            </div>
            <span className="ml-2">{session?.user?.name || 'Guest'}</span>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-grow p-3">
        <div className="bg-white rounded-lg border border-gray-200 h-full flex justify-center">
          <div className="flex flex-col" style={{ width: '75%' }}>
            {/* Content */}
            <div className="flex-grow overflow-y-auto p-6">
              {children}
            </div>

            {/* Chat input */}
            <div className="p-4">
              <div 
                className="flex items-center border border-gray-300 p-1 pl-3"
                style={{ borderRadius: '16px' }} // Set border radius to 12px
              >
                {/* Attachment icon on the left using Lucide's Paperclip icon */}
                <Paperclip
                  size={24} // Set the size of the icon
                  className="mr-2 cursor-pointer"
                />
                {/* Input element in the middle with no border */}
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-grow px-4 py-2 focus:outline-none border-none"
                  style={{ fontSize: '16px' }}
                />
                {/* Send button on the right with plane icon using Lucide's Send icon */}
                <Button 
                  className="rounded bg-white hover:bg-gray-200 border-none" // Set default and hover background colors
                  style={{ borderRadius: '8px' }} // Set border radius
                >
                  <Send
                    size={24} // Set the size of the icon
                    className="text-blue-500"
                  />
                </Button>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  )
}
