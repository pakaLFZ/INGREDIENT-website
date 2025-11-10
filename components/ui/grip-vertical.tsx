"use client"

import { cn } from "@/lib/utils"

interface GripVerticalProps {
  className?: string
  onMouseDown?: (e: React.MouseEvent) => void
  onTouchStart?: (e: React.TouchEvent) => void
  isResizing?: boolean
}

/**
 * Unified GripVertical component for consistent resize handles across the application
 * 
 * Design Guidelines:
 * - Always use this component for resize handles to maintain consistency
 * - Component defaults to full height (h-full) and thin width (w-1)
 * - Clean design without icons, just a thin interactive line
 * - Includes hover states and visual feedback for better UX
 * - Supports both mouse and touch events for mobile compatibility
 * - Override height with className when needed (e.g., for specific panel heights)
 * 
 * Usage:
 * - Place between resizable panels as a drag handle
 * - Handle mouse/touch events in parent component for resize logic
 * - Pass isResizing prop to show active resize state
 * - Use className to override default height when not full height needed
 * 
 * @param className - Additional CSS classes for customization (can override h-full)
 * @param onMouseDown - Mouse event handler for resize start
 * @param onTouchStart - Touch event handler for mobile resize start  
 * @param isResizing - Whether the handle is currently being used for resizing
 */
export function GripVertical({ 
  className, 
  onMouseDown, 
  onTouchStart, 
  isResizing = false 
}: GripVerticalProps) {
  return (
    <div
      className={cn(
        // Default styling: full height, thin width, cursor, background, transitions
        "h-full w-1 bg-border hover:bg-primary/20 cursor-col-resize transition-colors flex-shrink-0 select-none",
        // Active resize state styling
        isResizing && "bg-primary/40",
        className
      )}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    />
  )
}