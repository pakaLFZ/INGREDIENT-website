"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { FOLDER_ANALYSIS_API_BASE, useFolderAnalysis } from "@/utils/hooks/useFolderAnalysis"
import { FolderAnalysisProgress } from "./folder-analysis-progress"
import { FolderAnalysisResults } from "./folder-analysis-results"
import { EmptyState } from "../results"

interface FolderAnalysisViewProps {
    folderPath: string | null
    ignoreCache?: boolean
    onBack?: () => void
    onAnalysisComplete?: () => void
}

/**
 * Main folder analysis view component
 * Automatically starts analysis when folderPath is provided
 * Shows progress during analysis and results when complete
 * Includes protection against React Strict Mode double-mounting
 */
export function FolderAnalysisView({ folderPath, ignoreCache, onBack, onAnalysisComplete }: FolderAnalysisViewProps) {
    const { sessionId, progress, results, error, startAnalysis, cleanup } = useFolderAnalysis()
    const lastFolderPathRef = useRef<string | null>(null)
    const lastIgnoreCacheRef = useRef<boolean | undefined>(undefined)

    useEffect(() => {
        if (folderPath && (folderPath !== lastFolderPathRef.current || ignoreCache !== lastIgnoreCacheRef.current) && progress.status === 'idle') {
            lastFolderPathRef.current = folderPath
            lastIgnoreCacheRef.current = ignoreCache
            startAnalysis(folderPath, ignoreCache)
        }
    }, [folderPath, ignoreCache, startAnalysis, progress.status])

    useEffect(() => {
        if ((progress.status === 'completed' || error) && onAnalysisComplete) {
            onAnalysisComplete()
        }
    }, [progress.status, error, onAnalysisComplete])

    useEffect(() => {
        return () => {
            cleanup()
        }
    }, [cleanup])

    const handleDownload = async () => {
        if (!sessionId) return
        try {
            const response = await fetch(`${FOLDER_ANALYSIS_API_BASE}/result/${sessionId}/`)
            if (!response.ok) throw new Error('Failed to download results')
            const data = await response.json()
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `folder-analysis-${sessionId}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        } catch (err) {
            console.error('Download failed:', err)
        }
    }

    const renderContent = () => {
        if (!folderPath) {
            return <EmptyState message="Select a folder to start analysis" />
        }

        if (error) {
            return <EmptyState message={`Error: ${error}`} />
        }

        if (progress.status === 'initializing' || progress.status === 'analyzing') {
            return <FolderAnalysisProgress progress={progress} />
        }

        if (progress.status === 'completed' && results) {
            return <FolderAnalysisResults results={results} sessionId={sessionId || undefined} />
        }

        return <EmptyState message="Preparing folder analysis..." />
    }

    return (
        <div className="h-full flex flex-col">
            {onBack && (
                <div className="flex-none p-3 border-b flex items-center justify-between">
                    <Button
                        onClick={onBack}
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Images
                    </Button>
                    {progress.status === 'completed' && sessionId && (
                        <Button
                            onClick={handleDownload}
                            variant="outline"
                            size="sm"
                        >
                            Download
                        </Button>
                    )}
                </div>
            )}
            <div className="flex-1 overflow-y-auto">
                {renderContent()}
            </div>
        </div>
    )
}
