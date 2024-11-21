'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

import { cn } from '@/lib/utils'

const TooltipProvider = TooltipPrimitive.Provider
const TooltipRoot = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 overflow-visible rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-800 shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className
    )}
    {...props}
  >
    {props.children}
    <TooltipPrimitive.Arrow
      className="fill-white"
      width={8}
      height={4}
      style={{
        filter: 'drop-shadow(0 1px 0 rgb(229 231 235))', // Simulates border for arrow
        marginTop: '-1px', // Adjusts arrow position to overlap with border
      }}
    />
  </TooltipPrimitive.Content>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

// Export components
export { TooltipProvider, TooltipRoot as Tooltip, TooltipTrigger, TooltipContent }