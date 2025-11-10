"use client"

import { Progress } from "@/components/ui/progress"
import { Loader2, AlertCircle } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { PRECOMPUTED_ANALYSIS_RESULTS } from "@/utils/analysisResultsData"

interface FolderAnalysisProgressProps {
    progress: {
        status: 'idle' | 'initializing' | 'analyzing' | 'completed' | 'error'
        progress_percentage: number
        current_step: string
        total_images: number
        processed_images: number
        cached_images: number
        failed_images: number
        start_time?: number
        estimated_completion?: number | null
        errors: (string | { message?: string; timestamp?: string; image_path?: string })[]
    }
    onAnimationComplete?: () => void
}

/**
 * Displays folder analysis progress centered in full component space
 * Shows processed/total images, timing stats, and current state
 */
export function FolderAnalysisProgress({ progress, onAnimationComplete }: FolderAnalysisProgressProps) {
    const { status, progress_percentage, current_step, total_images, processed_images, errors } = progress
    const fallbackTotal = total_images || PRECOMPUTED_ANALYSIS_RESULTS.aggregated_metrics.total_images
    const imageQueue = useMemo(() => {
        if (PRECOMPUTED_ANALYSIS_RESULTS.per_image_metrics?.length) {
            return PRECOMPUTED_ANALYSIS_RESULTS.per_image_metrics.map(metric => metric.filename)
        }

        return Array.from({ length: fallbackTotal }, (_, idx) => `image-${idx + 1}.png`)
    }, [fallbackTotal])

    const [displayedImages, setDisplayedImages] = useState(processed_images)
    const [displayProgress, setDisplayProgress] = useState(progress_percentage)
    const completionNotifiedRef = useRef(false)
    const totalForAnimation = imageQueue.length || fallbackTotal || 1
    const totalDisplayCount = total_images || totalForAnimation
    const isAnimating = status === 'initializing' || status === 'analyzing'
    const currentImageIndex = Math.min(Math.max(displayedImages - 1, 0), imageQueue.length - 1)
    const currentImageName = imageQueue[currentImageIndex] || current_step
    const currentStateText = status === 'completed'
        ? 'Folder analysis complete'
        : `Processing ${currentImageName || 'images'} (${Math.min(displayedImages + 1, totalDisplayCount)} of ${totalDisplayCount})`

    // Keep local counters in sync with incoming progress while never regressing.
    useEffect(() => {
        setDisplayedImages(prev => {
            if (status === 'idle') return 0
            if (status === 'completed') return totalForAnimation
            if (processed_images > prev) return processed_images
            return Math.min(prev, totalForAnimation)
        })
    }, [processed_images, status, totalForAnimation])

    useEffect(() => {
        setDisplayProgress(prev => {
            if (status === 'completed') return 100
            if (status === 'idle') return 0
            if (progress_percentage > prev) return progress_percentage
            const derived = (displayedImages / totalForAnimation) * 100
            return derived > prev ? derived : prev
        })
    }, [progress_percentage, status, displayedImages, totalForAnimation])

    useEffect(() => {
        if (!isAnimating) return

        const interval = setInterval(() => {
            setDisplayedImages(prev => {
                if (prev >= totalForAnimation) {
                    return prev
                }

                return prev + 1
            })
        }, 250)

        return () => clearInterval(interval)
    }, [isAnimating, totalForAnimation])

    useEffect(() => {
        if (!isAnimating) {
            completionNotifiedRef.current = false
            return
        }

        if (displayedImages >= totalForAnimation && !completionNotifiedRef.current) {
            completionNotifiedRef.current = true
            onAnimationComplete?.()
        }
    }, [displayedImages, totalForAnimation, isAnimating, onAnimationComplete])

    useEffect(() => {
        console.log('Progress updated:', { status, progress_percentage, current_step, processed_images, total_images })
    }, [status, progress_percentage, current_step, processed_images, total_images])

    if (status === 'idle') return null

    return (
        <div className="h-full w-full flex items-center justify-center p-8">
            <div className="w-full max-w-2xl space-y-6">
                <div className="flex items-center justify-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="text-lg font-medium">Folder Analysis</span>
                </div>

                <div className="space-y-2">
                    <Progress value={displayProgress} className="h-2" />
                    <div className="text-center text-sm text-muted-foreground">
                        {displayProgress.toFixed(1)}%
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 text-sm">
                    <div className="space-y-1 text-center">
                        <div className="text-muted-foreground">Processed Images</div>
                        <div className="font-medium text-lg">
                            {Math.min(displayedImages, totalDisplayCount)} / {totalDisplayCount}
                        </div>
                    </div>

                    <div className="text-center pt-2 space-y-1">
                        <div className="text-muted-foreground text-sm">Current State</div>
                        <div className="font-medium">{currentStateText}</div>
                    </div>
                </div>

                {errors.length > 0 && (
                    <div className="space-y-2 pt-2 border-t">
                        <div className="flex items-center justify-center gap-2 text-destructive">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Errors</span>
                        </div>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                            {errors.map((error, idx) => (
                                <p key={idx} className="text-xs text-destructive text-center">
                                    {typeof error === 'string' ? error : error.message || JSON.stringify(error)}
                                </p>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
