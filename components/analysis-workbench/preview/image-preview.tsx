"use client"

import React, { useState, useCallback, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { ImageData } from "@/utils/staticDataLoader"
import { getImageFileUrl } from "@/utils/staticDataLoader"
import { ImageDisplay } from "./image-display"
import { ControlPanel } from "./control-panel"
import { ImageMask } from "./types"

interface ImagePreviewProps {
    selectedImage: ImageData | null
    edgeQualityMasks?: any[]
    isProgressComplete?: boolean
}

/**
 * Modern image preview component with integrated controls panel
 * Gets data directly from AnalysisSlice via Redux or from props
 * @param selectedImage - Currently selected image data
 * @param edgeQualityMasks - Optional masks passed as prop
 * @param isProgressComplete - Whether the progress bar has finished loading
 */
export function ImagePreview({
    selectedImage,
    edgeQualityMasks: propMasks,
    isProgressComplete = true
}: ImagePreviewProps) {
    const dispatch = useAppDispatch()

    // Get analysis data directly from Redux store
    const { currentAnalysis, edgeQualityMasks: reduxMasks } = useAppSelector(state => state.analysis)

    // Use prop masks if available, otherwise fall back to Redux
    const edgeQualityMasks = propMasks || reduxMasks

    // Local state for mask management to allow immediate UI updates while syncing with Redux
    // This enables real-time thickness/opacity changes without waiting for Redux updates
    const [localMasks, setLocalMasks] = useState<ImageMask[]>(edgeQualityMasks)

    // Sync localMasks with edgeQualityMasks from Redux when new analysis results arrive
    // This ensures the local state stays in sync with the global state
    useEffect(() => {
        setLocalMasks(edgeQualityMasks)
    }, [edgeQualityMasks])

    const isAnalysisComplete = currentAnalysis?.taskStatus === 'completed' || currentAnalysis?.task?.status === 'done' || currentAnalysis?.task?.status === 'completed'
    const isComprehensive = currentAnalysis?.type === 'Comprehensive Analysis' && isAnalysisComplete
    const hasMaskData = edgeQualityMasks.length > 0
    const shouldShowMaskControls = hasMaskData && (isComprehensive || !currentAnalysis) && isProgressComplete
    const shouldShowMasks = hasMaskData && isProgressComplete

    console.log('[ImagePreview] Debug:', {
        currentAnalysis,
        taskStatus: currentAnalysis?.taskStatus,
        taskTaskStatus: currentAnalysis?.task?.status,
        isAnalysisComplete,
        isComprehensive,
        hasMaskData,
        shouldShowMaskControls,
        shouldShowMasks,
        isProgressComplete,
        edgeQualityMasksLength: edgeQualityMasks.length,
        localMasksLength: localMasks.length
    })


    const handleToggleMask = useCallback((maskId: string) => {
        setLocalMasks(prev => {
            return prev.map(mask =>
                mask.id === maskId ? { ...mask, visible: !mask.visible } : mask
            )
        })
    }, [])

    const handleExportMask = useCallback((mask: ImageMask) => {
        const link = document.createElement('a')
        link.href = mask.url
        link.download = `${mask.name.toLowerCase().replace(/\s+/g, '_')}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }, [])

    // Handle mask property updates (thickness, opacity, etc.)
    // Updates local state immediately for responsive UI
    const handleUpdateMask = useCallback((maskId: string, updates: Partial<ImageMask>) => {
        setLocalMasks(prev => prev.map(mask =>
            mask.id === maskId ? { ...mask, ...updates } : mask
        ))
    }, [])

    const getCurrentImageUrl = () => {
        if (selectedImage) return getImageFileUrl(selectedImage.image_id)
        return null
    }

    const currentImageUrl = getCurrentImageUrl()

    return (
        <div className="flex-1 flex h-full image-preview-container">
            <ImageDisplay
                selectedImage={selectedImage}
                currentImageUrl={currentImageUrl}
                masks={localMasks}
                hasEdgeQualityMasks={shouldShowMasks}
            />

            <ControlPanel
                hasEdgeQualityMasks={shouldShowMaskControls}
                masks={localMasks}
                onToggleMask={handleToggleMask}
                onExportMask={handleExportMask}
                onUpdateMask={handleUpdateMask}
            />
        </div>
    )
}
