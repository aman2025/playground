// Component to display individual chat messages with avatars
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import ReactMarkdown from 'react-markdown'
import { useEffect, useRef } from 'react'
import mediumZoom from 'medium-zoom'

export default function ChatMessage({ message, session }) {
  const zoomRef = useRef(null)

  useEffect(() => {
    if (zoomRef.current) {
      const zoom = mediumZoom(zoomRef.current, {
        margin: 24,
        background: 'rgba(0, 0, 0, 0.5)',
        scrollOffset: 0,
      })

      // Keep the original image visible
      zoom.on('open', () => {
        if (zoomRef.current) {
          zoomRef.current.style.visibility = 'visible'
        }
      })

      return () => {
        zoom.detach()
      }
    }
  }, [message.imageUrl])

  // Check if message was paused by looking for the [paused] marker
  const isPaused = message.content.endsWith('[paused]')

  // Remove the [paused] marker from displayed content
  const displayContent = isPaused ? message.content.replace('[paused]', '') : message.content

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
          <img src="/images/assistant.png" alt="Assistant" className="h-8 w-8 rounded-full" />
        )}
      </div>

      {/* Message content */}
      <div
        className={`group relative rounded-[20px] ${
          message.role === 'user' ? 'max-w-[80%] bg-gray-100 px-4 py-2' : `bg-white px-2`
        }`}
      >
        {message.imageUrl && (
          <div className="mb-2 h-20 w-32 overflow-hidden rounded border border-gray-200 bg-white">
            <img
              ref={zoomRef}
              src={message.imageUrl}
              alt="Uploaded content"
              className="h-full w-full cursor-zoom-in object-contain"
            />
          </div>
        )}
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{displayContent}</ReactMarkdown>
        </div>
        {/* Timestamp positioned absolutely with conditional alignment */}
        <div
          className={`absolute bottom-0 translate-y-full pt-1 text-xs text-gray-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${
            message.role === 'user' ? 'right-2' : 'left-0'
          }`}
        >
          {message.createdAt
            ? (() => {
                const messageDate = new Date(message.createdAt)
                const today = new Date()
                const isToday = messageDate.toDateString() === today.toDateString()

                if (isToday) {
                  return messageDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })
                }

                return messageDate.toLocaleString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                })
              })()
            : ''}
        </div>
      </div>
    </div>
  )
}
