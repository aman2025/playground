// Component to display individual chat messages with avatars
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import ReactMarkdown from 'react-markdown'

export default function ChatMessage({ message, session }) {
  return (
    <div
      className={`mb-8 flex items-start gap-2 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar container */}
      <div className="flex-shrink-0">
        {message.role === 'user' ? (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-300 text-white">
              {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        ) : (
          <img src="/images/logo.png" alt="Assistant" className="h-8 w-8 rounded-full" />
        )}
      </div>

      {/* Message content */}
      <div
        className={`rounded-[20px] ${message.role === 'user' ? 'max-w-[80%] bg-gray-100 px-4 py-2 ' : 'bg-white px-2'}`}
      >
        {message.imageUrl && (
          <img src={message.imageUrl} alt="Uploaded content" className="mb-2 max-w-sm rounded" />
        )}
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
