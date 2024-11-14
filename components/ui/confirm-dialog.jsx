'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

/**
 * ConfirmDialog Component
 * @param {Object} props
 * @param {boolean} props.open - Control the dialog open state
 * @param {function} props.onOpenChange - Callback when dialog open state changes
 * @param {string} props.title - Dialog title
 * @param {string} props.description - Dialog description
 * @param {function} props.onConfirm - Callback when confirm button is clicked
 * @param {function} props.onCancel - Callback when cancel button is clicked
 * @param {string} props.confirmText - Text for confirm button
 * @param {string} props.cancelText - Text for cancel button
 * @param {string} props.confirmVariant - Variant for confirm button (default, destructive)
 * @param {React.ReactNode} props.children - Trigger element
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'default',
  children,
}) {
  // Handle confirm action
  const handleConfirm = () => {
    onConfirm?.()
    onOpenChange?.(false)
  }

  // Handle cancel action
  const handleCancel = () => {
    onCancel?.()
    onOpenChange?.(false)
  }

  // Button variants styling
  const buttonVariants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <button
            onClick={handleCancel}
            className="rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`rounded-md px-4 py-2 text-sm font-medium ${buttonVariants[confirmVariant]}`}
          >
            {confirmText}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
