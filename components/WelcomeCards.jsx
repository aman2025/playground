import { FileText, HelpCircle, Lightbulb } from 'lucide-react'
import { useChatStore } from '../store/chatStore'

// Card data for easy maintenance and updates
const cards = [
  {
    icon: FileText,
    title: 'Generate a form',
    description: 'Based on provided image, there are two input field and a button',
  },
  {
    icon: HelpCircle,
    title: 'How to',
    description: 'How do I write a request for a proposal?',
  },
  {
    icon: Lightbulb,
    title: 'Generate idea',
    description: 'List ideas for a fun remote team building event',
  },
]

// Individual card component for better organization
const Card = ({ icon: Icon, title, description, onClick }) => (
  <div
    className="cursor-pointer rounded-lg border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    onClick={onClick}
  >
    <div className="mb-4 flex items-start items-center space-x-3">
      <div className="text-gray-400">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-medium">{title}</h3>
    </div>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
)

export default function WelcomeCards() {
  const { submitMessage } = useChatStore()

  // Handle card click
  const handleCardClick = (description) => {
    submitMessage(description)
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {cards.map((card, index) => (
        <Card key={index} {...card} onClick={() => handleCardClick(card.description)} />
      ))}
    </div>
  )
}
