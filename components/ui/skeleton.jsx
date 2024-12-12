import { cn } from '@/lib/utils'

/**
 * Skeleton component that mimics shadcn-ui's implementation
 * Used to show a placeholder while content is loading
 *
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Child elements
 * @returns {JSX.Element} Skeleton component with shimmer effect
 */
const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'relative isolate overflow-hidden rounded-md bg-muted before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:border-t before:border-muted/20 before:bg-gradient-to-r before:from-transparent before:via-muted-foreground/10 before:to-transparent',
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
