"use client"

import { useState, useRef, useEffect, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { GripVertical } from "@/components/ui/grip-vertical"

interface ResizablePanelProps {
  children: ReactNode
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
  className?: string
}

/**
 * Resizable panel component with drag functionality for adjusting width
 * Includes proper overflow handling and minimum/maximum width constraints
 * @param children - Content to display inside the resizable panel
 * @param defaultWidth - Initial width of the panel (default: 320px)
 * @param minWidth - Minimum allowed width (default: 200px for mobile support)
 * @param maxWidth - Maximum allowed width (default: 600px)
 * @param className - Additional CSS classes
 */
export function ResizablePanel({
  children,
  defaultWidth = 320,
  minWidth = 200,
  maxWidth = 1200,
  className,
}: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth)
  const [isResizing, setIsResizing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const newWidth = e.clientX - containerRect.left
      
      // Ensure width constraints
      const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
      setWidth(constrainedWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }

    const handleMouseDown = () => {
      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"
    }

    if (isResizing) {
      handleMouseDown()
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [isResizing, minWidth, maxWidth])

  // Handle touch events for mobile support
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!isResizing || !containerRef.current) return
      
      e.preventDefault()
      const touch = e.touches[0]
      const containerRect = containerRef.current.getBoundingClientRect()
      const newWidth = touch.clientX - containerRect.left
      
      const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
      setWidth(constrainedWidth)
    }

    const handleTouchEnd = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener("touchmove", handleTouchMove, { passive: false })
      document.addEventListener("touchend", handleTouchEnd)
    }

    return () => {
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isResizing, minWidth, maxWidth])

  return (
    <div ref={containerRef} className={cn("relative flex h-full", className)}>
      <div 
        ref={panelRef} 
        className="flex flex-col h-full overflow-hidden"
        style={{ width: `${width}px`, minWidth: `${minWidth}px`, maxWidth: `${maxWidth}px` }}
      >
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
      <GripVertical
        onMouseDown={() => setIsResizing(true)}
        onTouchStart={() => setIsResizing(true)}
        isResizing={isResizing}
      />
    </div>
  )
}
