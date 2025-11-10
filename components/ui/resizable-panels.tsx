"use client"

import React, { useState, useRef, useCallback, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ResizablePanelsProps {
  topPanel: ReactNode
  bottomPanel: ReactNode
  className?: string
  initialTopHeight?: number // percentage (0-100)
  minTopHeight?: number // percentage (0-100)
  maxTopHeight?: number // percentage (0-100)
  bottomPanelScrollable?: boolean // enable scrolling in bottom panel
  flowMode?: boolean // disable fixed heights and let content flow naturally
  allowParentScroll?: boolean // allow parent to handle overflow scrolling while maintaining resize
}

/**
 * ResizablePanels component for adjustable height sections with horizontal grip
 * 
 * Features:
 * - Drag handle between two panels for height adjustment
 * - Percentage-based height distribution
 * - Min/max height constraints
 * - Touch and mouse support for mobile compatibility
 * - Smooth resizing with visual feedback
 * 
 * Usage:
 * - Wrap two components that need height adjustment
 * - Set initial height distribution with initialTopHeight (default 50%)
 * - Configure constraints with minTopHeight/maxTopHeight
 * 
 * @param topPanel - React component for top section
 * @param bottomPanel - React component for bottom section
 * @param className - Additional CSS classes
 * @param initialTopHeight - Initial top panel height as percentage (default: 50)
 * @param minTopHeight - Minimum top panel height as percentage (default: 20)
 * @param maxTopHeight - Maximum top panel height as percentage (default: 80)
 * @param bottomPanelScrollable - Enable vertical scrolling in bottom panel (default: false)
 * @param flowMode - Disable fixed heights and let content flow naturally (default: false)
 * @param allowParentScroll - Allow parent to handle overflow scrolling while maintaining resize (default: false)
 */
export function ResizablePanels({
  topPanel,
  bottomPanel,
  className,
  initialTopHeight = 50,
  minTopHeight = 20,
  maxTopHeight = 80,
  bottomPanelScrollable = false,
  flowMode = false,
  allowParentScroll = false
}: ResizablePanelsProps) {
  const [topHeight, setTopHeight] = useState(initialTopHeight)
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate new height based on mouse/touch position
  const calculateNewHeight = useCallback((clientY: number) => {
    if (!containerRef.current) return topHeight

    const rect = containerRef.current.getBoundingClientRect()
    const containerHeight = rect.height
    const relativeY = clientY - rect.top
    const newTopHeightPercent = (relativeY / containerHeight) * 100

    // Apply constraints
    return Math.max(minTopHeight, Math.min(maxTopHeight, newTopHeightPercent))
  }, [topHeight, minTopHeight, maxTopHeight])

  // Mouse event handlers
  const handleMouseDown = useCallback(() => {
    setIsResizing(true)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return
    e.preventDefault()
    const newHeight = calculateNewHeight(e.clientY)
    setTopHeight(newHeight)
  }, [isResizing, calculateNewHeight])

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])

  // Touch event handlers
  const handleTouchStart = useCallback(() => {
    setIsResizing(true)
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isResizing || e.touches.length === 0) return
    e.preventDefault()
    const touch = e.touches[0]
    const newHeight = calculateNewHeight(touch.clientY)
    setTopHeight(newHeight)
  }, [isResizing, calculateNewHeight])

  const handleTouchEnd = useCallback(() => {
    setIsResizing(false)
  }, [])

  // Add global event listeners during resize
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isResizing, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  // Flow mode renders content naturally without fixed heights or resizing
  if (flowMode) {
    return (
      <div className={cn("flex flex-col", className)}>
        {/* Top Panel */}
        <div className="flex-shrink-0">
          {topPanel}
        </div>

        {/* Bottom Panel */}
        <div className="flex-shrink-0">
          {bottomPanel}
        </div>
      </div>
    )
  }

  // Normal resizable mode
  return (
    <div ref={containerRef} className={cn("flex flex-col h-full", className)}>
      {/* Top Panel */}
      <div 
        className={allowParentScroll ? "overflow-visible" : "overflow-hidden"}
        style={{ height: `${topHeight}%` }}
      >
        {topPanel}
      </div>

      {/* Resize Handle */}
      <div
        className={cn(
          "w-full h-1 bg-border hover:bg-primary/20 cursor-row-resize transition-colors flex-shrink-0 select-none",
          isResizing && "bg-primary/40"
        )}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      />

      {/* Bottom Panel */}
      <div 
        className={cn(
          "flex-1",
          allowParentScroll ? "overflow-visible" : 
          bottomPanelScrollable ? "overflow-y-auto -webkit-overflow-scrolling-touch" : "overflow-hidden"
        )}
        style={{ height: `${100 - topHeight}%` }}
      >
        {bottomPanel}
      </div>
    </div>
  )
}