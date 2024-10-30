import React from 'react'

// Component for displaying the user profile in the sidebar
const UserProfile = ({ session }) => (
  <div className="p-4">
    <div className="flex items-center">
      {/* Light blue background circle with the first character of the user's name */}
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-300 font-bold text-white">
        {session?.user?.name?.charAt(0).toUpperCase() || 'G'}
      </div>
      <span className="ml-2">{session?.user?.name || 'Guest'}</span>
    </div>
  </div>
)

export default UserProfile
