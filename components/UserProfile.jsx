'use client'

import React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'

// Component for displaying the user profile in the sidebar with dropdown menu
const UserProfile = ({ session }) => {
  // Handler for logout action
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <div className="p-4">
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none">
          <div className="flex cursor-pointer items-center rounded-lg p-2 transition-colors duration-200 hover:bg-gray-100">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-blue-300 text-white">
                {session?.user?.name?.charAt(0).toUpperCase() || 'G'}
              </AvatarFallback>
            </Avatar>
            <span className="ml-2">{session?.user?.name || 'Guest'}</span>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <div className="px-2 py-1.5 text-sm">
            <div className="font-medium">{session?.user?.name || 'Guest'}</div>
            <div className="text-xs text-muted-foreground">
              {session?.user?.email || 'guest@example.com'}
            </div>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem className="cursor-pointer text-red-600" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default UserProfile
