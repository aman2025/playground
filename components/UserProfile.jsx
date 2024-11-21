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
import { LogOut, ChevronsUpDown } from 'lucide-react'
import { signOut } from 'next-auth/react'

// Component for displaying the user profile in the sidebar with dropdown menu
const UserProfile = ({ session }) => {
  // Handler for logout action
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <div className="px-3 py-2">
      <DropdownMenu>
        <DropdownMenuTrigger className="w-full focus:outline-none">
          <div
            className="flex cursor-pointer items-center justify-between rounded-lg border 
                        border-gray-200 p-1.5
                        transition-all duration-200 ease-in-out
                        hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-300 font-medium text-white">
                  {session?.user?.name?.charAt(0).toUpperCase() || 'G'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {session?.user?.name || 'Guest'}
              </span>
            </div>
            <ChevronsUpDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-[232px] border-gray-200 bg-white" align="end">
          <div className="px-2 py-1.5 text-sm">
            <div className="font-medium">{session?.user?.name || 'Guest'}</div>
            <div className="text-xs text-gray-400">
              {session?.user?.email || 'guest@example.com'}
            </div>
          </div>

          <DropdownMenuSeparator className="bg-gray-200" />

          <DropdownMenuItem
            className="cursor-pointer text-gray-500 transition-colors duration-200
                       focus:bg-gray-100 focus:text-gray-500"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default UserProfile
