"use client"

import { cn } from "@/lib/utils"

interface GripHorizontalProps {
  className?: string
  onMouseDown?: (e: React.MouseEvent) => void
  onTouchStart?: (e: React.TouchEvent) => void
  isResizing?: boolean
}

/**
 * Unified GripHorizontal component for consistent horizontal resize handles across the application
 * 
 * Design Guidelines:
 * - Always use this component for horizontal resize handles to maintain consistency
 * - Component defaults to full width (w-full) and thin height (h-1)
 * - Clean design without icons, just a thin interactive line
 * - Includes hover states and visual feedback for better UX
 * - Supports both mouse and touch events for mobile compatibility
 * - Override width with className when needed (e.g., for specific panel widths)
 * 
 * Usage:
 * - Place between vertically stacked resizable panels as a drag handle
 * - Handle mouse/touch events in parent component for resize logic
 * - Pass isResizing prop to show active resize state
 * - Use className to override default width when not full width needed
 * 
 * @param className - Additional CSS classes for customization (can override w-full)
 * @param onMouseDown - Mouse event handler for resize start
 * @param onTouchStart - Touch event handler for mobile resize start  
 * @param isResizing - Whether the handle is currently being used for resizing
 */
export function GripHorizontal({ 
  className, 
  onMouseDown, 
  onTouchStart, 
  isResizing = false 
}: GripHorizontalProps) {
  return (
    <div
      className={cn(
        // Default styling: full width, thin height, cursor, background, transitions
        "w-full h-1 bg-border hover:bg-primary/20 cursor-row-resize transition-colors flex-shrink-0 select-none",
        // Active resize state styling
        isResizing && "bg-primary/40",
        className
      )}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    />
  )
}