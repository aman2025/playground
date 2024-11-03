// Component to display individual chat messages
export default function ChatMessage({ message }) {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'
        }`}
      >
        {message.imageUrl && (
          <img src={message.imageUrl} alt="Uploaded content" className="mb-2 max-w-sm rounded" />
        )}
        <p>{message.content}</p>
      </div>
    </div>
  )
}
