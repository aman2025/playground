import React from 'react';

// Component for the sidebar history item
const HistoryItem = ({ title }) => (
  <div className="cursor-pointer px-4 py-2 hover:bg-gray-700">{title}</div>
);

export default HistoryItem;
