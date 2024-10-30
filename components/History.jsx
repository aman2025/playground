import React from 'react'
import HistoryItem from './HistoryItem' // Import the HistoryItem component

// Component for the sidebar history list
const History = () => (
  <div className="flex-grow overflow-y-auto">
    <HistoryItem title="Role form demo" />
    <HistoryItem title="Generate table demo" />
    <HistoryItem title="Who are you?" />
    {/* Add more history items as needed */}
  </div>
)

export default History
