import { useState, useCallback, useRef } from 'react'

const RAW_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
export const ANALYSIS_SERVICE_BASE_URL = RAW_BACKEND_URL.replace(/\/+$/, '')
export const FOLDER_ANALYSIS_API_BASE = `${ANALYSIS_SERVICE_BASE_URL}/api/analysis/folder`

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

interface DefectData {
    name: string
    count: number
    area: number
    images: number
    color?: string
}

interface FolderAnalysisResults {
    defects: DefectData[]
    defect_statistics: Record<string, any>
    quality_metrics: Record<string, any>
    processing_summary: Record<string, any>
}

/**
 * Hook for managing folder analysis state and API calls
 * Handles progress tracking, results fetching, and error management
 * Includes protection against duplicate calls from React Strict Mode
 */
export function useFolderAnalysis() {
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [taskId, setTaskId] = useState<string | null>(null)
    const [progress, setProgress] = useState<FolderAnalysisProgress>({
        status: 'idle',
        progress_percentage: 0,
        current_step: '',
        total_images: 0,
        processed_images: 0,
        cached_images: 0,
        failed_images: 0,
        errors: []
    })
    const [results, setResults] = useState<FolderAnalysisResults | null>(null)
    const [error, setError] = useState<string | null>(null)
    const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Fetch final results
    const fetchResults = useCallback(async (id: string) => {
        try {
            const response = await fetch(`${FOLDER_ANALYSIS_API_BASE}/result/${id}/`)
            if (!response.ok) throw new Error('Failed to get results')

            const data = await response.json()
            console.log('Raw API response:', data)
            const defectAnalysis = data.results?.defect_analysis || data.defect_analysis || {}
            const extractedResults = {
                defects: defectAnalysis.defects || [],
                defect_statistics: defectAnalysis.defect_summary?.defect_statistics || {},
                quality_metrics: defectAnalysis.average_metrics || {},
                processing_summary: defectAnalysis.processing_summary || {}
            }
            console.log('Extracted results:', extractedResults)
            setResults(extractedResults)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get results')
        }
    }, [])

    // Poll progress updates
    const pollProgress = useCallback(async (id: string) => {
        try {
            const response = await fetch(`${FOLDER_ANALYSIS_API_BASE}/progress/${id}/`)
            if (!response.ok) throw new Error('Failed to get progress')

            const data = await response.json()

            const progressData = data.progress || data
            console.log('Progress status:', progressData.status, progressData)
            setProgress(progressData)

            if (progressData.status === 'completed') {
                console.log('Analysis completed, fetching results...')
                await fetchResults(id)
            } else if (progressData.status === 'initializing' || progressData.status === 'analyzing') {
                pollingTimeoutRef.current = setTimeout(() => pollProgress(id), 1000)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to track progress')
            setProgress(prev => ({ ...prev, status: 'error' }))
        }
    }, [fetchResults])

    // Start folder analysis
    const startAnalysis = useCallback(async (folderPath: string, ignoreCache?: boolean) => {
        try {
            setError(null)
            setProgress({
                status: 'initializing',
                progress_percentage: 0,
                current_step: 'Starting analysis...',
                total_images: 0,
                processed_images: 0,
                cached_images: 0,
                failed_images: 0,
                errors: []
            })

            const response = await fetch(`${FOLDER_ANALYSIS_API_BASE}/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    folder_path: folderPath,
                    skip_cache: ignoreCache,
                    note: 'Folder analysis request'
                })
            })

            if (!response.ok) throw new Error('Failed to start analysis')

            const data = await response.json()
            setTaskId(data.task_id)
            setSessionId(data.session_id)

            pollProgress(data.session_id)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
            setProgress(prev => ({ ...prev, status: 'error' }))
        }
    }, [pollProgress])

    const clearError = useCallback(() => setError(null), [])

    const cleanup = useCallback(() => {
        if (pollingTimeoutRef.current) {
            clearTimeout(pollingTimeoutRef.current)
            pollingTimeoutRef.current = null
        }
    }, [])

    return {
        sessionId,
        taskId,
        progress,
        results,
        error,
        startAnalysis,
        clearError,
        cleanup
    }
}
