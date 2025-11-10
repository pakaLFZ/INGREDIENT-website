"use client"

import { Progress } from "@/components/ui/progress"
import { Loader2, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"

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
}

/**
 * Displays folder analysis progress centered in full component space
 * Shows processed/total images, timing stats, and current state
 */
export function FolderAnalysisProgress({ progress }: FolderAnalysisProgressProps) {
    const { status, progress_percentage, current_step, total_images, processed_images, start_time, estimated_completion, errors } = progress
    const [elapsedTime, setElapsedTime] = useState(0)

    useEffect(() => {
        if (!start_time || status === 'idle' || status === 'completed') return

        const interval = setInterval(() => {
            setElapsedTime(Date.now() / 1000 - start_time)
        }, 100)

        return () => clearInterval(interval)
    }, [start_time, status])

    if (status === 'idle') return null

    const timePerItem = processed_images > 0 ? elapsedTime / processed_images : 0
    const remainingItems = total_images - processed_images
    const estimatedTimeNeeded = remainingItems * timePerItem

    const formatTime = (seconds: number) => {
        if (seconds < 60) return `${seconds.toFixed(1)}s`
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}m ${secs}s`
    }

    return (
        <div className="h-full w-full flex items-center justify-center p-8">
            <div className="w-full max-w-2xl space-y-6">
                <div className="flex items-center justify-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="text-lg font-medium">Folder Analysis</span>
                </div>

                <div className="space-y-2">
                    <Progress value={progress_percentage} className="h-2" />
                    <div className="text-center text-sm text-muted-foreground">
                        {progress_percentage.toFixed(1)}%
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    <div className="space-y-1">
                        <div className="text-muted-foreground">Processed Images</div>
                        <div className="font-medium text-lg">{processed_images} / {total_images}</div>
                    </div>

                    <div className="space-y-1">
                        <div className="text-muted-foreground">Time per Item</div>
                        <div className="font-medium text-lg">{formatTime(timePerItem)}</div>
                    </div>

                    <div className="space-y-1">
                        <div className="text-muted-foreground">Elapsed Time</div>
                        <div className="font-medium text-lg">{formatTime(elapsedTime)}</div>
                    </div>

                    <div className="space-y-1">
                        <div className="text-muted-foreground">Time Needed</div>
                        <div className="font-medium text-lg">{formatTime(estimatedTimeNeeded)}</div>
                    </div>
                </div>

                <div className="text-center pt-2">
                    <div className="text-muted-foreground text-sm">Current State</div>
                    <div className="font-medium mt-1">{current_step}</div>
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