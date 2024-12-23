// Component to display individual chat messages with avatars
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import ReactMarkdown from 'react-markdown'
import { useEffect, useRef, useState } from 'react'
import mediumZoom from 'medium-zoom'
import { Copy, CheckCheck } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism' // You can choose different themes

// Enhanced CodeBlock component with syntax highlighting
const CodeBlock = ({ children, className }) => {
  const [copied, setCopied] = useState(false)

  // Extract language from className (format: language-javascript)
  const language = className ? className.replace('language-', '') : 'text'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 z-10 rounded bg-gray-800 p-1 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100"
      >
        {copied ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
      <SyntaxHighlighter
        language={language}
        style={{
          ...oneDark,
          'pre[class*="language-"]': {
            ...oneDark['pre[class*="language-"]'],
            background: '#1e1e1e',
            margin: 0,
            fontSize: '1em',
          },
          'code[class*="language-"]': {
            ...oneDark['code[class*="language-"]'],
            background: 'none',
            fontSize: '1em',
          },
        }}
        customStyle={{
          margin: 0,
          borderRadius: '0.375rem',
          fontSize: '1em',
        }}
        showLineNumbers={false}
        wrapLines={true}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  )
}

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
          message.role === 'user'
            ? 'max-w-[80%] bg-gray-100 px-4 py-2'
            : `max-w-[91%] bg-white px-2`
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
          <ReactMarkdown
            components={{
              code: ({ node, inline, className, children, ...props }) => {
                // Handle inline code differently
                if (inline) {
                  return (
                    <code className="rounded bg-gray-200 px-1 py-0.5 text-sm" {...props}>
                      {children}
                    </code>
                  )
                }
                return <CodeBlock className={className}>{children}</CodeBlock>
              },
            }}
          >
            {displayContent}
          </ReactMarkdown>
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
