'use client'

// Chat page component that receives the chat ID as a parameter
export default function ChatPage({ params }) {
  // The chatId is available in params.chatId
  return (
    <div className="flex-1 p-4">
      {/* Add your chat interface here */}
      <h1>Chat {params.chatId}</h1>
    </div>
  )
}
