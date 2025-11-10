"use client"

import React, { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { GripVertical } from "@/components/ui/grip-vertical"
import { MaskVisibilityControls } from "../controls/MaskVisibilityControls"
import { ImageMask } from "./types"

interface ControlPanelProps {
    hasEdgeQualityMasks: boolean
    masks: ImageMask[]
    onToggleMask: (maskId: string) => void
    onExportMask: (mask: ImageMask) => void
    onUpdateMask: (maskId: string, updates: Partial<ImageMask>) => void
}

/**
 * Compact resizable control panel for mask visibility and exports
 * Features minimal design with integrated resize handle and clean controls
 */
export function ControlPanel({
    hasEdgeQualityMasks,
    masks,
    onToggleMask,
    onExportMask,
    onUpdateMask
}: ControlPanelProps) {
    const [isPanelOpen, setIsPanelOpen] = useState(true)
    const [panelWidth, setPanelWidth] = useState(280)
    const [isResizing, setIsResizing] = useState(false)

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        setIsResizing(true)
        e.preventDefault()
    }, [])

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing) return
        const rect = (e.target as HTMLElement).closest('.image-preview-container')?.getBoundingClientRect()
        if (rect) {
            const newWidth = rect.right - e.clientX
            setPanelWidth(Math.max(240, Math.min(480, newWidth)))
        }
    }, [isResizing])

    const handleMouseUp = useCallback(() => {
        setIsResizing(false)
    }, [])

    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
            return () => {
                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
            }
        }
    }, [isResizing, handleMouseMove, handleMouseUp])

    console.log('[ControlPanel] Debug:', {
        hasEdgeQualityMasks,
        masksLength: masks.length,
        willRender: hasEdgeQualityMasks
    })

    if (!hasEdgeQualityMasks) return null

    return (
        <div className="flex h-auto">
            {isPanelOpen && (
                <GripVertical
                    className="h-auto"
                    onMouseDown={handleMouseDown}
                    isResizing={isResizing}
                />
            )}

            {isPanelOpen ? (
                <div 
                    className="bg-background border-l flex flex-col"
                    style={{ width: panelWidth }}
                >
                    <div className="flex items-center justify-between p-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsPanelOpen(false)}
                            className="h-6 w-6"
                        >
                            <ChevronLeft className="h-4 w-4 rotate-180" />
                        </Button>
                    </div>
                    <div className="overflow-y-auto p-2 space-y-4">
                        <MaskVisibilityControls
                            masks={masks}
                            onToggleMask={onToggleMask}
                            onExportMask={onExportMask}
                            onUpdateMask={onUpdateMask}
                        />
                    </div>
                </div>
            ) : (
                <div className="p-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsPanelOpen(true)}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    )
}