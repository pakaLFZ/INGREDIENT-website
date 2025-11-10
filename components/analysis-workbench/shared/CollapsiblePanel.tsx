'use client'

import { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronRight, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CollapsiblePanelProps {
  isOpen: boolean
  width: number
  title: string
  onClose: () => void
  children: ReactNode
  className?: string
}

/**
 * Reusable collapsible panel component with header and content area
 * Provides consistent styling for resizable panels with title and close button
 */
export function CollapsiblePanel({
  isOpen,
  width,
  title,
  onClose,
  children,
  className
}: CollapsiblePanelProps) {
  return (
    <div
      className={cn(
        "transition-all duration-300 ease-in-out",
        isOpen ? "opacity-100" : "opacity-0 w-0",
        className
      )}
      style={{ width: isOpen ? width : 0 }}
    >
      <Card className="h-full m-4 ml-0">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="font-medium text-sm">{title}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4 space-y-4">
          {children}
        </div>
      </Card>
    </div>
  )
}