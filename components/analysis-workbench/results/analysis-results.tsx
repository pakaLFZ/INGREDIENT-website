"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loader2, Download, ImageDown, Table } from "lucide-react"
import { downloadJson } from "./downloaders/download-json"
import { downloadPngFromCanvas } from "./downloaders/download-png"
import { downloadCompositePng } from "./downloaders/download-png-composite"
import { downloadPreviewSnapshot } from "./downloaders/download-preview-snapshot"
import { downloadCsv } from "./downloaders/download-csv"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { EmptyState } from "./components/EmptyState"
import { FeaturesTable } from "./components/FeaturesTable"
import { useTaskPolling } from "@/hooks/useTaskPolling"

interface Feature {
  name: string
  description: string
  value: number
}

interface AnalysisResultsProps {
  analysisResults: any
  currentAnalysis: any
  fakeProgressToken?: number | null
}

/**
 * Component for displaying analysis results in standardized feature format
 * Shows analysis progress when running and feature table when completed
 *
 * @param analysisResults - Results with features array
 * @param currentAnalysis - Current analysis status
 */
interface AnalysisResultsProps {
  analysisResults: any
  currentAnalysis: any
  fakeProgressToken?: number | null
  isProgressComplete?: boolean
  onProgressComplete?: (isComplete: boolean) => void
}

