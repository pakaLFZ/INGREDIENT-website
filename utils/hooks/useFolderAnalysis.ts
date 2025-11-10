import { useState, useCallback, useRef } from 'react'
import { PRECOMPUTED_ANALYSIS_RESULTS } from '@/utils/analysisResultsData'

interface FolderAnalysisProgress {
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

interface ImageCellMetrics {
    image_id: number
    filename: string
    rbc_count: number
    wbc_count: number
    total_cells: number
    avg_rbc_area: number
    avg_wbc_area: number
    avg_rbc_shape_dev: number
}

interface AggregatedMetrics {
    total_images: number
    total_rbc: number
    total_wbc: number
    total_cells: number
    avg_rbc_area: number
    avg_wbc_area: number
    avg_rbc_shape_dev: number
}

interface ProcessingSummary {
    folder_path: string
    ignore_cache: boolean
    analyzed_at: string
    duration_seconds: number
    total_images: number
}

export interface FolderAnalysisResultsData {
    aggregated_metrics: AggregatedMetrics
    per_image_metrics: ImageCellMetrics[]
    processing_summary: ProcessingSummary
}

const DEFAULT_PROGRESS: FolderAnalysisProgress = {
    status: 'idle',
    progress_percentage: 0,
    current_step: '',
    total_images: 0,
    processed_images: 0,
    cached_images: 0,
    failed_images: 0,
    errors: []
}


const ANIMATION_DURATION_MS = 10000

/**
 * Hook for managing folder analysis state using static data
 * Simulates progress updates and produces an aggregate report of cell metrics
 */
export function useFolderAnalysis() {
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [taskId, setTaskId] = useState<string | null>(null)
    const [progress, setProgress] = useState<FolderAnalysisProgress>(DEFAULT_PROGRESS)
    const [results, setResults] = useState<FolderAnalysisResultsData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const lastFolderPathRef = useRef<string | null>(null)
    const lastIgnoreCacheRef = useRef<boolean>(false)

    const finalizeAnalysis = useCallback((folderPath: string, ignoreCache: boolean) => {
        const totalImages = PRECOMPUTED_ANALYSIS_RESULTS.aggregated_metrics.total_images

        const updatedSummary: ProcessingSummary = {
            folder_path: folderPath,
            ignore_cache: ignoreCache,
            analyzed_at: new Date().toISOString(),
            duration_seconds: ANIMATION_DURATION_MS / 1000,
            total_images: totalImages
        }

        setResults({
            aggregated_metrics: PRECOMPUTED_ANALYSIS_RESULTS.aggregated_metrics,
            per_image_metrics: PRECOMPUTED_ANALYSIS_RESULTS.per_image_metrics,
            processing_summary: updatedSummary
        })

        setProgress(prev => {
            if (prev.status === 'completed') {
                return prev
            }

            return {
                status: 'completed',
                progress_percentage: 100,
                current_step: 'Folder analysis complete',
                total_images: totalImages,
                processed_images: totalImages,
                cached_images: ignoreCache ? 0 : totalImages,
                failed_images: 0,
                estimated_completion: Date.now(),
                errors: []
            }
        })
    }, [])

    const scheduleAutoComplete = useCallback((folderPath: string, ignoreCache: boolean) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
            timeoutRef.current = null
            finalizeAnalysis(folderPath, ignoreCache)
        }, ANIMATION_DURATION_MS)
    }, [finalizeAnalysis])

    const startAnalysis = useCallback((folderPath: string, ignoreCache: boolean = false) => {
        try {
            setError(null)
            setResults(null)
            lastFolderPathRef.current = folderPath
            lastIgnoreCacheRef.current = ignoreCache

            const analysisSessionId = `session-${Date.now()}`
            const analysisTaskId = `task-${analysisSessionId}`

            setSessionId(analysisSessionId)
            setTaskId(analysisTaskId)

            const totalImages = PRECOMPUTED_ANALYSIS_RESULTS.aggregated_metrics.total_images
            const firstImage = PRECOMPUTED_ANALYSIS_RESULTS.per_image_metrics[0]?.filename

            setProgress({
                status: 'analyzing',
                progress_percentage: 0,
                current_step: firstImage ? `Processing ${firstImage}` : `Starting analysis of ${totalImages} images...`,
                total_images: totalImages,
                processed_images: 0,
                cached_images: ignoreCache ? 0 : totalImages,
                failed_images: 0,
                estimated_completion: Date.now() + ANIMATION_DURATION_MS,
                errors: []
            })

            scheduleAutoComplete(folderPath, ignoreCache)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to analyze folder')
            setProgress(prev => ({ ...prev, status: 'error' }))
        }
    }, [scheduleAutoComplete])

    const forceComplete = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }

        const folderPath = lastFolderPathRef.current ?? PRECOMPUTED_ANALYSIS_RESULTS.processing_summary.folder_path
        const ignoreCache = lastIgnoreCacheRef.current
        finalizeAnalysis(folderPath, ignoreCache)
    }, [finalizeAnalysis])

    const clearError = useCallback(() => setError(null), [])

    const cleanup = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
    }, [])

    return {
        sessionId,
        taskId,
        progress,
        results,
        error,
        startAnalysis,
        forceComplete,
        clearError,
        cleanup
    }
}