export function AnalysisResults({ analysisResults, currentAnalysis, fakeProgressToken, isProgressComplete = true, onProgressComplete }: AnalysisResultsProps) {
  // Derive taskId when available from currentAnalysis (supports multiple sources)
  const taskId: string | undefined = useMemo(() => {
    return currentAnalysis?.task_id || currentAnalysis?.taskId || currentAnalysis?.id || undefined
  }, [currentAnalysis])

  // Poll backend task; auto-fetch final result when done
  const { status, progress, step, errorMessage, result } = useTaskPolling(taskId || null)

  // Backward compatibility: prefer new `result` from /result endpoint; fallback to prop
  const effectiveResults = result || analysisResults
  const features: Feature[] = effectiveResults?.features || []

  const isAnalysisRunning = (currentAnalysis?.taskStatus === 'running' ||
                             currentAnalysis?.taskStatus === 'pending' ||
                             currentAnalysis?.taskStatus === 'processing' ||
                             currentAnalysis?.taskStatus === 'queued') ||
                            status === 'polling'

  const [fakeProgressState, setFakeProgressState] = useState({ active: false, value: 0 })
  const fakeProgressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const fakeProgressTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (fakeProgressIntervalRef.current) {
        clearInterval(fakeProgressIntervalRef.current)
      }
      if (fakeProgressTimeoutRef.current) {
        clearTimeout(fakeProgressTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (fakeProgressIntervalRef.current) {
      clearInterval(fakeProgressIntervalRef.current)
      fakeProgressIntervalRef.current = null
    }
    if (fakeProgressTimeoutRef.current) {
      clearTimeout(fakeProgressTimeoutRef.current)
      fakeProgressTimeoutRef.current = null
    }

    if (!fakeProgressToken) {
      setFakeProgressState({ active: false, value: 0 })
      return
    }

    setFakeProgressState({ active: true, value: 5 })

    fakeProgressIntervalRef.current = setInterval(() => {
      setFakeProgressState(prev => {
        if (!prev.active) return prev
        const increment = Math.random() * 18 + 5
        const nextValue = Math.min(95, prev.value + increment)
        return { active: true, value: nextValue }
      })
    }, 350)

    fakeProgressTimeoutRef.current = setTimeout(() => {
      if (fakeProgressIntervalRef.current) {
        clearInterval(fakeProgressIntervalRef.current)
        fakeProgressIntervalRef.current = null
      }
      setFakeProgressState({ active: false, value: 100 })
      onProgressComplete?.(true)
    }, 4200)

    return () => {
      if (fakeProgressIntervalRef.current) {
        clearInterval(fakeProgressIntervalRef.current)
        fakeProgressIntervalRef.current = null
      }
      if (fakeProgressTimeoutRef.current) {
        clearTimeout(fakeProgressTimeoutRef.current)
        fakeProgressTimeoutRef.current = null
      }
    }
  }, [fakeProgressToken])

  const showProgressState = isAnalysisRunning || fakeProgressState.active
  const progressiveValue = fakeProgressState.active ? fakeProgressState.value : progress
  const fakeProgressNarrative = useMemo(() => {
    if (!fakeProgressState.active) return null
    const value = fakeProgressState.value
    if (value < 25) {
      return {
        headline: 'Initializing segmentation pipeline',
        detail: 'Calibrating preview masks and loading kernels'
      }
    }
    if (value < 50) {
      return {
        headline: 'Recomputing contour candidates',
        detail: 'Extracting fresh edges and morphology cues'
      }
    }
    if (value < 75) {
      return {
        headline: 'Updating feature cache',
        detail: 'Regenerating per-cell statistics for export'
      }
    }
    return {
      headline: 'Finalizing segmentation snapshot',
      detail: 'Syncing overlays and validating measurements'
    }
  }, [fakeProgressState])

  const progressHeadline = fakeProgressState.active
    ? fakeProgressNarrative?.headline || 'Refreshing segmentation cache'
    : currentAnalysis?.taskStatus === 'queued'
      ? 'Analysis queued...'
      : 'Analyzing image...'
  const progressDetails = fakeProgressState.active
    ? `${fakeProgressNarrative?.detail || 'Please wait'} (${Math.round(fakeProgressState.value)}% complete)`
    : (step ? `${step} (${progress}%)` : (currentAnalysis?.taskStatus === 'queued' ? 'Waiting for next slot...' : 'Processing image...'))

  const handleDownload = () => downloadJson(analysisResults)

  const handleDownloadPng = async () => {
    const canvas = document.querySelector<HTMLCanvasElement>('#analysis-render-canvas')
    if (canvas) return downloadPngFromCanvas('#analysis-render-canvas')

    // Fallback: compose <img> + SVG masks from the preview
    // Try to detect image and svg in preview container
    // Snapshot whatever is plotted in the preview at original pixels
    await downloadPreviewSnapshot('.image-preview-container')
  }

  const handleDownloadCsv = () => downloadCsv(features)

  return (
    <div className="p-3 space-y-3 h-full">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="text-sm font-medium text-gray-900">Analysis Results</h3>
        <div className="flex items-center gap-2">
          {analysisResults && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-7 px-2"
                title="Download JSON"
              >
                <Download className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownloadPng}
                className="h-7 px-2"
                title="Download PNG"
              >
                <ImageDown className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownloadCsv}
                className="h-7 px-2"
                title="Download CSV"
              >
                <Table className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
          {currentAnalysis && (
            <Badge variant="outline" className="text-xs">
              {(currentAnalysis.taskStatus === 'running' || currentAnalysis.taskStatus === 'processing') &&
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
              {currentAnalysis.taskStatus === 'completed' ? 'Completed' :
               currentAnalysis.taskStatus === 'running' ? 'Running' :
               currentAnalysis.taskStatus === 'processing' ? 'Processing' :
               currentAnalysis.taskStatus === 'pending' || currentAnalysis.taskStatus === 'queued' ? 'Queued' :
               currentAnalysis.taskStatus === 'failed' ? 'Failed' :
               currentAnalysis.taskStatus === 'cancelled' ? 'Cancelled' : 'Unknown'}
            </Badge>
          )}
        </div>
      </div>

      {showProgressState && (
        <div className="text-center py-6 space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            <span className="font-medium text-gray-600">{progressHeadline}</span>
          </div>
          <div className="max-w-xs mx-auto space-y-1">
            <Progress value={Math.min(100, Math.round(progressiveValue || 0))} />
            <div className="text-[11px] text-gray-500">{progressDetails}</div>
          </div>
          {status === 'error' && !fakeProgressState.active && errorMessage && (
            <div className="text-xs text-red-500 mt-1">{errorMessage}</div>
          )}
        </div>
      )}

      {effectiveResults && !fakeProgressState.active ? (
        <div className="space-y-3 max-w-[900px] mx-auto pb-4">
          <FeaturesTable features={features} />
        </div>
      ) : (!fakeProgressState.active ? (
        <EmptyState currentAnalysis={currentAnalysis} />
      ) : null)}
    </div>
  )
}
